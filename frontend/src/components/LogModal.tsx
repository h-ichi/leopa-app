import React from 'react';
import type { DailyLog } from '../types';

interface Props {
  log: DailyLog;
  checkboxFields: { key: keyof DailyLog; label: string }[];
  onChange: (field: keyof DailyLog, value: string | boolean) => void;
  onClose: () => void;
}

const LogModal: React.FC<Props> = ({ log, checkboxFields, onChange, onClose }) => {
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onChange('photoBase64', reader.result as string); // Base64形式で保存
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-4 rounded w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-2">{log.date} の記録</h3>
        <div className="space-y-2">
          <div>
            <label>気温(℃): </label>
            <input
              type="text"
              value={log.temp}
              onChange={e => onChange('temp', e.target.value)}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label>湿度(%): </label>
            <input
              type="text"
              value={log.humidity}
              onChange={e => onChange('humidity', e.target.value)}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label>給餌: </label>
            <input
              type="text"
              value={log.feeding}
              onChange={e => onChange('feeding', e.target.value)}
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          {checkboxFields.map(field => (
            <div key={field.key}>
              <label>{field.label}: </label>
              <input
                type="checkbox"
                checked={log[field.key] as boolean}
                onChange={e => onChange(field.key, e.target.checked)}
              />
            </div>
          ))}

          <div>
            <label>メモ: </label>
            <input
              type="text"
              value={log.notes}
              onChange={e => onChange('notes', e.target.value)}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
        </div>
        {/* 写真アップロード */}
        <div className="mt-4">
          <label className="block mb-1 font-medium text-gray-700">写真アップロード</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="text-sm"
          />
          {log.photoBase64 && (
            <img
              src={log.photoBase64}
              alt="uploaded"
              className="mt-3 w-full h-40 object-cover rounded border"
            />
          )}
        </div>

        <button
          className="mt-3 px-3 py-1 bg-indigo-500 text-white rounded"
          onClick={onClose}
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default LogModal;
