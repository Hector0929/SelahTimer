'use client';

import { useEffect, useState } from 'react';
import { getOngoingRecord } from '@/lib/devotionService';

/**
 * 跨裝置恢復 Hook
 * 登入後檢查是否有進行中的紀錄，並自動恢復
 */
export function useDeviceRecovery(userId) {
    const [recoveredRecord, setRecoveredRecord] = useState(null);
    const [isRecovering, setIsRecovering] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (!userId) {
            setChecked(true);
            return;
        }

        const checkOngoing = async () => {
            setIsRecovering(true);
            try {
                const record = await getOngoingRecord(userId);
                if (record) {
                    // 計算已過時間
                    const startTime = record.start_time?.toDate?.()
                        ? record.start_time.toDate()
                        : new Date(record.start_time);

                    const lastSynced = record.last_synced_at?.toDate?.()
                        ? record.last_synced_at.toDate()
                        : new Date(record.last_synced_at);

                    // 使用 last_synced_at 的 total_duration + (now - last_synced_at) 計算真實已過時間
                    const syncedDuration = record.total_duration || 0;
                    const sinceLastSync = Math.floor((Date.now() - lastSynced.getTime()) / 1000);
                    const estimatedElapsed = syncedDuration + sinceLastSync;

                    setRecoveredRecord({
                        ...record,
                        estimatedElapsed,
                        startTime,
                    });
                }
            } catch (error) {
                console.error('無法恢復紀錄:', error);
            } finally {
                setIsRecovering(false);
                setChecked(true);
            }
        };

        checkOngoing();
    }, [userId]);

    // 清除恢復狀態
    const clearRecovery = () => setRecoveredRecord(null);

    return { recoveredRecord, isRecovering, checked, clearRecovery };
}
