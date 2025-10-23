import React from 'react';
import type { DailyLog } from '../types';

interface Props {
  log?: DailyLog;
  date: string | null;
  onClick: () => void;
}

const colorMap: Record<string, string> = {
  給餌: '#ffb347',
  水換え: '#4fc3f7',
  掃除: '#81c784',
  排便: '#ba68c8',
  脱皮: '#ef5350',
  メモ: '#fdd835',
};

const CalendarCell: React.FC<Props> = ({ log, date, onClick }) => {
  const getDisplayItems = () => {
    if (!log) return [];
    const items: { label: string; color: string }[] = [];
    if (log.feeding) items.push({ label: '給餌', color: colorMap['給餌'] });
    if (log.waterChange) items.push({ label: '水換え', color: colorMap['水換え'] });
    if (log.cleaning) items.push({ label: '掃除', color: colorMap['掃除'] });
    if (log.poop) items.push({ label: '排便', color: colorMap['排便'] });
    if (log.shed) items.push({ label: '脱皮', color: colorMap['脱皮'] });
    if (log.notes) items.push({ label: 'メモ', color: colorMap['メモ'] });
    return items;
  };

  const displayItems = getDisplayItems();

  return (
    <td
      className="border border-gray-300 h-24 w-24 align-top cursor-pointer hover:bg-indigo-50"
      onClick={onClick}
    >
      {date && (
        <div>
          <div className="font-semibold">{Number(date.slice(-2))}</div>
          <div className="flex flex-wrap justify-center items-center mt-1 gap-1">
            {displayItems.map((item, idx) => (
              <span
                key={idx}
                className="
                  inline-flex justify-center items-center text-white font-medium rounded
                  text-[10px] sm:text-[12px] md:text-[14px]
                  w-[1.6em] h-[1.6em] sm:w-[2em] sm:h-[2em] md:w-[2.4em] md:h-[2.4em]
                "
                style={{ backgroundColor: item.color }}
              >
                {item.label[0]}
              </span>
            ))}
          </div>
        </div>
      )}
    </td>
  );
};

export default CalendarCell;
