import React, { useState, useEffect, useRef } from 'react';
import type { DailyLog } from '../types';
import { sampleLogs } from '../data';
import ExportZipButton from './ExportZipButton.tsx';
import LogModal from './LogModal';
import CalendarCell from './CalendarCell';
import styles from './LeopaCalendar.module.css';

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];

const DB_NAME = 'LeopaCalendarDB';
const STORE_NAME = 'logs';
const DB_VERSION = 1;

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

const checkboxFields: { key: keyof DailyLog; label: string }[] = [
  { key: 'waterChange', label: '水換え' },
  { key: 'cleaning', label: '掃除' },
  { key: 'poop', label: '排便' },
  { key: 'shed', label: '脱皮' },
];

const LeopaCalendar: React.FC = () => {
  const [logs, setLogs] = useState<DailyLog[]>(sampleLogs);
  const [selectedDate, setSelectedDate] = useState<DailyLog | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadLogsFromDB().then(setLogs).catch(console.error);
  }, []);

  useEffect(() => {
    const savedImage = localStorage.getItem('leopaCalendarBg');
    if (savedImage) setBackgroundImage(savedImage);
  }, []);

  const handleChange = (field: keyof DailyLog, value: string | boolean) => {
    if (!selectedDate) return;
    const newLogs = logs.map(log =>
      log.date === selectedDate.date ? { ...log, [field]: value } : log
    );
    setLogs(newLogs);
    saveLogsToDB(newLogs).catch(console.error);
    setSelectedDate(prev => (prev ? { ...prev, [field]: value } : null));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setBackgroundImage(data);
      localStorage.setItem('leopaCalendarBg', data);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setBackgroundImage(null);
    localStorage.removeItem('leopaCalendarBg');
  };

  // カレンダー作成
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
    <div className="flex flex-col items-center p-4">
      {/* タイトル */}
      <h2 className={`${styles.calendarTitle} text-2xl sm:text-3xl mb-4`}>
        10月 レオパ飼育カレンダー
      </h2>

      {/* 背景設定 */}
      <div className="flex flex-wrap items-center gap-2 mb-4 w-full max-w-4xl">
        <label
          htmlFor="bg-upload"
          className="cursor-pointer px-3 sm:px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-sm hover:bg-green-600 transition-colors duration-200 text-sm sm:text-base"
        >
          カレンダー背景を設定
        </label>
        <input
          id="bg-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        {backgroundImage && (
          <button
            className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors duration-200 text-sm sm:text-base"
            onClick={handleRemoveImage}
          >
            削除
          </button>
        )}
      </div>

      {/* カレンダー */}
      <div
        ref={calendarRef}
        className="relative w-full max-w-4xl mb-4"
        style={{ aspectRatio: '7 / 5' }}
      >
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt="calendar-bg"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-xl"
          />
        )}
        <table
          className={`${styles.calendarTable} relative z-10 w-full h-full table-fixed text-[10px] sm:text-sm md:text-base`}
        >
          <thead className={styles.calendarHeader}>
            <tr>
              {DAYS.map(d => (
                <th
                  key={d}
                  className="border border-gray-300 px-1 sm:px-2 py-1"
                >
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
      </div>

      {/* ZIPボタン */}
      <div className="w-full max-w-4xl flex justify-start">
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
