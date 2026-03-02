'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import styles from './Timer.module.css';

/**
 * 計時器元件
 * 
 * 使用 Date.now() 時間戳計算經過秒數，避免瀏覽器背景分頁
 * 對 setInterval 做節流（throttle）導致計時不準確的問題。
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
    // 記錄本次「開始/繼續」計時的時間戳
    const startTimestampRef = useRef(null);
    // 記錄暫停前已累積的秒數（支援暫停→繼續）
    const accumulatedRef = useRef(initialSeconds);

    // 保持 onTick 回調為最新版本
    useEffect(() => {
        onTickRef.current = onTick;
    }, [onTick]);

    // 初始化時設定秒數（跨裝置恢復用）
    useEffect(() => {
        if (initialSeconds > 0) {
            setSeconds(initialSeconds);
            accumulatedRef.current = initialSeconds;
        }
    }, [initialSeconds]);

    // 計時邏輯：使用 Date.now() 時間戳計算，不依賴 setInterval 觸發次數
    useEffect(() => {
        if (isRunning) {
            // 記錄啟動時間戳
            startTimestampRef.current = Date.now();

            // 計算並更新經過時間
            const updateTime = () => {
                const now = Date.now();
                const delta = Math.floor((now - startTimestampRef.current) / 1000);
                const total = accumulatedRef.current + delta;
                setSeconds(total);
                if (onTickRef.current) onTickRef.current(total);
            };

            // 每秒更新顯示（即使被背景節流，回來時 updateTime 會算出正確值）
            intervalRef.current = setInterval(updateTime, 1000);

            // 分頁回前景時立即校正時間，不等待下一次 setInterval
            const handleVisibility = () => {
                if (document.visibilityState === 'visible') {
                    updateTime();
                }
            };
            document.addEventListener('visibilitychange', handleVisibility);

            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                document.removeEventListener('visibilitychange', handleVisibility);
            };
        } else {
            // 暫停時：將目前秒數存入累積值，供下次繼續時使用
            accumulatedRef.current = seconds;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
    }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

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
