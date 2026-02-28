'use client';

import { useState, useEffect } from 'react';
import { checkTimeConflict } from '@/lib/devotionService';
import styles from './Modal.module.css';

/**
 * 編輯紀錄時長 Modal
 * 
 * Props:
 *  - isOpen: 是否開啟
 *  - onClose: 關閉回調
 *  - onSubmit: 提交回調 ({ startTime, endTime, totalDuration, content })
 *  - record: 要編輯的紀錄
 *  - userId: 使用者 ID（衝突檢查用）
 */
export default function EditDurationModal({ isOpen, onClose, onSubmit, record, userId }) {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [conflictWarning, setConflictWarning] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // 載入現有紀錄資料
    useEffect(() => {
        if (isOpen && record) {
            const startDate = record.start_time?.toDate?.()
                ? record.start_time.toDate()
                : new Date(record.start_time);
            const endDate = record.end_time?.toDate?.()
                ? record.end_time.toDate()
                : new Date(record.end_time);

            setDate(startDate.toISOString().split('T')[0]);
            setStartTime(
                `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`
            );
            setEndTime(
                `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
            );
            setContent(record.content || '');
            setError('');
            setConflictWarning('');
        }
    }, [isOpen, record]);

    const calculateDuration = () => {
        const start = new Date(`${date}T${startTime}`);
        const end = new Date(`${date}T${endTime}`);
        return Math.max(0, Math.floor((end - start) / 1000));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setConflictWarning('');

        const duration = calculateDuration();
        if (duration <= 0) {
            setError('結束時間必須晚於開始時間');
            return;
        }

        const startDT = new Date(`${date}T${startTime}`);
        const endDT = new Date(`${date}T${endTime}`);

        setSubmitting(true);

        try {
            // 衝突檢查（排除自身）
            const conflicts = await checkTimeConflict(userId, startDT, endDT, record._docId);
            if (conflicts.length > 0) {
                setConflictWarning(`此時段與 ${conflicts.length} 筆現有紀錄重疊，仍要儲存嗎？`);
                if (!conflictWarning) {
                    setSubmitting(false);
                    return;
                }
            }

            await onSubmit({
                startTime: startDT.toISOString(),
                endTime: endDT.toISOString(),
                totalDuration: duration,
                content,
            });

            onClose();
        } catch (err) {
            setError('更新失敗：' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>編輯靈修紀錄</h2>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.body}>
                        <div className={styles.field}>
                            <label>日期</label>
                            <input
                                type="date"
                                className="input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.timeRow}>
                            <div className={styles.field}>
                                <label>開始時間</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label>結束時間</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.durationPreview}>
                            時長：{Math.floor(calculateDuration() / 60)} 分鐘
                        </div>

                        <div className={styles.field}>
                            <label>心得</label>
                            <textarea
                                className="textarea"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="寫下你的靈修心得..."
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}
                        {conflictWarning && (
                            <div className={styles.warning}>
                                ⚠️ {conflictWarning}
                            </div>
                        )}
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            取消
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? '處理中...' : conflictWarning ? '確認儲存' : '儲存變更'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
