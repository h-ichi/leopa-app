import React, { useState, useEffect } from 'react';
import type { DailyLog } from './types';
import { sampleLogs } from './data';

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
    request.onsuccess = () => resolve(request.result.length ? request.result : sampleLogs);
    request.onerror = () => reject(request.error);
  });
};

// チェックボックス項目
const checkboxFields: { key: keyof DailyLog; label: string }[] = [
  { key: 'waterChange', label: '水換え' },
  { key: 'cleaning', label: '掃除' },
  { key: 'poop', label: '排便' },
  { key: 'shed', label: '脱皮' },
];

// 色マップ
const colorMap: Record<string, string> = {
  給餌: 'text-green-600',
  水換え: 'text-blue-600',
  掃除: 'text-orange-600',
  排便: 'text-purple-600',
  脱皮: 'text-cyan-600',
  メモ: 'text-red-600',
};

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

  // CSV出力
  const exportCSV = () => {
    const headers = ['日付','曜日','気温(℃)','湿度(%)','給餌','水換え','掃除','排便','脱皮','備考'];
    const rows = logs.map(log => [
      log.date, log.dayOfWeek, log.temp, log.humidity, log.feeding,
      log.waterChange ? '✔' : '',
      log.cleaning ? '✔' : '',
      log.poop ? '✔' : '',
      log.shed ? '✔' : '',
      log.notes
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leopa_calendar.csv');
    link.click();
    URL.revokeObjectURL(url);
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

  // カレンダーに表示する項目（色付き）
  const getDisplayText = (log: DailyLog): { label: string; color: string }[] => {
    const displayItems: { label: string; color: string }[] = [];
    if (log.feeding) displayItems.push({ label: '給餌', color: colorMap['給餌'] });
    if (log.waterChange) displayItems.push({ label: '水換え', color: colorMap['水換え'] });
    if (log.cleaning) displayItems.push({ label: '掃除', color: colorMap['掃除'] });
    if (log.poop) displayItems.push({ label: '排便', color: colorMap['排便'] });
    if (log.shed) displayItems.push({ label: '脱皮', color: colorMap['脱皮'] });
    if (log.notes) displayItems.push({ label: 'メモ', color: colorMap['メモ'] });
    return displayItems;
  };
  

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">10月 レオパ管理カレンダー</h2>

      <table className="w-full border-collapse border border-gray-300 text-center text-sm">
        <thead>
          <tr>{DAYS.map(d => <th key={d} className="border border-gray-300 px-2 py-1">{d}</th>)}</tr>
        </thead>
        <tbody>
          {calendarRows.map((week, i) => (
            <tr key={i}>
              {week.map((date, j) => {
                const log = logs.find(l => l.date === date);
                const displayItems = log ? getDisplayText(log) : [];
                return (
                  <td
                    key={j}
                    className="border border-gray-300 h-20 w-20 align-top cursor-pointer hover:bg-indigo-50"
                    onClick={() => date && setSelectedDate(log || null)}
                  >
                    {date && (
                      <div>
                        <div className="font-semibold">{Number(date.slice(-2))}</div>
                        {displayItems.map((item, idx) => (
                          <div key={idx} className={`text-[10px] font-medium ${item.color}`}>
                            {item.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={exportCSV}
        className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
      >
        CSV出力
      </button>

      {/* モーダル */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">{selectedDate.date} の記録</h3>
            <div className="space-y-2">
              <div>
                <label>気温(℃): </label>
                <input
                  type="text"
                  value={selectedDate.temp}
                  onChange={e => handleChange('temp', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
              <div>
                <label>湿度(%): </label>
                <input
                  type="text"
                  value={selectedDate.humidity}
                  onChange={e => handleChange('humidity', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
              <div>
                <label>給餌: </label>
                <input
                  type="text"
                  value={selectedDate.feeding}
                  onChange={e => handleChange('feeding', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>

              {checkboxFields.map(field => (
                <div key={field.key}>
                  <label>{field.label}: </label>
                  <input
                    type="checkbox"
                    checked={selectedDate[field.key] as boolean}
                    onChange={e => handleChange(field.key, e.target.checked)}
                  />
                </div>
              ))}

              <div>
                <label>備考: </label>
                <input
                  type="text"
                  value={selectedDate.notes}
                  onChange={e => handleChange('notes', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            </div>

            <button
              className="mt-3 px-3 py-1 bg-indigo-500 text-white rounded"
              onClick={() => setSelectedDate(null)}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeopaCalendar;
