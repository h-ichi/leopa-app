import { openDB, type IDBPDatabase } from 'idb';
import type { DailyLog } from '../types';

const DB_NAME = 'leopaDB';
const STORE_NAME = 'dailyLogs';
const DB_VERSION = 1;

/**
 * IndexedDB を取得（なければ初期化）
 */
async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'date' });
      }
    },
  });
}

/**
 * 1日分のログを保存
 */
export async function saveLog(log: DailyLog): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, log);
}

/**
 * 全ログをまとめて保存（上書き）
 * LeopaCalendar の state と相性が良い
 */
export async function saveAllLogs(logs: DailyLog[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');

  for (const log of logs) {
    tx.store.put(log);
  }

  await tx.done;
}

/**
 * 全ログ取得
 */
export async function getAllLogs(): Promise<DailyLog[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

/**
 * 指定日のログ削除
 */
export async function deleteLog(date: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, date);
}
