import React, { useState, useEffect, useRef } from 'react';
import type { DailyLog } from '../types';
import ExportZipButton from './ExportZipButton';
import LogModal from './LogModal';
import CalendarCell from './CalendarCell';
import {
  getAllLogs,
  saveAllLogs,
} from '../units/indexedDB';

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];

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
    getAllLogs()
      .then(setLogs)
      .catch(console.error);
  }, []);
  

  const handleChange = (field: keyof DailyLog, value: string | boolean) => {
    if (!selectedDate) return;
  
    const newLogs = logs.map(log =>
      log.date === selectedDate.date
        ? { ...log, [field]: value }
        : log
    );
  
    setLogs(newLogs);
    saveAllLogs(newLogs);
    setSelectedDate(prev =>
      prev ? { ...prev, [field]: value } : null
    );
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
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex flex-col items-center">
  
      {/* ================= HEADER CARD ================= */}
      <div className="w-full max-w-5xl mb-6 rounded-3xl bg-white/80 backdrop-blur-xl shadow-xl p-6">
  
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6 tracking-tight">
          {year}年{month}月
          <span className="block text-sm text-gray-500 font-normal mt-1">
            レオパードゲッコー飼育カレンダー
          </span>
        </h2>
  
        <div className="flex flex-wrap justify-between items-center gap-3">
  
          {/* 月移動 */}
          <div className="flex gap-3">
            <button
              onClick={handlePrevMonth}
              className="px-5 py-2 rounded-full bg-emerald-500 text-white shadow hover:shadow-lg hover:scale-105 transition"
            >
              ← 前月
            </button>
  
            <button
              onClick={handleNextMonth}
              className="px-5 py-2 rounded-full bg-emerald-500 text-white shadow hover:shadow-lg hover:scale-105 transition"
            >
              次月 →
            </button>
          </div>
  
          {/* 背景ボタン */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="bg-upload"
              className="cursor-pointer px-4 py-2 rounded-lg bg-gray-800 text-white text-sm shadow hover:bg-gray-700 transition"
            >
              背景変更
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
                onClick={handleRemoveImage}
                className="px-3 py-2 rounded-lg bg-red-500 text-white text-sm shadow hover:bg-red-600 transition"
              >
                削除
              </button>
            )}
          </div>
        </div>
      </div>
  
  
      {/* ================= CALENDAR CARD ================= */}
<div
  ref={calendarRef}
  className="
    relative
    w-full
    max-w-5xl
    rounded-3xl      /* ← 外枠だけ丸み */
    overflow-hidden
    shadow-2xl
    bg-white/80
    backdrop-blur-xl
    min-h-[520px]
    overflow-auto /* ← スクロール可能 */
  "
>
  {backgroundImage && (
    <img
      src={backgroundImage}
      alt="calendar-bg"
      className="absolute inset-0 w-full h-full object-cover opacity-60"
    />
  )}

  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />

  {/* ★ テーブルを完全フラット化 */}
  <table
    className="
      relative z-10
      w-full h-full
      table-fixed
      text-xs sm:text-sm
      border-collapse   /* ← 重要：隙間なくす */
    "
  >
    <thead>
      <tr>
        {DAYS.map(d => (
          <th
            key={d}
            className="
              bg-emerald-50    /* 薄い色 */
              text-emerald-700
              font-semibold
              py-2
              border-b border-gray-200
            "
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
                    saveAllLogs(newLogs);
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
    saveAllLogs(newLogs);
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