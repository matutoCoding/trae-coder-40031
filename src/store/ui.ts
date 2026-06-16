import { create } from 'zustand';

export type ShiftFilter = 'all' | 'day' | 'night';

export interface DateRange {
  start: string;
  end: string;
}

interface UIState {
  shiftFilter: ShiftFilter;
  dateRange: DateRange | null;

  setShiftFilter: (s: ShiftFilter) => void;
  setDateRange: (r: DateRange | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  shiftFilter: 'all',
  dateRange: null,

  setShiftFilter: (s) => set({ shiftFilter: s }),
  setDateRange: (r) => set({ dateRange: r }),
}));

export const isDayShift = (timeStr: string): boolean => {
  const hour = parseInt(timeStr.slice(11, 13), 10);
  return hour >= 8 && hour < 20;
};

export const getShiftName = (timeStr: string): 'day' | 'night' => {
  return isDayShift(timeStr) ? 'day' : 'night';
};

export const getShiftLabel = (shift: 'day' | 'night'): string => {
  return shift === 'day' ? '白班' : '夜班';
};

export const formatDateInput = (d: Date): string => {
  return d.toISOString().slice(0, 10);
};

export const inDateRange = (timestamp: string, range: DateRange | null): boolean => {
  if (!range) return true;
  const date = timestamp.slice(0, 10);
  return date >= range.start && date <= range.end;
};

export const inShiftFilter = (timestamp: string, filter: ShiftFilter): boolean => {
  if (filter === 'all') return true;
  const isDay = isDayShift(timestamp);
  return filter === 'day' ? isDay : !isDay;
};

export const filterByShiftAndDate = <T extends { timestamp: string }>(
  records: T[],
  shift: ShiftFilter,
  range: DateRange | null
): T[] => {
  return records.filter(r => inShiftFilter(r.timestamp, shift) && inDateRange(r.timestamp, range));
};
