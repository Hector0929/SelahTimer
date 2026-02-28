'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    getRecords,
    createManualRecord,
    editRecord,
    deleteRecord,
    calculateStreak,
    getWeeklyStats,
    getMonthlyStats,
    getYearlyStats,
} from '@/lib/devotionService';
import StatsCards from '@/components/StatsCards';
import WeeklyChart from '@/components/WeeklyChart';
import RecordList from '@/components/RecordList';
import ManualEntryModal from '@/components/ManualEntryModal';
import EditDurationModal from '@/components/EditDurationModal';
import PiggyBank from '@/components/PiggyBank';
import ProtectedRoute from '@/components/ProtectedRoute';
import styles from './dashboard.module.css';

export default function DashboardPage() {
    const { user } = useAuth();

    // 資料狀態
    const [records, setRecords] = useState([]);
    const [streak, setStreak] = useState(0);
    const [weeklyStats, setWeeklyStats] = useState({ dailyStats: Array(7).fill(0), weekTotal: 0, dayLabels: [] });
    const [monthlyStats, setMonthlyStats] = useState({ monthTotal: 0, sessionCount: 0 });
    const [yearlyStats, setYearlyStats] = useState({ yearTotal: 0, yearSessionCount: 0, year: 2026 });
    const [loading, setLoading] = useState(true);

    // Modal 狀態
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    // 載入所有資料
    const loadData = useCallback(async () => {
        if (!user) return;

        try {
            const [records, streak, weekly, monthly, yearly] = await Promise.all([
                getRecords(user.uid),
                calculateStreak(user.uid),
                getWeeklyStats(user.uid),
                getMonthlyStats(user.uid),
                getYearlyStats(user.uid),
            ]);

            setRecords(records);
            setStreak(streak);
            setWeeklyStats(weekly);
            setMonthlyStats(monthly);
            setYearlyStats(yearly);
        } catch (error) {
            console.error('載入資料失敗:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // 手動補錄
    const handleManualEntry = async (data) => {
        if (!user) return;
        await createManualRecord(user.uid, data);
        await loadData(); // 重新載入統計
    };

    // 編輯紀錄
    const handleEditRecord = async (data) => {
        if (!editingRecord) return;
        await editRecord(editingRecord._docId, data);
        setEditingRecord(null);
        await loadData(); // 重新載入統計
    };

    // 刪除紀錄
    const handleDeleteRecord = async (docId) => {
        await deleteRecord(docId);
        await loadData(); // 重新載入統計
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className="spinner" />
                <p>載入數據中...</p>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className={styles.container}>
                {/* 頁面頭部 */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>總覽</h1>
                        <p className={styles.subtitle}>你的靈修成長總覽</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowManualEntry(true)}
                    >
                        ＋ 新增紀錄
                    </button>
                </div>

                {/* 統計卡片 */}
                <StatsCards
                    streak={streak}
                    weekTotal={weeklyStats.weekTotal}
                    monthTotal={monthlyStats.monthTotal}
                    sessionCount={monthlyStats.sessionCount}
                />

                {/* 靈修撲滿 */}
                <PiggyBank
                    yearTotal={yearlyStats.yearTotal}
                    yearSessionCount={yearlyStats.yearSessionCount}
                    year={yearlyStats.year}
                />

                {/* 週報圖表 */}
                <WeeklyChart
                    dailyStats={weeklyStats.dailyStats}
                    dayLabels={weeklyStats.dayLabels}
                />

                {/* 歷史紀錄 */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>歷史紀錄</h2>
                    <RecordList
                        records={records}
                        onEdit={(record) => setEditingRecord(record)}
                        onDelete={handleDeleteRecord}
                    />
                </div>

                {/* 手動補錄 Modal */}
                <ManualEntryModal
                    isOpen={showManualEntry}
                    onClose={() => setShowManualEntry(false)}
                    onSubmit={handleManualEntry}
                    userId={user?.uid}
                />

                {/* 編輯紀錄 Modal */}
                <EditDurationModal
                    isOpen={!!editingRecord}
                    onClose={() => setEditingRecord(null)}
                    onSubmit={handleEditRecord}
                    record={editingRecord}
                    userId={user?.uid}
                />
            </div>
        </ProtectedRoute>
    );
}
