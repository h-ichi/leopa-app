import React from 'react';
import type { DailyLog } from '../types';

interface Props {
  log: DailyLog;
  checkboxFields: { key: keyof DailyLog; label: string }[];
  onChange: (field: keyof DailyLog, value: string | boolean | string) => void;
  onClose: () => void;
}

const LogModal: React.FC<Props> = ({ log, checkboxFields, onChange, onClose }) => {
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onChange('photoBase64', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoDelete = () => {
    if (window.confirm('この写真を削除しますか？')) {
      onChange('photoBase64', '');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-4 rounded-xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{log.date} の記録</h3>

        <div className="space-y-3">
          {/* 気温 */}
          <div>
            <label className="block mb-1 text-gray-600">気温(℃)</label>
            <input
              type="text"
              value={log.temp}
              onChange={e => onChange('temp', e.target.value)}
              className="w-full border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* 湿度 */}
          <div>
            <label className="block mb-1 text-gray-600">湿度(%)</label>
            <input
              type="text"
              value={log.humidity}
              onChange={e => onChange('humidity', e.target.value)}
              className="w-full border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* 給餌 */}
          <div>
            <label className="block mb-1 text-gray-600">給餌</label>
            <input
              type="text"
              value={log.feeding}
              onChange={e => onChange('feeding', e.target.value)}
              className="w-full border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* チェック項目 */}
          {checkboxFields.map(field => (
            <div key={field.key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!!log[field.key]}
                onChange={e => onChange(field.key, e.target.checked)}
                className="h-5 w-5 text-indigo-500 rounded border-gray-300"
              />
              <label className="text-gray-700">{field.label}</label>
            </div>
          ))}

          {/* メモ */}
          <div>
            <label className="block mb-1 text-gray-600">メモ</label>
            <input
              type="text"
              value={log.notes}
              onChange={e => onChange('notes', e.target.value)}
              className="w-full border px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* 写真アップロード／削除 */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">写真アップロード</label>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm" />

            {log.photoBase64 && (
              <div className="mt-2">
                <img
                  src={log.photoBase64}
                  alt="uploaded"
                  className="w-full h-40 object-cover rounded border"
                />
                <button
                  onClick={handlePhotoDelete}
                  className="mt-2 w-full px-3 py-2 bg-gradient-to-r from-rose-400 to-rose-600 text-white rounded hover:from-rose-500 hover:to-rose-700 transition-colors"
                >
                  写真を削除
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          className="mt-4 w-full px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
          onClick={onClose}
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default LogModal;
