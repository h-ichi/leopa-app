import React, { useState, useEffect } from 'react';
import type { DailyLog } from './types';
import { sampleLogs } from './data';

// IndexedDB 用ユーティリティ
const DB_NAME = 'LeopaCalendarDB';
const STORE_NAME = 'logs';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
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
};

const saveLogsToDB = async (logs: DailyLog[]) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  logs.forEach(log => store.put(log));
  return tx.complete;
};

const loadLogsFromDB = async (): Promise<DailyLog[]> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result.length ? request.result : sampleLogs);
    request.onerror = () => reject(request.error);
  });
};

const LeopaCalendar: React.FC = () => {
  const [logs, setLogs] = useState<DailyLog[]>(sampleLogs);

  // 初期ロード：IndexedDBから取得
  useEffect(() => {
    loadLogsFromDB().then(setLogs);
  }, []);

  // データ変更時にIndexedDBに保存
  const handleChange = (index: number, field: keyof DailyLog, value: string | boolean) => {
    setLogs(prev => {
      const newLogs = prev.map((log, i) => i === index ? { ...log, [field]: value } : log);
      saveLogsToDB(newLogs);
      return newLogs;
    });
  };

  // CSV出力
  const exportCSV = () => {
    const headers = ['日付', '曜日', '気温(℃)', '湿度(%)', '給餌', '水換え', '掃除', '排便', '脱皮', '備考'];
    const rows = logs.map(log => [
      log.date,
      log.dayOfWeek,
      log.temp,
      log.humidity,
      log.feeding,
      log.waterChange ? '✔' : '',
      log.cleaning ? '✔' : '',
      log.poop ? '✔' : '',
      log.shed ? '✔' : '',
      log.notes
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leopa_calendar.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-full overflow-x-auto">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">10月 レオパ管理カレンダー</h2>
      <table className="min-w-full border-collapse border border-gray-300 text-center text-sm">
        <thead className="bg-gray-100">
          <tr>
            {['日付', '曜日', '気温(℃)', '湿度(%)', '給餌', '水換え', '掃除', '排便', '脱皮', '備考'].map(header => (
              <th key={header} className="border border-gray-300 px-2 py-2 font-medium text-gray-700">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* --- 例の1行目 --- */}
          <tr className="bg-yellow-50">
            <td className="border border-gray-300 px-2 py-1">例</td>
            <td className="border border-gray-300 px-2 py-1">金</td>
            <td className="border border-gray-300 px-2 py-1 w-16">28℃</td>
            <td className="border border-gray-300 px-2 py-1 w-16">60％</td>
            <td className="border border-gray-300 px-2 py-1">レッドローチ3匹</td>
            <td className="border border-gray-300 px-2 py-1"><input type="checkbox" disabled className="mx-auto" /></td>
            <td className="border border-gray-300 px-2 py-1"><input type="checkbox" disabled className="mx-auto" /></td>
            <td className="border border-gray-300 px-2 py-1"><input type="checkbox" disabled className="mx-auto" /></td>
            <td className="border border-gray-300 px-2 py-1"><input type="checkbox" disabled className="mx-auto" /></td>
            <td className="border border-gray-300 px-2 py-1">例：夜に活動多め</td>
          </tr>

          {/* --- 実際のデータ行 --- */}
          {logs.map((log, i) => (
            <tr key={log.date} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-2 py-1">{log.date}</td>
              <td className="border border-gray-300 px-2 py-1">{log.dayOfWeek}</td>

              <td className="border border-gray-300 px-2 py-1 w-16">
                <input type="text" value={log.temp} onChange={e => handleChange(i, 'temp', e.target.value)}
                  className="w-16 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </td>

              <td className="border border-gray-300 px-2 py-1 w-16">
                <input type="text" value={log.humidity} onChange={e => handleChange(i, 'humidity', e.target.value)}
                  className="w-16 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </td>

              <td className="border border-gray-300 px-2 py-1">
                <input type="text" value={log.feeding} onChange={e => handleChange(i, 'feeding', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </td>

              <td className="border border-gray-300 px-2 py-1">
                <input type="checkbox" checked={log.waterChange} onChange={e => handleChange(i, 'waterChange', e.target.checked)}
                  className="mx-auto" />
              </td>

              <td className="border border-gray-300 px-2 py-1">
                <input type="checkbox" checked={log.cleaning} onChange={e => handleChange(i, 'cleaning', e.target.checked)}
                  className="mx-auto" />
              </td>

              <td className="border border-gray-300 px-2 py-1">
                <input type="checkbox" checked={log.poop} onChange={e => handleChange(i, 'poop', e.target.checked)}
                  className="mx-auto" />
              </td>

              <td className="border border-gray-300 px-2 py-1">
                <input type="checkbox" checked={log.shed} onChange={e => handleChange(i, 'shed', e.target.checked)}
                  className="mx-auto" />
              </td>

              <td className="border border-gray-300 px-2 py-1">
                <input type="text" value={log.notes} onChange={e => handleChange(i, 'notes', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* CSV出力ボタン */}
      <button onClick={exportCSV}
        className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
        CSV出力
      </button>
    </div>
  );
};

export default LeopaCalendar;
