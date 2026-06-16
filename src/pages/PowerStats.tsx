import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { useUIStore, inDateRange, ShiftFilter, DateRange } from '@/store/ui';
import ShiftFilterBar from '@/components/ShiftFilterBar';
import { Zap, TrendingDown, Award, BarChart3, Activity, Minus } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, LineChart, Line,
} from 'recharts';
import type { PowerStatsRecord } from '@/types';

const TARGET = 3300;
const SHIFTS = ['甲班', '乙班', '丙班'] as const;
const SHIFT_COLORS: Record<string, string> = { '甲班': '#f97316', '乙班': '#3b82f6', '丙班': '#10b981' };
const SHIFT_DAY_NIGHT: Record<string, 'day' | 'night'> = { '甲班': 'day', '乙班': 'night', '丙班': 'day' };
const tooltipStyle = { background: '#1a1a2e', border: '1px solid #2a3a5c', borderRadius: 8 };

const filterPower = (records: PowerStatsRecord[], shift: ShiftFilter, range: DateRange | null): PowerStatsRecord[] => {
  return records.filter(s => {
    if (!inDateRange(`${s.date} 08:00:00`, range)) return false;
    if (shift === 'all') return true;
    return SHIFT_DAY_NIGHT[s.shift] === shift;
  });
};

const kWhPerTon = (kWh: number, kg: number): number => {
  if (!kg) return 0;
  return Math.round(kWh / (kg / 1000) * 10) / 10;
};

export default function PowerStats() {
  const [tab, setTab] = useState<'perTon' | 'shiftCompare'>('perTon');
  const { powerStats } = useStore();
  const { shiftFilter, dateRange } = useUIStore();

  const filtered = useMemo(() =>
    filterPower(powerStats, shiftFilter, dateRange),
    [powerStats, shiftFilter, dateRange]
  );

  const totalPower = useMemo(() => filtered.reduce((s, r) => s + r.powerConsumption, 0), [filtered]);
  const totalProduction = useMemo(() => filtered.reduce((s, r) => s + r.production, 0), [filtered]);
  const avgPowerPerTon = useMemo(() => kWhPerTon(totalPower, totalProduction), [totalPower, totalProduction]);
  const passRate = useMemo(() => filtered.length ? Math.round(filtered.filter(s => s.powerPerTon <= TARGET).length / filtered.length * 100) : 0, [filtered]);

  const visibleShifts = useMemo(() => {
    if (shiftFilter === 'all') return [...SHIFTS];
    return SHIFTS.filter(s => SHIFT_DAY_NIGHT[s] === shiftFilter);
  }, [shiftFilter]);

  const trendData = useMemo(() => {
    const dates = [...new Set(filtered.map(s => s.date))].sort();
    return dates.map(date => {
      const point: Record<string, string | number | undefined> = { date: date.slice(5) };
      SHIFTS.forEach(shift => {
        if (!visibleShifts.includes(shift)) return;
        const rec = filtered.find(s => s.date === date && s.shift === shift);
        point[shift] = rec ? rec.powerPerTon : undefined;
      });
      const dayRecs = filtered.filter(s => s.date === date);
      const tp = dayRecs.reduce((s, r) => s + r.powerConsumption, 0);
      const tprod = dayRecs.reduce((s, r) => s + r.production, 0);
      point['日均'] = tprod ? kWhPerTon(tp, tprod) : undefined;
      return point;
    });
  }, [filtered, visibleShifts]);

  const yDomain = useMemo(() => {
    const vals = filtered.map(d => d.powerPerTon);
    if (!vals.length) return [3000, 3600];
    const min = Math.min(...vals, TARGET);
    const max = Math.max(...vals, TARGET);
    const pad = (max - min) * 0.15 || 50;
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [filtered]);

  const shiftStats = useMemo(() => SHIFTS.map((shift) => {
    const recs = filtered.filter(s => s.shift === shift);
    const color = SHIFT_COLORS[shift];
    if (!recs.length) return { shift, fill: color, avgPowerPerTon: 0, totalProduction: 0, totalPower: 0, best: 0, worst: 0, count: 0 };
    const tp = recs.reduce((s, r) => s + r.powerConsumption, 0);
    const tprod = recs.reduce((s, r) => s + r.production, 0);
    const ppts = recs.map(r => r.powerPerTon);
    return { shift, fill: color, avgPowerPerTon: kWhPerTon(tp, tprod), totalProduction: tprod, totalPower: tp, best: Math.min(...ppts), worst: Math.max(...ppts), count: recs.length };
  }), [filtered]);

  const shiftRanking = useMemo(() => [...shiftStats].filter(s => s.count > 0).sort((a, b) => a.avgPowerPerTon - b.avgPowerPerTon), [shiftStats]);
  const sortedRecords = useMemo(() => [...filtered].sort((a, b) => b.date.localeCompare(a.date) || a.shift.localeCompare(b.shift)), [filtered]);

  const shiftLabel = shiftFilter === 'day' ? '白班' : shiftFilter === 'night' ? '夜班' : '全部班次';

  const StatCard = ({ icon: Icon, iconColor, label, value, unit, valueColor }: any) => (
    <div className="card-glow p-5">
      <div className="flex items-center gap-2 text-steel-400 text-sm mb-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />{label}
      </div>
      <div className={`stat-value ${valueColor}`}>{value}<span className="text-sm text-steel-400 ml-1">{unit}</span></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <ShiftFilterBar />

      <div className="flex gap-2">
        <button onClick={() => setTab('perTon')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${tab === 'perTon' ? 'bg-lava-500/20 text-lava-400 border border-lava-500/30' : 'btn-secondary'}`}>
          <Zap className="w-4 h-4" />吨石电耗
        </button>
        <button onClick={() => setTab('shiftCompare')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${tab === 'shiftCompare' ? 'bg-lava-500/20 text-lava-400 border border-lava-500/30' : 'btn-secondary'}`}>
          <BarChart3 className="w-4 h-4" />班组对比
        </button>
      </div>

      {tab === 'perTon' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Zap} iconColor="text-lava-400" label={`总用电量 (${shiftLabel})`} value={totalPower.toLocaleString()} unit="kWh" valueColor="text-lava-400" />
            <StatCard icon={Activity} iconColor="text-blue-400" label="总产量" value={totalProduction.toLocaleString()} unit="kg" valueColor="text-blue-400" />
            <StatCard icon={TrendingDown} iconColor="text-emerald-400" label="平均吨石电耗" value={avgPowerPerTon.toLocaleString()} unit="kWh/t" valueColor={avgPowerPerTon <= TARGET ? 'text-emerald-400' : 'text-red-400'} />
            <StatCard icon={Award} iconColor="text-yellow-400" label="达标率" value={passRate} unit="%" valueColor={passRate >= 80 ? 'text-emerald-400' : passRate >= 50 ? 'text-yellow-400' : 'text-red-400'} />
          </div>

          <div className="card p-6">
            <h2 className="section-title mb-2"><TrendingDown className="w-5 h-5 text-lava-400" />吨石电耗趋势（按班组）</h2>
            <p className="text-steel-500 text-sm mb-4">目标值: {TARGET} kWh/t | 每条线为该班组当天的真实电耗 (kWh/吨)</p>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={yDomain} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined, n: string) => [v === undefined ? '-' : `${v} kWh/t`, n]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={TARGET} stroke="#ef4444" strokeDasharray="6 3" label={{ value: `目标 ${TARGET}`, fill: '#ef4444', fontSize: 12, position: 'right' }} />
                {visibleShifts.map(shift => (
                  <Line key={shift} type="monotone" dataKey={shift} name={shift} stroke={SHIFT_COLORS[shift]} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, stroke: '#1a1a2e' }} connectNulls={false} />
                ))}
                {shiftFilter === 'all' && <Line type="monotone" dataKey="日均" name="日均" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls={false} />}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b border-furnace-600/30">
              <h2 className="section-title"><BarChart3 className="w-5 h-5 text-lava-400" />电耗明细</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>日期</th><th>班组</th><th>班次</th><th>用电量(kWh)</th><th>产量(kg)</th><th>吨石电耗(kWh/t)</th><th>达标情况</th></tr></thead>
                <tbody>
                  {sortedRecords.map(s => (
                    <tr key={s.id}>
                      <td>{s.date}</td>
                      <td>{s.shift}</td>
                      <td><span className={SHIFT_DAY_NIGHT[s.shift] === 'day' ? 'badge-info' : 'badge-warning'}>{SHIFT_DAY_NIGHT[s.shift] === 'day' ? '白班' : '夜班'}</span></td>
                      <td className="font-mono text-lava-300">{s.powerConsumption.toLocaleString()}</td>
                      <td className="font-mono text-blue-300">{s.production.toLocaleString()}</td>
                      <td className="font-mono"><span className={s.powerPerTon <= TARGET ? 'text-emerald-400' : 'text-red-400'}>{s.powerPerTon.toLocaleString()}</span></td>
                      <td>{s.powerPerTon <= TARGET ? <span className="badge-success">达标</span> : <span className="badge-danger">未达标</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'shiftCompare' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shiftStats.filter(s => s.count > 0).map((s) => (
              <div key={s.shift} className="card-glow p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.fill}20` }}>
                    <Zap className="w-5 h-5" style={{ color: s.fill }} />
                  </div>
                  <div>
                    <div className="text-steel-200 font-medium">{s.shift}</div>
                    <div className="text-steel-500 text-xs">{SHIFT_DAY_NIGHT[s.shift] === 'day' ? '白班' : '夜班'} · {s.count} 条记录</div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between"><span className="text-steel-400 text-sm">平均电耗</span><span className={`font-mono font-bold ${s.avgPowerPerTon <= TARGET ? 'text-emerald-400' : 'text-red-400'}`}>{s.avgPowerPerTon || '-'} <span className="text-xs text-steel-500">kWh/t</span></span></div>
                  <div className="flex justify-between"><span className="text-steel-400 text-sm">总产量</span><span className="font-mono text-blue-300">{s.totalProduction.toLocaleString()} <span className="text-xs text-steel-500">kg</span></span></div>
                  <div className="flex justify-between"><span className="text-steel-400 text-sm">总用电量</span><span className="font-mono text-lava-300">{s.totalPower.toLocaleString()} <span className="text-xs text-steel-500">kWh</span></span></div>
                  <div className="pt-2 border-t border-furnace-600/30 flex justify-between items-center">
                    <div><div className="text-steel-500 text-xs">最佳</div><div className="font-mono text-emerald-400 text-sm">{s.best || '-'}</div></div>
                    <Minus className="w-4 h-4 text-steel-600" />
                    <div className="text-right"><div className="text-steel-500 text-xs">最差</div><div className="font-mono text-red-400 text-sm">{s.worst || '-'}</div></div>
                  </div>
                </div>
              </div>
            ))}
            {shiftStats.filter(s => s.count > 0).length === 0 && <div className="col-span-3 text-center py-8 text-steel-500">暂无数据</div>}
          </div>

          <div className="card p-6">
            <h2 className="section-title mb-4"><BarChart3 className="w-5 h-5 text-lava-400" />班组平均电耗对比</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={shiftStats.filter(s => s.count > 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
                <XAxis dataKey="shift" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={yDomain} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} kWh/t`, '平均吨石电耗']} />
                <ReferenceLine y={TARGET} stroke="#ef4444" strokeDasharray="6 3" label={{ value: `目标 ${TARGET}`, fill: '#ef4444', fontSize: 12, position: 'right' }} />
                <Bar dataKey="avgPowerPerTon" name="平均吨石电耗" radius={[6, 6, 0, 0]}>
                  {shiftStats.map(s => (
                    <rect key={s.shift} fill={s.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-glow p-6">
            <h2 className="section-title mb-4"><Award className="w-5 h-5 text-lava-400" />电耗排名</h2>
            <div className="space-y-3">
              {shiftRanking.map((s, i) => (
                <div key={s.shift} className="flex items-center justify-between p-4 rounded-lg bg-furnace-800/50 border border-furnace-600/30">
                  <div className="flex items-center gap-4">
                    <span className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : 'bg-amber-700/20 text-amber-600'}`}>
                      {['🥇', '🥈', '🥉'][i]}
                    </span>
                    <div>
                      <div className="text-steel-200 font-medium">{s.shift} <span className={`text-xs ml-1 ${SHIFT_DAY_NIGHT[s.shift] === 'day' ? 'text-blue-400' : 'text-amber-400'}`}>{SHIFT_DAY_NIGHT[s.shift] === 'day' ? '白班' : '夜班'}</span></div>
                      <div className="text-steel-500 text-xs">{s.count} 条记录</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="stat-value text-lg">{s.avgPowerPerTon.toLocaleString()}<span className="text-sm text-steel-400 ml-1">kWh/t</span></div>
                    {s.avgPowerPerTon <= TARGET ? <span className="badge-success">达标</span> : <span className="badge-danger">超标</span>}
                  </div>
                </div>
              ))}
              {shiftRanking.length === 0 && <div className="text-center py-8 text-steel-500">暂无数据</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
