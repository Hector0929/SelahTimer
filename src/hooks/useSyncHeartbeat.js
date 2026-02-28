'use client';

import { useEffect, useRef, useCallback } from 'react';
import { updateRecord } from '@/lib/devotionService';

/**
 * 心跳同步 Hook
 * 每 30 秒自動同步 ongoing 狀態至 Firestore
 */
export function useSyncHeartbeat({ docId, getElapsed, getContent, enabled, onSynced }) {
    const intervalRef = useRef(null);

    const sync = useCallback(async () => {
        if (!docId || !enabled) return;

        try {
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
            if (onSynced) onSynced(false);
        }
    }, [docId, enabled, getElapsed, getContent, onSynced]);

    useEffect(() => {
        if (!enabled || !docId) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // 每 30 秒同步一次
        intervalRef.current = setInterval(sync, 30000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, docId, sync]);

    // 手動觸發同步
    return { syncNow: sync };
}
