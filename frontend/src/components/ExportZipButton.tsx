import React from 'react';
import type { DailyLog } from '../types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface Props {
  logs: DailyLog[];
  onImport: (importedLogs: DailyLog[]) => void; // ← 追加
}

const ExportZipButton: React.FC<Props> = ({ logs, onImport }) => {
  // ZIP出力
  const handleExport = async () => {
    const zip = new JSZip();

    const headers = [
      '日付','曜日','気温(℃)','湿度(%)','給餌','水換え','掃除','排便','脱皮','メモ','写真ファイル名'
    ];
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
      log.notes,
      log.date && log.photoBase64 ? `${log.date}.png` : ''
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    zip.file('leopa_calendar.csv', csvContent);

    // 画像追加
    logs.forEach(log => {
      if (log.photoBase64 && log.date) {
        const base64Data = log.photoBase64.split(',')[1];
        const byteString = atob(base64Data);
        const byteArray = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
          byteArray[i] = byteString.charCodeAt(i);
        }
        zip.file(`${log.date}.png`, byteArray);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'leopa_calendar.zip');
  };

  // ZIPインポート
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const zip = await JSZip.loadAsync(file);
      const csvFile = zip.file('leopa_calendar.csv');
      if (!csvFile) {
        alert('CSVファイルが見つかりません。');
        return;
      }

      const csvText = await csvFile.async('text');
      const lines = csvText.trim().split('\n');
      const [, ...dataLines] = lines; // header除外

      const importedLogs: DailyLog[] = await Promise.all(
        dataLines.map(async (line) => {
          const [
            date, dayOfWeek, temp, humidity, feeding,
            waterChange, cleaning, poop, shed, notes, photoFile
          ] = line.split(',');

          let photoBase64 = '';
          if (photoFile && zip.file(photoFile)) {
            const imgData = await zip.file(photoFile)!.async('base64');
            photoBase64 = `data:image/png;base64,${imgData}`;
          }

          return {
            date,
            dayOfWeek,
            temp,
            humidity,
            feeding,
            waterChange: waterChange === '✔',
            cleaning: cleaning === '✔',
            poop: poop === '✔',
            shed: shed === '✔',
            notes,
            photoBase64,
          };
        })
      );

      onImport(importedLogs);
      alert('ZIPからデータを読み込みました ✅');
    } catch (err) {
      console.error(err);
      alert('ZIPの読み込みに失敗しました。形式を確認してください。');
    }
  };

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {/* ZIP出力 */}
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-gradient-to-r from-indigo-400 to-indigo-600 text-white font-semibold rounded-lg shadow hover:from-indigo-500 hover:to-indigo-700 transition-all duration-200"
      >
        ZIP出力
      </button>

      {/* ZIP読み込み */}
      <label
        htmlFor="import-zip"
        className="cursor-pointer px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-lg shadow hover:from-green-500 hover:to-green-700 transition-all duration-200"
      >
        ZIPを読み込む
      </label>
      <input
        id="import-zip"
        type="file"
        accept=".zip"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
};

export default ExportZipButton;
