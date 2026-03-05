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

/* ===== ★ 追加：個体 ===== */
const LEOPARDS = ['レオパ1', 'レオパ2', 'レオパ3'];

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
  
  /* ===== ★ 追加：選択中レオパ ===== */
  const [selectedLeopard, setSelectedLeopard] = useState(LEOPARDS[0]);

  /* ===== ★ 追加：現在の個体のログだけ表示 ===== */
  const currentLogs = logs.filter(l => l.leopard === selectedLeopard);

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
      log.date === selectedDate.date && log.leopard === selectedLeopard
        ? { ...log, [field]: value }
        : log
    );
  
    setLogs(newLogs);
    saveAllLogs(newLogs);

    setSelectedDate(prev =>
      prev ? { ...prev, [field]: value } : null
    );
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

      {/* ================= HEADER ================= */}
      <div className="w-full max-w-5xl mb-6 rounded-3xl bg-white shadow p-6">

        <h2 className="text-3xl font-bold text-center mb-4">
          {year}年{month}月
        </h2>

        {/* ===== ★ 追加：個体タブ ===== */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {LEOPARDS.map(name => (
            <button
              key={name}
              onClick={() => setSelectedLeopard(name)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold
                ${selectedLeopard === name
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600'}
              `}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={handlePrevMonth} className="px-4 py-2 bg-emerald-500 text-white rounded">
            ← 前月
          </button>
          <button onClick={handleNextMonth} className="px-4 py-2 bg-emerald-500 text-white rounded">
            次月 →
          </button>
        </div>
      </div>

      {/* ================= CALENDAR ================= */}
      <div ref={calendarRef} className="w-full max-w-5xl rounded-2xl bg-white shadow overflow-auto">

        <table className="w-full table-fixed border-collapse text-xs sm:text-sm">
          <thead>
            <tr>
              {DAYS.map(d => (
                <th key={d} className="bg-emerald-50 border-b py-2">{d}</th>
              ))}
            </tr>
          </thead>

          <tbody>
  {calendarRows.map((week, i) => (
    <tr key={i}>
      {week.map((date, j) => {
        let log = currentLogs.find(l => l.date === date);

        // ★ ここが超重要：無ければ生成
        if (date && !log) {
          log = {
            date,
            leopard: selectedLeopard,
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

        return (
          <CalendarCell
            key={j}
            date={date}
            log={log}
            onClick={() => {
              if (!date || !log) return;

              setSelectedDate(log);

              // 初回だけ保存
              if (!currentLogs.some(l => l.date === date)) {
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

      <ExportZipButton logs={logs} onImport={setLogs} />

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