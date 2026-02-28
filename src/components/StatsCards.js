'use client';

import styles from './StatsCards.module.css';

/**
 * 統計卡片元件
 * 顯示 Streak、週總時長、月總時長
 * 
 * Props:
 *  - streak: 連續天數
 *  - weekTotal: 本週總秒數
 *  - monthTotal: 本月總秒數
 *  - sessionCount: 本月靈修次數
 */
export default function StatsCards({ streak = 0, weekTotal = 0, monthTotal = 0, sessionCount = 0 }) {
    // 格式化秒數為可讀時長
    const formatDuration = (totalSec) => {
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        if (h > 0) return `${h}小時${m}分`;
        return `${m}分鐘`;
    };

    return (
        <div className={styles.grid}>
            {/* 連續天數 */}
            <div className={`${styles.card} ${styles.streakCard}`}>
                <div className={styles.icon}>🔥</div>
                <div className={styles.info}>
                    <span className={styles.value}>{streak}</span>
                    <span className={styles.label}>連續天數</span>
                </div>
            </div>

            {/* 本週時長 */}
            <div className={`${styles.card} ${styles.weekCard}`}>
                <div className={styles.icon}>📖</div>
                <div className={styles.info}>
                    <span className={styles.value}>{formatDuration(weekTotal)}</span>
                    <span className={styles.label}>本週時長</span>
                </div>
            </div>

            {/* 本月時長 */}
            <div className={`${styles.card} ${styles.monthCard}`}>
                <div className={styles.icon}>📅</div>
                <div className={styles.info}>
                    <span className={styles.value}>{formatDuration(monthTotal)}</span>
                    <span className={styles.label}>本月時長</span>
                </div>
            </div>

            {/* 本月次數 */}
            <div className={`${styles.card} ${styles.countCard}`}>
                <div className={styles.icon}>✨</div>
                <div className={styles.info}>
                    <span className={styles.value}>{sessionCount}</span>
                    <span className={styles.label}>本月次數</span>
                </div>
            </div>
        </div>
    );
}
