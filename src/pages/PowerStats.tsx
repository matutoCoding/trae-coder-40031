import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { useUIStore, filterByShiftAndDate } from '@/store/ui';
import ShiftFilterBar from '@/components/ShiftFilterBar';
import { Zap, TrendingDown, Award, BarChart3, Activity, Minus } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ComposedChart, Line,
} from 'recharts';

const TARGET = 3300;
const SHIFTS = ['甲班', '乙班', '丙班'];
const SHIFT_COLORS = ['#f97316', '#3b82f6', '#10b981'];
const tooltipStyle = { background: '#1a1a2e', border: '1px solid #2a3a5c', borderRadius: 8 };

export default function PowerStats() {
  const [tab, setTab] = useState<'perTon' | 'shiftCompare'>('perTon');
  const { powerStats } = useStore();
  const { shiftFilter, dateRange } = useUIStore();

  const adapted = useMemo(() =>
    powerStats.map(s => ({ ...s, timestamp: `${s.date} 08:00:00` })),
    [powerStats]
  );

  const filteredAdapted = useMemo(() =>
    filterByShiftAndDate(adapted, shiftFilter, dateRange),
    [adapted, shiftFilter, dateRange]
  );

  const filtered = useMemo(() => {
    const ids = new Set(filteredAdapted.map(s => s.id));
    return powerStats.filter(s => ids.has(s.id));
  }, [powerStats, filteredAdapted]);

  const totalPower = useMemo(() => filtered.reduce((s, r) => s + r.powerConsumption, 0), [filtered]);
  const totalProduction = useMemo(() => filtered.reduce((s, r) => s + r.production, 0), [filtered]);
  const avgPowerPerTon = useMemo(() => totalProduction ? Math.round(totalPower / totalProduction * 100) / 100 : 0, [totalPower, totalProduction]);
  const passRate = useMemo(() => filtered.length ? Math.round(filtered.filter(s => s.powerPerTon <= TARGET).length / filtered.length * 100) : 0, [filtered]);

  const dailyData = useMemo(() => {
    const g: Record<string, { date: string; powerPerTon: number; count: number }> = {};
    filtered.forEach(s => {
      if (!g[s.date]) g[s.date] = { date: s.date.slice(5), powerPerTon: 0, count: 0 };
      g[s.date].powerPerTon += s.powerPerTon;
      g[s.date].count += 1;
    });
    return Object.values(g).sort((a, b) => a.date.localeCompare(b.date))
      .map(x => ({ ...x, powerPerTon: Math.round(x.powerPerTon / x.count * 100) / 100 }));
  }, [filtered]);

  const yDomain = useMemo(() => {
    if (!dailyData.length) return [3000, 3600];
    const vals = dailyData.map(d => d.powerPerTon);
    const min = Math.min(...vals, TARGET);
    const max = Math.max(...vals, TARGET);
    const pad = (max - min) * 0.15 || 50;
    return [Math.floor(min - pad), Math.ceil(max + pad)];
  }, [dailyData]);

  const shiftStats = useMemo(() => SHIFTS.map((shift, i) => {
    const recs = filtered.filter(s => s.shift === shift);
    if (!recs.length) return { shift, fill: SHIFT_COLORS[i], avgPowerPerTon: 0, totalProduction: 0, totalPower: 0, best: 0, worst: 0, count: 0 };
    const tp = recs.reduce((s, r) => s + r.powerConsumption, 0);
    const tprod = recs.reduce((s, r) => s + r.production, 0);
    const ppts = recs.map(r => r.powerPerTon);
    return { shift, fill: SHIFT_COLORS[i], avgPowerPerTon: Math.round(tp / tprod * 100) / 100, totalProduction: tprod, totalPower: tp, best: Math.min(...ppts), worst: Math.max(...ppts), count: recs.length };
  }), [filtered]);

  const shiftRanking = useMemo(() => [...shiftStats].filter(s => s.count > 0).sort((a, b) => a.avgPowerPerTon - b.avgPowerPerTon), [shiftStats]);
  const sortedRecords = useMemo(() => [...filtered].sort((a, b) => b.date.localeCompare(a.date) || a.shift.localeCompare(b.shift)), [filtered]);

  const TabBtn = ({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Zap; label: string }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${active ? 'bg-lava-500/20 text-lava-400 border border-lava-500/30' : 'btn-secondary'}`}>
      <Icon className="w-4 h-4" />{label}
    </button>
  );

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
        <TabBtn active={tab === 'perTon'} onClick={() => setTab('perTon')} icon={Zap} label="吨石电耗" />
        <TabBtn active={tab === 'shiftCompare'} onClick={() => setTab('shiftCompare')} icon={BarChart3} label="班组对比" />
      </div>

      {tab === 'perTon' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Zap} iconColor="text-lava-400" label="总用电量" value={totalPower.toLocaleString()} unit="kWh" valueColor="text-lava-400" />
            <StatCard icon={Activity} iconColor="text-blue-400" label="总产量" value={totalProduction.toLocaleString()} unit="kg" valueColor="text-blue-400" />
            <StatCard icon={TrendingDown} iconColor="text-emerald-400" label="平均吨石电耗" value={avgPowerPerTon.toLocaleString()} unit="kWh/t" valueColor={avgPowerPerTon <= TARGET ? 'text-emerald-400' : 'text-red-400'} />
            <StatCard icon={Award} iconColor="text-yellow-400" label="达标率" value={passRate} unit="%" valueColor={passRate >= 80 ? 'text-emerald-400' : passRate >= 50 ? 'text-yellow-400' : 'text-red-400'} />
          </div>

          <div className="card p-6">
            <h2 className="section-title mb-2"><TrendingDown className="w-5 h-5 text-lava-400" />吨石电耗趋势</h2>
            <p className="text-steel-500 text-sm mb-4">目标值: {TARGET} kWh/t</p>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={yDomain} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} kWh/t`, '吨石电耗']} />
                <ReferenceLine y={TARGET} stroke="#ef4444" strokeDasharray="6 3" label={{ value: `目标 ${TARGET}`, fill: '#ef4444', fontSize: 12, position: 'right' }} />
                <Line type="monotone" dataKey="powerPerTon" name="吨石电耗" stroke="#f97316" strokeWidth={2.5} dot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#1a1a2e' }} activeDot={{ r: 7 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b border-furnace-600/30">
              <h2 className="section-title"><BarChart3 className="w-5 h-5 text-lava-400" />电耗明细</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>日期</th><th>班组</th><th>用电量(kWh)</th><th>产量(kg)</th><th>吨石电耗(kWh/t)</th><th>达标情况</th></tr></thead>
                <tbody>
                  {sortedRecords.map(s => (
                    <tr key={s.id}>
                      <td>{s.date}</td>
                      <td>{s.shift}</td>
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
            {shiftStats.map((s, i) => (
              <div key={s.shift} className="card-glow p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${SHIFT_COLORS[i]}20` }}>
                    <Zap className="w-5 h-5" style={{ color: SHIFT_COLORS[i] }} />
                  </div>
                  <div>
                    <div className="text-steel-200 font-medium">{s.shift}</div>
                    <div className="text-steel-500 text-xs">{s.count} 条记录</div>
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
                <Bar dataKey="avgPowerPerTon" name="平均吨石电耗" radius={[6, 6, 0, 0]} fill="#f97316" />
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
                      <div className="text-steel-200 font-medium">{s.shift}</div>
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
