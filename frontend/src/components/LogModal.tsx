import React from 'react';
import type { DailyLog } from '../types';

interface Props {
  log: DailyLog;
  checkboxFields: { key: keyof DailyLog; label: string }[];
  onChange: (field: keyof DailyLog, value: string | boolean) => void;
  onClose: () => void;
}

const LogModal: React.FC<Props> = ({ log, checkboxFields, onChange, onClose }) => {
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
            <label>備考: </label>
            <input
              type="text"
              value={log.notes}
              onChange={e => onChange('notes', e.target.value)}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
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
