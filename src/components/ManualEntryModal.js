'use client';

import { useState, useEffect } from 'react';
import { checkTimeConflict } from '@/lib/devotionService';
import styles from './Modal.module.css';

/**
 * 手動補錄 Modal
 * 
 * Props:
 *  - isOpen: 是否開啟
 *  - onClose: 關閉回調
 *  - onSubmit: 提交回調 ({ startTime, endTime, totalDuration, content })
 *  - userId: 使用者 ID（衝突檢查用）
 */
export default function ManualEntryModal({ isOpen, onClose, onSubmit, userId }) {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [minutes, setMinutes] = useState('');
    const [content, setContent] = useState('');
    const [mode, setMode] = useState('range'); // 'range' | 'minutes'
    const [error, setError] = useState('');
    const [conflictWarning, setConflictWarning] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // 重設表單
    useEffect(() => {
        if (isOpen) {
            const today = new Date().toISOString().split('T')[0];
            setDate(today);
            setStartTime('06:00');
            setEndTime('06:30');
            setMinutes('30');
            setContent('');
            setError('');
            setConflictWarning('');
        }
    }, [isOpen]);

    // 計算時長
    const calculateDuration = () => {
        if (mode === 'minutes') {
            return parseInt(minutes) * 60 || 0;
        }
        const start = new Date(`${date}T${startTime}`);
        const end = new Date(`${date}T${endTime}`);
        return Math.max(0, Math.floor((end - start) / 1000));
    };

    // 驗證並檢查衝突
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setConflictWarning('');

        const duration = calculateDuration();
        if (duration <= 0) {
            setError('結束時間必須晚於開始時間');
            return;
        }

        let startDT, endDT;
        if (mode === 'range') {
            startDT = new Date(`${date}T${startTime}`);
            endDT = new Date(`${date}T${endTime}`);
        } else {
            startDT = new Date(`${date}T${startTime}`);
            endDT = new Date(startDT.getTime() + duration * 1000);
        }

        setSubmitting(true);

        try {
            // 衝突檢查
            const conflicts = await checkTimeConflict(userId, startDT, endDT);
            if (conflicts.length > 0) {
                setConflictWarning(`此時段與 ${conflicts.length} 筆現有紀錄重疊，仍要新增嗎？`);
                // 若已有警告，第二次提交才真正儲存
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
            setError('新增失敗：' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>新增靈修紀錄</h2>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.body}>
                        {/* 日期 */}
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

                        {/* 模式切換 */}
                        <div className={styles.modeSwitch}>
                            <button
                                type="button"
                                className={`${styles.modeBtn} ${mode === 'range' ? styles.active : ''}`}
                                onClick={() => setMode('range')}
                            >
                                時間範圍
                            </button>
                            <button
                                type="button"
                                className={`${styles.modeBtn} ${mode === 'minutes' ? styles.active : ''}`}
                                onClick={() => setMode('minutes')}
                            >
                                輸入分鐘數
                            </button>
                        </div>

                        {mode === 'range' ? (
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
                        ) : (
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
                                    <label>分鐘數</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={minutes}
                                        onChange={(e) => setMinutes(e.target.value)}
                                        min="1"
                                        max="480"
                                        placeholder="例如：30"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* 時長預覽 */}
                        <div className={styles.durationPreview}>
                            時長：{Math.floor(calculateDuration() / 60)} 分鐘
                        </div>

                        {/* 心得（選填） */}
                        <div className={styles.field}>
                            <label>心得（選填）</label>
                            <textarea
                                className="textarea"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={3}
                                placeholder="補錄時的靈修心得..."
                            />
                        </div>

                        {/* 錯誤與警告 */}
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
                            {submitting ? '處理中...' : conflictWarning ? '確認新增' : '新增紀錄'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
