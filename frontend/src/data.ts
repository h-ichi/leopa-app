import type { DailyLog } from './types';

const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

export const sampleLogs: DailyLog[] = [
  {
    date: '2025-10-01',
    dayOfWeek: '水',
    temp: '28',
    humidity: '60',
    feeding: 'レッドローチ3匹',
    waterChange: true,
    cleaning: true,
    poop: false,
    shed: true,
    notes: '例：夜に活動多め',
  },
  ...Array.from({ length: 30 }, (_, i) => {
    const dateStr = `2025-10-${String(i + 2).padStart(2, '0')}`;
    const date = new Date(dateStr);
    return {
      date: dateStr,
      dayOfWeek: weekdays[date.getDay()],
      temp: '',
      humidity: '',
      feeding: '',
      waterChange: false,
      cleaning: false,
      poop: false,
      shed: false,
      notes: '',
    };
  }),
];
