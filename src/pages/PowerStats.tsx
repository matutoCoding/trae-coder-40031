import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { Zap, TrendingDown, Award, BarChart3 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, ReferenceLine,
} from 'recharts';

const SHIFTS = ['甲班', '乙班', '丙班'];
const SHIFT_COLORS = ['#f97316', '#3b82f6', '#10b981'];

export default function PowerStats() {
  const [tab, setTab] = useState<'perTon' | 'shiftCompare'>('perTon');
  const [days, setDays] = useState(7);
  const { powerStats } = useStore();

  const filtered = useMemo(() => {
    const dates = [...new Set(powerStats.map(s => s.date))].sort().slice(-days);
    return powerStats.filter(s => dates.includes(s.date));
  }, [powerStats, days]);

  const latest = useMemo(() => {
    if (!filtered.length) return null;
    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0];
  }, [filtered]);

  const trendData = useMemo(() => {
    const grouped: Record<string, { date: string; powerPerTon: number }> = {};
    filtered.forEach(s => {
      if (!grouped[s.date]) grouped[s.date] = { date: s.date.slice(5), powerPerTon: 0 };
      grouped[s.date].powerPerTon += s.powerPerTon;
    });
    Object.keys(grouped).forEach(d => {
      const count = filtered.filter(s => s.date === d.slice(0)).length || 1;
      const actual = filtered.filter(f => f.date.length === 10 && f.date.slice(5) === d).length || 1;
      grouped[d].powerPerTon = Math.round(grouped[d].powerPerTon / actual * 100) / 100;
    });
    return Object.values(grouped);
  }, [filtered]);

  const dualAxisData = useMemo(() => {
    const grouped: Record<string, { date: string; powerConsumption: number; production: number; count: number }> = {};
    filtered.forEach(s => {
      if (!grouped[s.date]) grouped[s.date] = { date: s.date.slice(5), powerConsumption: 0, production: 0, count: 0 };
      grouped[s.date].powerConsumption += s.powerConsumption;
      grouped[s.date].production += s.production;
      grouped[s.date].count += 1;
    });
    return Object.values(grouped).map(g => ({
      date: g.date,
      powerConsumption: Math.round(g.powerConsumption / g.count),
      production: Math.round(g.production / g.count),
    }));
  }, [filtered]);

  const shiftAvgData = useMemo(() => {
    return SHIFTS.map((shift, i) => {
      const records = filtered.filter(s => s.shift === shift);
      const avg = (field: 'powerConsumption' | 'production' | 'powerPerTon') =>
        records.length ? Math.round(records.reduce((sum, r) => sum + r[field], 0) / records.length) : 0;
      return { shift, powerConsumption: avg('powerConsumption'), production: avg('production'), powerPerTon: avg('powerPerTon'), fill: SHIFT_COLORS[i] };
    });
  }, [filtered]);

  const shiftRanking = useMemo(() => {
    return [...shiftAvgData].sort((a, b) => a.powerPerTon - b.powerPerTon);
  }, [shiftAvgData]);

  const tooltipStyle = { background: '#1a1a2e', border: '1px solid #2a3a5c', borderRadius: 8 };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={() => setTab('perTon')} className={tab === 'perTon' ? 'btn-primary' : 'btn-secondary'}>
          <Zap className="w-4 h-4 inline mr-1" />吨石电耗
        </button>
        <button onClick={() => setTab('shiftCompare')} className={tab === 'shiftCompare' ? 'btn-primary' : 'btn-secondary'}>
          <BarChart3 className="w-4 h-4 inline mr-1" />班组对比
        </button>
      </div>

      {tab === 'perTon' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-glow p-5">
              <div className="text-steel-400 text-sm mb-1">当班电耗</div>
              <div className="stat-value text-lava-400">{latest?.powerConsumption.toLocaleString() ?? '-'} <span className="text-sm text-steel-400">kWh</span></div>
            </div>
            <div className="card-glow p-5">
              <div className="text-steel-400 text-sm mb-1">当班产量</div>
              <div className="stat-value text-blue-400">{latest?.production.toLocaleString() ?? '-'} <span className="text-sm text-steel-400">kg</span></div>
            </div>
            <div className="card-glow p-5">
              <div className="text-steel-400 text-sm mb-1">吨石电耗</div>
              <div className="stat-value text-emerald-400">{latest?.powerPerTon.toLocaleString() ?? '-'} <span className="text-sm text-steel-400">kWh/t</span></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="section-title"><TrendingDown className="w-5 h-5 text-lava-400" />电耗趋势</h2>
            <select value={days} onChange={e => setDays(Number(e.target.value))} className="input-field w-auto text-sm">
              <option value={3}>近3天</option>
              <option value={5}>近5天</option>
              <option value={7}>近7天</option>
            </select>
          </div>

          <div className="card p-6">
            <h3 className="text-steel-300 text-sm mb-4">吨石电耗趋势 (目标: 3300 kWh/t)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine y={3300} stroke="#ef4444" strokeDasharray="6 3" label={{ value: '目标3300', fill: '#ef4444', fontSize: 12 }} />
                <Line type="monotone" dataKey="powerPerTon" stroke="#f97316" strokeWidth={2} dot={{ r: 4, fill: '#f97316' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h3 className="text-steel-300 text-sm mb-4">用电量 / 产量双轴趋势</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dualAxisData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="powerConsumption" name="用电量(kWh)" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="production" name="产量(kg)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'shiftCompare' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="section-title mb-4"><BarChart3 className="w-5 h-5 text-lava-400" />班组平均对比</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={shiftAvgData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
                <XAxis dataKey="shift" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="powerConsumption" name="用电量(kWh)" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="production" name="产量(kg)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="powerPerTon" name="吨石电耗(kWh/t)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-glow p-6">
            <h2 className="section-title mb-4"><Award className="w-5 h-5 text-lava-400" />吨石电耗排名</h2>
            <div className="space-y-3">
              {shiftRanking.map((s, i) => (
                <div key={s.shift} className="flex items-center justify-between p-3 rounded-lg bg-furnace-800/50">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-amber-700/20 text-amber-600' : 'bg-steel-700 text-steel-400'}`}>
                      {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                    </span>
                    <span className="text-steel-200 font-medium">{s.shift}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="stat-value text-lg">{s.powerPerTon.toLocaleString()}</span>
                    <span className="text-steel-400 text-sm">kWh/t</span>
                    {s.powerPerTon <= 3300 ? <span className="badge-success">达标</span> : <span className="badge-danger">超标</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-glow p-6">
            <h2 className="section-title mb-4"><Zap className="w-5 h-5 text-lava-400" />电耗明细</h2>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>班组</th>
                    <th>用电量(kWh)</th>
                    <th>产量(kg)</th>
                    <th>吨石电耗(kWh/t)</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filtered].sort((a, b) => b.date.localeCompare(a.date) || a.shift.localeCompare(b.shift)).map(s => (
                    <tr key={s.id} className={s.powerPerTon > 3400 ? 'bg-red-900/20' : ''}>
                      <td>{s.date}</td>
                      <td>{s.shift}</td>
                      <td className="font-mono text-lava-300">{s.powerConsumption.toLocaleString()}</td>
                      <td className="font-mono text-blue-300">{s.production.toLocaleString()}</td>
                      <td className="font-mono">
                        <span className={s.powerPerTon > 3400 ? 'text-red-400' : s.powerPerTon <= 3300 ? 'text-emerald-400' : 'text-yellow-400'}>
                          {s.powerPerTon.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
