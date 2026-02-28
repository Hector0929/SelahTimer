'use client';

import { useState } from 'react';
import styles from './RecordList.module.css';

/**
 * 歷史紀錄列表元件
 * 
 * Props:
 *  - records: 紀錄陣列
 *  - onEdit: 點擊編輯回調 (record)
 *  - onDelete: 點擊刪除回調 (docId)
 */
export default function RecordList({ records = [], onEdit, onDelete }) {
    const [expandedId, setExpandedId] = useState(null);

    // 格式化日期
    const formatDate = (timestamp) => {
        const date = timestamp?.toDate?.() ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            weekday: 'short',
        });
    };

    // 格式化時長
    const formatDuration = (totalSec) => {
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        if (h > 0) return `${h} 小時 ${m} 分鐘`;
        return `${m} 分鐘`;
    };

    // 格式化時間
    const formatTime = (timestamp) => {
        const date = timestamp?.toDate?.() ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    };

    if (records.length === 0) {
        return (
            <div className={styles.empty}>
                <div className={styles.emptyIcon}>📝</div>
                <p>尚無靈修紀錄</p>
                <p className={styles.emptyHint}>開始你的第一次靈修，或手動補錄紀錄</p>
            </div>
        );
    }

    // 按日期分組
    const grouped = {};
    records.forEach((record) => {
        const dateKey = formatDate(record.start_time);
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(record);
    });

    return (
        <div className={styles.list}>
            {Object.entries(grouped).map(([dateKey, dayRecords]) => (
                <div key={dateKey} className={styles.dayGroup}>
                    <div className={styles.dateHeader}>
                        <span>{dateKey}</span>
                        <span className={styles.dayTotal}>
                            {formatDuration(dayRecords.reduce((sum, r) => sum + (r.total_duration || 0), 0))}
                        </span>
                    </div>

                    {dayRecords.map((record) => (
                        <div
                            key={record._docId}
                            className={styles.record}
                            onClick={() => setExpandedId(expandedId === record._docId ? null : record._docId)}
                        >
                            <div className={styles.recordMain}>
                                <div className={styles.recordTime}>
                                    <span>{formatTime(record.start_time)}</span>
                                    <span className={styles.timeSep}>–</span>
                                    <span>{record.end_time ? formatTime(record.end_time) : '進行中'}</span>
                                </div>

                                <div className={styles.recordMeta}>
                                    <span className={styles.duration}>{formatDuration(record.total_duration || 0)}</span>
                                    {record.is_manual && (
                                        <span className="badge badge-manual">手動</span>
                                    )}
                                    {!record.is_manual && (
                                        <span className="badge badge-auto">自動</span>
                                    )}
                                </div>
                            </div>

                            {/* 展開詳情 */}
                            {expandedId === record._docId && (
                                <div className={styles.expanded} onClick={(e) => e.stopPropagation()}>
                                    {record.content && (
                                        <div className={styles.contentPreview}>
                                            {record.content.length > 200
                                                ? record.content.substring(0, 200) + '...'
                                                : record.content}
                                        </div>
                                    )}

                                    <div className={styles.actions}>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => onEdit && onEdit(record)}
                                        >
                                            ✏️ 編輯
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => {
                                                if (window.confirm('確定要刪除此紀錄嗎？')) {
                                                    onDelete && onDelete(record._docId);
                                                }
                                            }}
                                        >
                                            🗑️ 刪除
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
