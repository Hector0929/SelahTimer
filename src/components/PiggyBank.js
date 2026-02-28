'use client';

import Image from 'next/image';
import styles from './PiggyBank.module.css';

/**
 * 靈修撲滿元件 — 以儲錢概念呈現年度累積靈修時間
 * @param {number} yearTotal - 年度累積總秒數
 * @param {number} yearSessionCount - 年度靈修次數
 * @param {number} year - 年份
 */
export default function PiggyBank({ yearTotal = 0, yearSessionCount = 0, year = 2026 }) {
    // 轉換為小時與分鐘
    const hours = Math.floor(yearTotal / 3600);
    const minutes = Math.floor((yearTotal % 3600) / 60);

    // 以 365 天 × 15 分鐘為年度目標 (91.25 小時)
    const goalHours = 91;
    const progressPercent = Math.min((yearTotal / (goalHours * 3600)) * 100, 100);

    // 根據儲蓄量改變撲滿表情
    const piggyMood = progressPercent > 60 ? '😊' : progressPercent > 30 ? '🙂' : '🐷';

    return (
        <div className={styles.container}>
            {/* 左側：撲滿動畫 */}
            <div className={styles.piggySection}>
                <div className={styles.piggyBody}>
                    <div className={styles.imageWrapper}>
                        <Image
                            src="/images/piggy_bank.png"
                            alt="靈修撲滿"
                            width={160}
                            height={160}
                            className={styles.piggyImage}
                            priority
                        />
                    </div>

                    {/* 投幣動畫（每次載入閃一次） */}
                    {yearSessionCount > 0 && (
                        <div className={styles.coinDrop}>🪙</div>
                    )}
                </div>

                {/* 進度百分比 */}
                <div className={styles.progressLabel}>
                    {Math.round(progressPercent)}% 達成
                </div>
            </div>

            {/* 右側：年度累積資訊 */}
            <div className={styles.infoSection}>
                <div className={styles.yearBadge}>{year} 年</div>
                <h3 className={styles.infoTitle}>靈修撲滿</h3>
                <p className={styles.infoDesc}>每一分鐘的靈修，都是存入靈魂的財富</p>

                <div className={styles.statsRow}>
                    <div className={styles.statBlock}>
                        <span className={styles.statValue}>
                            {hours > 0 ? `${hours}h ` : ''}{minutes}m
                        </span>
                        <span className={styles.statLabel}>已累積時間</span>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.statBlock}>
                        <span className={styles.statValue}>{yearSessionCount}</span>
                        <span className={styles.statLabel}>靈修次數</span>
                    </div>
                </div>

                {/* 目標提示 */}
                <div className={styles.goalBar}>
                    <div className={styles.goalTrack}>
                        <div
                            className={styles.goalFill}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className={styles.goalText}>
                        年度目標 {goalHours}h（每日 15 分鐘）
                    </span>
                </div>
            </div>
        </div>
    );
}
