// Firestore 靈修紀錄服務層
// 封裝所有 CRUD 操作與統計邏輯
import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    Timestamp,
    limit,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'devotion_records';

/**
 * 建立新的計時紀錄（開始計時）
 */
export async function createRecord(userId) {
    const now = Timestamp.now();
    const recordData = {
        id: uuidv4(),
        user_id: userId,
        start_time: now,
        end_time: null,
        total_duration: 0,
        content: '',
        status: 'ongoing',
        is_manual: false,
        last_synced_at: now,
        created_at: now,
        updated_at: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), recordData);
    return { ...recordData, _docId: docRef.id };
}

/**
 * 更新進行中紀錄（心跳同步用）
 */
export async function updateRecord(docId, updates) {
    const docRef = doc(db, COLLECTION_NAME, docId);
    await updateDoc(docRef, {
        ...updates,
        last_synced_at: Timestamp.now(),
        updated_at: Timestamp.now(),
    });
}

/**
 * 完成計時紀錄
 */
export async function completeRecord(docId, totalDuration, content) {
    const docRef = doc(db, COLLECTION_NAME, docId);
    await updateDoc(docRef, {
        end_time: Timestamp.now(),
        total_duration: totalDuration,
        content: content,
        status: 'completed',
        last_synced_at: Timestamp.now(),
        updated_at: Timestamp.now(),
    });
}

/**
 * 建立手動補錄紀錄
 */
export async function createManualRecord(userId, { startTime, endTime, totalDuration, content }) {
    const recordData = {
        id: uuidv4(),
        user_id: userId,
        start_time: Timestamp.fromDate(new Date(startTime)),
        end_time: Timestamp.fromDate(new Date(endTime)),
        total_duration: totalDuration,
        content: content || '',
        status: 'completed',
        is_manual: true,
        last_synced_at: Timestamp.now(),
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), recordData);
    return { ...recordData, _docId: docRef.id };
}

/**
 * 取得使用者的所有紀錄（按時間降序）
 */
export async function getRecords(userId) {
    const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('status', '==', 'completed'),
        orderBy('start_time', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        _docId: doc.id,
        ...doc.data(),
    }));
}

/**
 * 取得進行中的紀錄（跨裝置恢復用）
 */
export async function getOngoingRecord(userId) {
    const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('status', '==', 'ongoing'),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { _docId: doc.id, ...doc.data() };
}

/**
 * 更新歷史紀錄（編輯時長）
 */
export async function editRecord(docId, { startTime, endTime, totalDuration, content }) {
    const updates = {
        updated_at: Timestamp.now(),
        last_synced_at: Timestamp.now(),
    };

    if (startTime !== undefined) updates.start_time = Timestamp.fromDate(new Date(startTime));
    if (endTime !== undefined) updates.end_time = Timestamp.fromDate(new Date(endTime));
    if (totalDuration !== undefined) updates.total_duration = totalDuration;
    if (content !== undefined) updates.content = content;

    const docRef = doc(db, COLLECTION_NAME, docId);
    await updateDoc(docRef, updates);
}

/**
 * 刪除紀錄
 */
export async function deleteRecord(docId) {
    const docRef = doc(db, COLLECTION_NAME, docId);
    await deleteDoc(docRef);
}

/**
 * 檢查時段是否與現有紀錄衝突
 * 回傳衝突的紀錄，若無衝突回傳空陣列
 */
export async function checkTimeConflict(userId, startTime, endTime, excludeDocId = null) {
    const records = await getRecords(userId);
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    return records.filter((record) => {
        // 排除自身（編輯時使用）
        if (excludeDocId && record._docId === excludeDocId) return false;

        const rStart = record.start_time?.toDate?.()
            ? record.start_time.toDate().getTime()
            : new Date(record.start_time).getTime();
        const rEnd = record.end_time?.toDate?.()
            ? record.end_time.toDate().getTime()
            : new Date(record.end_time).getTime();

        // 檢查時段重疊
        return start < rEnd && end > rStart;
    });
}

/**
 * 計算連續天數 (Streak)
 */
export async function calculateStreak(userId) {
    const records = await getRecords(userId);
    if (records.length === 0) return 0;

    // 收集所有有紀錄的日期（去重）
    const dates = new Set();
    records.forEach((record) => {
        const date = record.start_time?.toDate?.()
            ? record.start_time.toDate()
            : new Date(record.start_time);
        dates.add(date.toISOString().split('T')[0]);
    });

    // 從今天往回算連續天數
    const sortedDates = Array.from(dates).sort().reverse();
    const today = new Date().toISOString().split('T')[0];

    let streak = 0;
    let checkDate = new Date(today);

    // 如果今天沒有紀錄，從昨天開始算
    if (!dates.has(today)) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (dates.has(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

/**
 * 取得本週統計資料
 */
export async function getWeeklyStats(userId) {
    const records = await getRecords(userId);
    const now = new Date();

    // 本週起始（週日）
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // 本週每日統計
    const dailyStats = Array(7).fill(0);
    let weekTotal = 0;

    records.forEach((record) => {
        const date = record.start_time?.toDate?.()
            ? record.start_time.toDate()
            : new Date(record.start_time);

        if (date >= weekStart) {
            const dayIndex = date.getDay();
            dailyStats[dayIndex] += record.total_duration || 0;
            weekTotal += record.total_duration || 0;
        }
    });

    return {
        dailyStats,
        weekTotal,
        dayLabels: ['日', '一', '二', '三', '四', '五', '六'],
    };
}

/**
 * 取得本月統計資料
 */
export async function getMonthlyStats(userId) {
    const records = await getRecords(userId);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let monthTotal = 0;
    let sessionCount = 0;

    records.forEach((record) => {
        const date = record.start_time?.toDate?.()
            ? record.start_time.toDate()
            : new Date(record.start_time);

        if (date >= monthStart) {
            monthTotal += record.total_duration || 0;
            sessionCount++;
        }
    });

    return { monthTotal, sessionCount };
}
