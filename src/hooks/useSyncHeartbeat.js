'use client';

import { useEffect, useRef, useCallback } from 'react';
import { updateRecord } from '@/lib/devotionService';

/**
 * 心跳同步 Hook
 * 每 30 秒自動同步 ongoing 狀態至 Firestore
 */
export function useSyncHeartbeat({ docId, getElapsed, getContent, enabled, onSynced }) {
    const intervalRef = useRef(null);
    const latestProps = useRef({ getElapsed, getContent, onSynced });

    // 隨時保持最新的回調函數，避免因為 dependency 改變而重啟定時器
    useEffect(() => {
        latestProps.current = { getElapsed, getContent, onSynced };
    }, [getElapsed, getContent, onSynced]);

    const sync = useCallback(async () => {
        if (!docId || !enabled) return;

        try {
            const { getElapsed, getContent, onSynced } = latestProps.current;
            const elapsed = getElapsed();
            const content = getContent();

            await updateRecord(docId, {
                total_duration: elapsed,
                content: content,
            });

            // 通知 UI 同步成功
            if (onSynced) onSynced(true);
        } catch (error) {
            console.error('心跳同步失敗:', error);
            if (latestProps.current.onSynced) latestProps.current.onSynced(false);
        }
    }, [docId, enabled]);

    // 處理定時器
    useEffect(() => {
        if (!enabled || !docId) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // 每 15 秒同步一次（針對手機端提高同步頻率）
        intervalRef.current = setInterval(sync, 15000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, docId, sync]);

    // 監聽網頁切換至背景 (如手機縮小瀏覽器)
    useEffect(() => {
        if (!enabled || !docId) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                sync();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [enabled, docId, sync]);

    // 手動觸發同步
    return { syncNow: sync };
}
