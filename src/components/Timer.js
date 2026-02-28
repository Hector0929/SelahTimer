'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import styles from './Timer.module.css';

/**
 * 計時器元件
 * 
 * Props:
 *  - initialSeconds: 初始秒數（恢復用）
 *  - isRunning: 是否正在計時
 *  - onStart: 開始計時回調
 *  - onPause: 暫停回調
 *  - onComplete: 完成回調 (totalSeconds)
 *  - onTick: 每秒回調 (currentSeconds)
 *  - syncStatus: 同步狀態 ('idle' | 'synced' | 'error')
 */
export default function Timer({
    initialSeconds = 0,
    isRunning,
    onStart,
    onPause,
    onComplete,
    onTick,
    syncStatus = 'idle',
}) {
    const [seconds, setSeconds] = useState(initialSeconds);
    const intervalRef = useRef(null);
    const onTickRef = useRef(onTick);

    // 保持 onTick 回調為最新版本
    useEffect(() => {
        onTickRef.current = onTick;
    }, [onTick]);

    // 初始化時設定秒數
    useEffect(() => {
        if (initialSeconds > 0) {
            setSeconds(initialSeconds);
        }
    }, [initialSeconds]);

    // 計時邏輯
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setSeconds((prev) => {
                    const next = prev + 1;
                    // 使用 setTimeout 將 onTick 排到下一個微任務，避免在 setState updater 內觸發父元件的 setState
                    setTimeout(() => {
                        if (onTickRef.current) onTickRef.current(next);
                    }, 0);
                    return next;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    // 格式化時間
    const formatTime = useCallback((totalSec) => {
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, []);

    // 完成計時
    const handleComplete = () => {
        if (onComplete) onComplete(seconds);
    };

    // 同步狀態指示燈
    const getSyncIndicator = () => {
        switch (syncStatus) {
            case 'synced':
                return <span className={`${styles.syncDot} ${styles.synced}`} title="已同步" />;
            case 'error':
                return <span className={`${styles.syncDot} ${styles.error}`} title="同步失敗" />;
            default:
                return <span className={`${styles.syncDot}`} title="等待中" />;
        }
    };

    return (
        <div className={styles.timerContainer}>
            {/* 同步狀態 */}
            <div className={styles.syncRow}>
                {getSyncIndicator()}
                <span className={styles.syncLabel}>
                    {syncStatus === 'synced' ? '已同步' : syncStatus === 'error' ? '同步失敗' : '雲端同步'}
                </span>
            </div>

            {/* 計時顯示 */}
            <div className={`${styles.timerDisplay} ${isRunning ? styles.running : ''}`}>
                {formatTime(seconds)}
            </div>

            {/* 控制按鈕 */}
            <div className={styles.controls}>
                {!isRunning ? (
                    <button className={`btn btn-primary btn-lg ${styles.startBtn}`} onClick={onStart}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        {seconds > 0 ? '繼續' : '開始靈修'}
                    </button>
                ) : (
                    <button className={`btn btn-secondary btn-lg ${styles.pauseBtn}`} onClick={onPause}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                        暫停
                    </button>
                )}

                {seconds > 0 && (
                    <button className={`btn btn-primary btn-lg ${styles.completeBtn}`} onClick={handleComplete}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                        完成
                    </button>
                )}
            </div>
        </div>
    );
}
