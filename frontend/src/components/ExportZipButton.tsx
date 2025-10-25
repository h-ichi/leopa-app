import React from 'react';
import type { DailyLog } from '../types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface Props {
  logs: DailyLog[];
}

const ExportZipButton: React.FC<Props> = ({ logs }) => {
  const handleExport = async () => {
    const zip = new JSZip();

    // CSV作成
    const headers = ['日付','曜日','気温(℃)','湿度(%)','給餌','水換え','掃除','排便','脱皮','メモ','写真ファイル名'];
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

    // 画像ファイル追加
    logs.forEach(log => {
      if (log.photoBase64 && log.date) {
        // base64からバイナリに変換
        const base64Data = log.photoBase64.split(',')[1];
        const byteString = atob(base64Data);
        const byteArray = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
          byteArray[i] = byteString.charCodeAt(i);
        }
        zip.file(`${log.date}.png`, byteArray);
      }
    });

    // ZIP生成・ダウンロード
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'leopa_calendar.zip');
  };

  return (
    <button
  onClick={handleExport}
  className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-400 to-indigo-600 text-white font-semibold rounded-lg shadow hover:from-indigo-500 hover:to-indigo-700 transition-all duration-200"
>
  ZIP出力
</button>

  );
};

export default ExportZipButton;
