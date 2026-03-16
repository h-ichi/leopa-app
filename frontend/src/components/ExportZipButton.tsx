import React from 'react';
import type { DailyLog } from '../types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface Props {
  logs: DailyLog[];
  onImport: (importedLogs: DailyLog[]) => void;
}

const ExportZipButton: React.FC<Props> = ({ logs, onImport }) => {

  // =============================
  // ZIPエクスポート
  // =============================
  const handleExport = async () => {
    const zip = new JSZip();

    const headers = [
      '個体','日付','曜日','気温(℃)','湿度(%)','給餌','水換え','掃除','排便','脱皮','メモ','写真ファイル名'
    ];

    const rows = logs.map(log => [
      log.leopard,
      log.date,
      log.dayOfWeek,
      log.temp,
      log.humidity,
      log.feeding,
      log.waterChange ? '✔' : '',
      log.cleaning ? '✔' : '',
      log.poop ? '✔' : '',
      log.shed ? '✔' : '',
      `"${log.notes ?? ''}"`,
      log.date && log.photoBase64 ? `${log.leopard}_${log.date}.png` : ''
    ]);

    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    zip.file('leopa_calendar.csv', csvContent);

    // =============================
    // 画像追加
    // =============================
    logs.forEach(log => {
      if (log.photoBase64 && log.date) {

        const base64Data = log.photoBase64.split(',')[1];
        const byteString = atob(base64Data);
        const byteArray = new Uint8Array(byteString.length);

        for (let i = 0; i < byteString.length; i++) {
          byteArray[i] = byteString.charCodeAt(i);
        }

        const filename = `${log.leopard}_${log.date}.png`;
        zip.file(filename, byteArray);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });

    const today = new Date().toISOString().slice(0,10);
    saveAs(content, `leopa_calendar_${today}.zip`);
  };



  // =============================
  // ZIPインポート
  // =============================
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;

    try {

      const zip = await JSZip.loadAsync(file);

      const csvFile = zip.file('leopa_calendar.csv');

      if (!csvFile) {
        alert('CSVファイルが見つかりません');
        return;
      }

      const csvText = await csvFile.async('text');

      const lines = csvText.trim().split('\n');

      const dataLines = lines.slice(1); // header除外


      const importedLogs: DailyLog[] = await Promise.all(

        dataLines.map(async (line) => {

          const cols = line.split(',');

          let leopard = '';
          let date = '';
          let dayOfWeek = '';
          let temp = '';
          let humidity = '';
          let feeding = '';
          let waterChange = '';
          let cleaning = '';
          let poop = '';
          let shed = '';
          let notes = '';
          let photoFile = '';



          // =============================
          // 新ZIP（個体あり）
          // =============================
          if (cols.length === 12) {

            [
              leopard,
              date,
              dayOfWeek,
              temp,
              humidity,
              feeding,
              waterChange,
              cleaning,
              poop,
              shed,
              notes,
              photoFile
            ] = cols;

          }

          // =============================
          // 旧ZIP（個体なし）
          // =============================
          else {

            [
              date,
              dayOfWeek,
              temp,
              humidity,
              feeding,
              waterChange,
              cleaning,
              poop,
              shed,
              notes,
              photoFile
            ] = cols;

            leopard = 'レオパ1';
          }



          notes = notes?.replace(/^"|"$/g, '') ?? '';



          let photoBase64 = '';

          if (photoFile && zip.file(photoFile)) {

            const imgData = await zip.file(photoFile)!.async('base64');

            photoBase64 = `data:image/png;base64,${imgData}`;
          }



          return {
            leopard,
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
            photoBase64
          };

        })

      );


      onImport(importedLogs);

      alert('ZIPからデータを読み込みました ✅');


    } catch (err) {

      console.error(err);

      alert('ZIPの読み込みに失敗しました。');

    }

  };



  return (
    <div className="flex flex-wrap gap-3 mt-4">

      {/* ZIP出力 */}
      <button
        onClick={handleExport}
        className="
          px-4 py-2
          bg-indigo-500
          text-white
          font-medium
          rounded-lg
          shadow-sm
          hover:bg-indigo-600
          active:scale-95
          transition
        "
      >
        ZIP出力
      </button>


      {/* ZIP読み込み */}
      <label
        htmlFor="import-zip"
        className="
          cursor-pointer
          px-4 py-2
          bg-emerald-500
          text-white
          font-medium
          rounded-lg
          shadow-sm
          hover:bg-emerald-600
          active:scale-95
          transition
        "
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