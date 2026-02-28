'use client';

import styles from './WeeklyChart.module.css';

/**
 * 週報柱狀圖元件（純 CSS/SVG 實作）
 * 
 * Props:
 *  - dailyStats: [0, 0, 0, 0, 0, 0, 0] — 週日到週六的秒數
 *  - dayLabels: ['日', '一', '二', '三', '四', '五', '六']
 */
export default function WeeklyChart({ dailyStats = [], dayLabels = [] }) {
    const maxSeconds = Math.max(...dailyStats, 1); // 避免除以 0

    // 格式化分鐘
    const formatMinutes = (sec) => {
        const m = Math.floor(sec / 60);
        return m > 0 ? `${m}分` : '';
    };

    // 取得今天的星期幾（0=日）
    const today = new Date().getDay();

    return (
        <div className={styles.chartContainer}>
            <h3 className={styles.title}>本週靈修時間</h3>
            <div className={styles.chart}>
                {dailyStats.map((seconds, index) => {
                    const height = (seconds / maxSeconds) * 100;
                    const isToday = index === today;

                    return (
                        <div key={index} className={styles.barGroup}>
                            {/* 數值標籤 */}
                            <span className={styles.barValue}>{formatMinutes(seconds)}</span>

                            {/* 柱條 */}
                            <div className={styles.barTrack}>
                                <div
                                    className={`${styles.bar} ${isToday ? styles.todayBar : ''}`}
                                    style={{ height: `${Math.max(height, 2)}%` }}
                                />
                            </div>

                            {/* 日期標籤 */}
                            <span className={`${styles.dayLabel} ${isToday ? styles.todayLabel : ''}`}>
                                {dayLabels[index] || index}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
