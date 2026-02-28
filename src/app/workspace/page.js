'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceRecovery } from '@/hooks/useDeviceRecovery';
import { useSyncHeartbeat } from '@/hooks/useSyncHeartbeat';
import {
    createRecord,
    completeRecord,
    updateRecord,
} from '@/lib/devotionService';
import Timer from '@/components/Timer';
import Editor from '@/components/Editor';
import styles from './workspace.module.css';

export default function WorkspacePage() {
    const router = useRouter();
    const { user } = useAuth();

    // 計時器狀態
    const [isRunning, setIsRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [content, setContent] = useState('');
    const [docId, setDocId] = useState(null);
    const [syncStatus, setSyncStatus] = useState('idle');
    const [saveStatus, setSaveStatus] = useState('idle');
    const [isCompleting, setIsCompleting] = useState(false);
    const [error, setError] = useState(null);

    // 跨裝置恢復
    const { recoveredRecord, isRecovering, checked, clearRecovery } = useDeviceRecovery(
        user?.uid
    );

    // 心跳同步
    const { syncNow } = useSyncHeartbeat({
        docId,
        getElapsed: useCallback(() => elapsed, [elapsed]),
        getContent: useCallback(() => content, [content]),
        enabled: isRunning && !!docId,
        onSynced: useCallback((success) => {
            setSyncStatus(success ? 'synced' : 'error');
            if (success) {
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            }
            // 3 秒後重設狀態
            setTimeout(() => setSyncStatus('idle'), 3000);
        }, []),
    });

    // 恢復進行中的紀錄
    const handleRecover = useCallback(() => {
        if (recoveredRecord) {
            setDocId(recoveredRecord._docId);
            setElapsed(recoveredRecord.estimatedElapsed);
            setContent(recoveredRecord.content || '');
            setIsRunning(true);
            clearRecovery();
        }
    }, [recoveredRecord, clearRecovery]);

    // 略過恢復
    const handleSkipRecovery = useCallback(async () => {
        if (recoveredRecord) {
            // 將舊的 ongoing 紀錄標記為完成
            try {
                await completeRecord(
                    recoveredRecord._docId,
                    recoveredRecord.total_duration || 0,
                    recoveredRecord.content || ''
                );
            } catch (err) {
                console.error('無法結束舊紀錄:', err);
            }
            clearRecovery();
        }
    }, [recoveredRecord, clearRecovery]);

    // 開始計時
    const handleStart = async () => {
        if (!user) return;
        setError(null);

        try {
            if (!docId) {
                // 建立新紀錄
                const record = await createRecord(user.uid);
                setDocId(record._docId);
            }
            setIsRunning(true);
        } catch (err) {
            console.error('無法開始計時:', err);
            if (err.code === 'permission-denied' || err.message?.includes('permissions')) {
                setError('Firebase 權限不足。請至 Firebase Console > Firestore > Rules 設定安全規則。');
            } else {
                setError('無法開始計時：' + err.message);
            }
        }
    };

    // 暫停
    const handlePause = () => {
        setIsRunning(false);
        // 暫停時立即同步
        syncNow();
    };

    // 完成計時
    const handleComplete = async (totalSeconds) => {
        if (!docId) return;

        setIsCompleting(true);
        try {
            await completeRecord(docId, totalSeconds, content);
            // 重設狀態
            setIsRunning(false);
            setElapsed(0);
            setContent('');
            setDocId(null);
            setSyncStatus('idle');
            // 導向 Dashboard
            router.push('/dashboard');
        } catch (error) {
            console.error('無法完成紀錄:', error);
        } finally {
            setIsCompleting(false);
        }
    };

    // 每秒回調
    const handleTick = useCallback((seconds) => {
        setElapsed(seconds);
    }, []);

    // 尚未檢查恢復狀態
    if (!checked) {
        return (
            <div className={styles.loadingContainer}>
                <div className="spinner" />
                <p>檢查進行中的紀錄...</p>
            </div>
        );
    }

    // 恢復提示
    if (recoveredRecord) {
        const elapsedMin = Math.floor(recoveredRecord.estimatedElapsed / 60);
        return (
            <div className={styles.container}>
                <div className={styles.recoveryCard}>
                    <div className={styles.recoveryIcon}>🔄</div>
                    <h2>發現進行中的靈修紀錄</h2>
                    <p>
                        你有一筆尚未完成的靈修紀錄，已持續約 <strong>{elapsedMin} 分鐘</strong>。
                    </p>
                    {recoveredRecord.content && (
                        <div className={styles.recoveryPreview}>
                            {recoveredRecord.content.substring(0, 100)}...
                        </div>
                    )}
                    <div className={styles.recoveryActions}>
                        <button className="btn btn-primary btn-lg" onClick={handleRecover}>
                            恢復計時
                        </button>
                        <button className="btn btn-secondary" onClick={handleSkipRecovery}>
                            放棄並開始新靈修
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.workspace}>
                {/* 錯誤提示 */}
                {error && (
                    <div className={styles.errorBanner}>
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError(null)} className={styles.errorClose}>✕</button>
                    </div>
                )}

                {/* 計時器區 */}
                <div className={styles.timerSection}>
                    <Timer
                        initialSeconds={elapsed}
                        isRunning={isRunning}
                        onStart={handleStart}
                        onPause={handlePause}
                        onComplete={handleComplete}
                        onTick={handleTick}
                        syncStatus={syncStatus}
                    />
                </div>

                {/* 編輯器區 */}
                <div className={styles.editorSection}>
                    <Editor
                        value={content}
                        onChange={setContent}
                        saveStatus={saveStatus}
                        placeholder="寫下你的靈修心得..."
                    />
                </div>
            </div>

            {/* 完成中遮罩 */}
            {isCompleting && (
                <div className={styles.completingOverlay}>
                    <div className="spinner" />
                    <p>正在儲存紀錄...</p>
                </div>
            )}
        </div>
    );
}
