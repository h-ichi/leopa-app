import React, { useState, useEffect } from 'react';
import type { DailyLog } from '../types';
import { sampleLogs } from '../data';
import ExportZipButton from './ExportZipButton.tsx';
import LogModal from './LogModal';
import CalendarCell from './CalendarCell';

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];

const DB_NAME = 'LeopaCalendarDB';
const STORE_NAME = 'logs';
const DB_VERSION = 1;

// IndexedDBを開く
const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'date' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

// 保存
const saveLogsToDB = async (logs: DailyLog[]): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    logs.forEach(log => store.put(log));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// 読み込み
const loadLogsFromDB = async (): Promise<DailyLog[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () =>
      resolve(request.result.length ? request.result : sampleLogs);
    request.onerror = () => reject(request.error);
  });
};

// チェックボックス用フィールド
const checkboxFields: { key: keyof DailyLog; label: string }[] = [
  { key: 'waterChange', label: '水換え' },
  { key: 'cleaning', label: '掃除' },
  { key: 'poop', label: '排便' },
  { key: 'shed', label: '脱皮' },
];

const LeopaCalendar: React.FC = () => {
  const [logs, setLogs] = useState<DailyLog[]>(sampleLogs);
  const [selectedDate, setSelectedDate] = useState<DailyLog | null>(null);

  useEffect(() => {
    loadLogsFromDB().then(setLogs).catch(console.error);
  }, []);

  const handleChange = (field: keyof DailyLog, value: string | boolean) => {
    if (!selectedDate) return;
    const newLogs = logs.map(log =>
      log.date === selectedDate.date ? { ...log, [field]: value } : log
    );
    setLogs(newLogs);
    saveLogsToDB(newLogs).catch(console.error);
    setSelectedDate({ ...selectedDate, [field]: value });
  };

  // カレンダー作成（10月）
  const daysInMonth = 31;
  const calendarRows: (string | null)[][] = [];
  let week: (string | null)[] = Array(7).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const weekday = new Date(2025, 9, day).getDay();
    week[weekday] = `2025-10-${String(day).padStart(2, '0')}`;
    if (weekday === 6 || day === daysInMonth) {
      calendarRows.push(week);
      week = Array(7).fill(null);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">10月 レオパ管理カレンダー</h2>

      <table className="w-full border-collapse border border-gray-300 text-center text-sm">
        <thead>
          <tr>
            {DAYS.map(d => (
              <th key={d} className="border border-gray-300 px-2 py-1">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendarRows.map((week, i) => (
            <tr key={i}>
              {week.map((date, j) => {
                const log = logs.find(l => l.date === date);
                return (
                  <CalendarCell
                    key={j}
                    date={date}
                    log={log}
                    onClick={() => date && setSelectedDate(log || null)}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
       <ExportZipButton logs={logs} />
      </div>

      {selectedDate && (
        <LogModal
          log={selectedDate}
          checkboxFields={checkboxFields}
          onChange={handleChange}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
};

export default LeopaCalendar;
