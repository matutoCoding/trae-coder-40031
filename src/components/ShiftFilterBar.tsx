import { useUIStore, ShiftFilter, getShiftLabel } from '@/store/ui';
import { Calendar, Sun, Moon, Filter } from 'lucide-react';
import { useState } from 'react';

export default function ShiftFilterBar() {
  const { shiftFilter, dateRange, setShiftFilter, setDateRange } = useUIStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempStart, setTempStart] = useState(dateRange?.start || '');
  const [tempEnd, setTempEnd] = useState(dateRange?.end || '');

  const shifts: { value: ShiftFilter; label: string; icon: typeof Sun }[] = [
    { value: 'all', label: '全部', icon: Filter },
    { value: 'day', label: '白班', icon: Sun },
    { value: 'night', label: '夜班', icon: Moon },
  ];

  const applyDate = () => {
    if (tempStart && tempEnd) {
      setDateRange({ start: tempStart, end: tempEnd });
    } else {
      setDateRange(null);
    }
    setShowDatePicker(false);
  };

  const clearDate = () => {
    setTempStart('');
    setTempEnd('');
    setDateRange(null);
    setShowDatePicker(false);
  };

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-xs text-steel-500">班次</span>
        <div className="flex rounded-lg overflow-hidden border border-furnace-500/30">
          {shifts.map(s => (
            <button
              key={s.value}
              onClick={() => setShiftFilter(s.value)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs transition-colors ${
                shiftFilter === s.value
                  ? 'bg-lava-500 text-white'
                  : 'bg-furnace-800 text-steel-400 hover:bg-furnace-700 hover:text-steel-300'
              }`}
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => {
            setShowDatePicker(!showDatePicker);
            if (!showDatePicker) {
              setTempStart(dateRange?.start || '');
              setTempEnd(dateRange?.end || '');
            }
          }}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
            dateRange
              ? 'bg-lava-500/10 border-lava-500/30 text-lava-300'
              : 'bg-furnace-800 border-furnace-500/30 text-steel-400 hover:text-steel-300'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          {dateRange ? `${dateRange.start} ~ ${dateRange.end}` : '日期范围'}
        </button>

        {showDatePicker && (
          <div className="absolute top-full mt-2 right-0 z-50 card-glow p-4 w-72 shadow-xl">
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-steel-400">开始日期</label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={e => setTempStart(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-steel-400">结束日期</label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={e => setTempEnd(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={clearDate} className="btn-secondary text-xs py-1.5 px-3">清空</button>
                <button onClick={applyDate} className="btn-primary text-xs py-1.5 px-3">应用</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {(shiftFilter !== 'all' || dateRange) && (
        <div className="flex items-center gap-1 text-xs text-steel-500">
          <span>筛选结果：</span>
          {shiftFilter !== 'all' && <span className="badge-info">{getShiftLabel(shiftFilter)}</span>}
          {dateRange && <span className="badge-info">{dateRange.start} ~ {dateRange.end}</span>}
        </div>
      )}
    </div>
  );
}
