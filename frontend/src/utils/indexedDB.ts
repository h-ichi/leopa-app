import { openDB } from 'idb';
import type { DailyLog } from '../types';

const DB_NAME = 'leopaDB';
const STORE_NAME = 'dailyLogs';
const DB_VERSION = 1;

// データベース初期化
export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'date' });
      }
    },
  });
}

// 保存（1日分）
export async function saveLog(log: DailyLog) {
  const db = await initDB();
  await db.put(STORE_NAME, log);
}

// 全件取得
export async function getAllLogs(): Promise<DailyLog[]> {
  const db = await initDB();
  return (await db.getAll(STORE_NAME)) as DailyLog[];
}

// 削除（指定日）
export async function deleteLog(date: string) {
  const db = await initDB();
  await db.delete(STORE_NAME, date);
}
