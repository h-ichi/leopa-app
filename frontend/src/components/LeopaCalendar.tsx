import React, { useState, useEffect, useRef } from 'react';
import type { DailyLog } from '../types';
import ExportZipButton from './ExportZipButton';
import LogModal from './LogModal';
import CalendarCell from './CalendarCell';

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
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const checkboxFields: { key: keyof DailyLog; label: string }[] = [
  { key: 'waterChange', label: '水換え' },
  { key: 'cleaning', label: '掃除' },
  { key: 'poop', label: '排便' },
  { key: 'shed', label: '脱皮' },
];

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

const LeopaCalendar: React.FC = () => {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<DailyLog | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  );
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadLogsFromDB().then(setLogs).catch(console.error);
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

  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const newDate = new Date(year, month - 2);
    setCurrentMonth(
      `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
    );
  };
  const handleNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const newDate = new Date(year, month);
    setCurrentMonth(
      `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
    );
  };

  const [year, month] = currentMonth.split('-').map(Number);
  const daysInMonth = getDaysInMonth(year, month);

  const calendarRows: (string | null)[][] = [];
  let week: (string | null)[] = Array(7).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const weekday = new Date(year, month - 1, day).getDay();
    week[weekday] = `${currentMonth}-${String(day).padStart(2, '0')}`;
    if (weekday === 6 || day === daysInMonth) {
      calendarRows.push(week);
      week = Array(7).fill(null);
    }
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-b from-yellow-50 via-white to-green-50 min-h-screen">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4 leading-snug text-gray-800 drop-shadow-md">
        {year}年{month}月
        <br />
        <span className="text-lg sm:text-xl text-gray-600 font-normal">
          レオパードゲッコー飼育カレンダー
        </span>
      </h2>

      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={handlePrevMonth}
          className="px-5 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full shadow-lg hover:from-green-500 hover:to-green-700 hover:scale-105 transition-all duration-200"
        >
          ＜ 前月
        </button>
        <button
          onClick={handleNextMonth}
          className="px-5 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full shadow-lg hover:from-green-500 hover:to-green-700 hover:scale-105 transition-all duration-200"
        >
          次月 ＞
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4 w-full max-w-5xl">
  <label
    htmlFor="bg-upload"
    className="cursor-pointer px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-lg shadow hover:from-green-500 hover:to-green-700 transition-all duration-200 text-sm sm:text-base"
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
      className="px-4 py-2 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-lg shadow hover:from-red-500 hover:to-red-700 transition-all duration-200 text-sm sm:text-base"
      onClick={handleRemoveImage}
    >
      削除
    </button>
  )}
</div>


      <div
        ref={calendarRef}
        className="relative w-full max-w-5xl mb-4"
        style={{ aspectRatio: '7 / 5' }}
      >
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt="calendar-bg"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-xl filter brightness-90"
          />
        )}
        <div className="absolute inset-0 bg-white/70 z-0 backdrop-blur-sm rounded-xl"></div>

        <table className="relative z-10 w-full h-full table-fixed text-[10px] sm:text-sm md:text-base border-collapse">
          <thead>
            <tr>
              {DAYS.map(d => (
                <th
                  key={d}
                  className="border border-gray-300 px-1 sm:px-2 py-1 bg-green-100 text-green-800 font-semibold"
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
                  let log: DailyLog | undefined;
                  if (date) {
                    log = logs.find(l => l.date === date);
                    if (!log) {
                      log = {
                        date,
                        dayOfWeek: DAYS[new Date(date).getDay()],
                        temp: '',
                        humidity: '',
                        feeding: '',
                        waterChange: false,
                        cleaning: false,
                        poop: false,
                        shed: false,
                        notes: '',
                      };
                    }
                  }
                  return (
                    <CalendarCell
                      key={j}
                      date={date}
                      log={log}
                      onClick={() => {
                        if (!date || !log) return;
                        setSelectedDate(log);
                        if (!logs.some(l => l.date === date)) {
                          const newLogs = [...logs, log];
                          setLogs(newLogs);
                          saveLogsToDB(newLogs).catch(console.error);
                        }
                      }}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full max-w-5xl flex justify-start">
      <ExportZipButton
  logs={logs}
  onImport={(newLogs) => {
    setLogs(newLogs);
    saveLogsToDB(newLogs).catch(console.error);
  }}
/>
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
