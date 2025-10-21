import React from 'react';
import type { DailyLog } from '../types';

interface Props {
  logs: DailyLog[];
}

const ExportCSVButton: React.FC<Props> = ({ logs }) => {
  const handleExport = () => {
    const headers = ['日付','曜日','気温(℃)','湿度(%)','給餌','水換え','掃除','排便','脱皮','備考'];
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
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leopa_calendar.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
    >
      CSV出力
    </button>
  );
};

export default ExportCSVButton;
