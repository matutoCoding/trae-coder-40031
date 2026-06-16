import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { Flame, Thermometer, Zap, AlertTriangle } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';

const PHASE_COLORS = { A: '#f97316', B: '#f59e0b', C: '#3b82f6' };
const PHASE_RING = { A: 'lava', B: 'amber', C: 'blue' } as const;
const ALARM_THRESHOLD = 1150;

const fmtTime = (ts: string) => ts.slice(5, 16);

export default function Smelting() {
  const [tab, setTab] = useState<'current' | 'temp'>('current');
  const { furnaceReadings, temperatureReadings } = useStore();

  const sorted = useMemo(
    () => [...furnaceReadings].sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    [furnaceReadings],
  );
  const latest = sorted[sorted.length - 1];
  const last12 = sorted.slice(-12);

  const currentChartData = useMemo(
    () => last12.map(r => ({
      time: fmtTime(r.timestamp),
      A相: r.phaseA,
      B相: r.phaseB,
      C相: r.phaseC,
    })),
    [last12],
  );

  const powerChartData = useMemo(
    () => last12.map(r => ({
      time: fmtTime(r.timestamp),
      功率: r.power,
    })),
    [last12],
  );

  const latestTemps = useMemo(() => {
    const map = new Map<string, { temperature: number; isAlarm: boolean }>();
    temperatureReadings.forEach(r => map.set(r.pointNo, { temperature: r.temperature, isAlarm: r.isAlarm }));
    return map;
  }, [temperatureReadings]);

  const POINTS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'];

  const tempBarData = useMemo(
    () => POINTS.map(p => {
      const d = latestTemps.get(p);
      return { 测点: p, 温度: d?.temperature ?? 0, isAlarm: d?.isAlarm ?? false };
    }),
    [latestTemps],
  );

  const gaugeCard = (label: string, value: number, unit: string, ring: string, color: string) => (
    <div className="card-glow p-4 flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#2a3a5c" strokeWidth="6" />
        <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${(value / 35000) * 264} 264`}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }} />
        <text x="50" y="46" textAnchor="middle" fill={color} fontSize="14" fontFamily="monospace" fontWeight="bold">
          {value.toLocaleString()}
        </text>
        <text x="50" y="62" textAnchor="middle" fill="#94a3b8" fontSize="9">{unit}</text>
      </svg>
      <span className="text-steel-300 text-sm mt-1">{label}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={() => setTab('current')} className={tab === 'current' ? 'btn-primary' : 'btn-secondary'}>
          <Flame className="w-4 h-4 inline mr-1" />炉电流功率
        </button>
        <button onClick={() => setTab('temp')} className={tab === 'temp' ? 'btn-primary' : 'btn-secondary'}>
          <Thermometer className="w-4 h-4 inline mr-1" />料面温度
        </button>
      </div>

      {tab === 'current' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {gaugeCard('A相电流', latest?.phaseA ?? 0, 'A', PHASE_RING.A, PHASE_COLORS.A)}
            {gaugeCard('B相电流', latest?.phaseB ?? 0, 'A', PHASE_RING.B, PHASE_COLORS.B)}
            {gaugeCard('C相电流', latest?.phaseC ?? 0, 'A', PHASE_RING.C, PHASE_COLORS.C)}
            <div className="card-glow p-4 flex flex-col items-center justify-center">
              <Zap className="w-8 h-8 text-lava-400 mb-2" />
              <span className="stat-value text-lava-300">{latest?.power?.toLocaleString() ?? 0}</span>
              <span className="text-steel-400 text-sm">kW</span>
              <span className="text-steel-300 text-sm mt-1">当前功率</span>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="section-title mb-4"><Flame className="w-5 h-5 text-lava-400" />三相电流趋势</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={currentChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a3a5c', borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="A相" stroke={PHASE_COLORS.A} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="B相" stroke={PHASE_COLORS.B} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="C相" stroke={PHASE_COLORS.C} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h2 className="section-title mb-4"><Zap className="w-5 h-5 text-amber-400" />功率趋势</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={powerChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a3a5c', borderRadius: 8 }} />
                <Line type="monotone" dataKey="功率" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }}
                  fill="#f97316" fillOpacity={0.1} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'temp' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {POINTS.map(p => {
              const d = latestTemps.get(p);
              const alarm = d?.isAlarm ?? false;
              return (
                <div key={p} className={`card-glow p-4 border ${alarm ? 'border-ember-500/60' : 'border-emerald-500/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-steel-300 text-sm font-medium">{p}</span>
                    {alarm && <AlertTriangle className="w-4 h-4 text-ember-400" />}
                  </div>
                  <span className={`stat-value ${alarm ? 'text-ember-400' : 'text-emerald-400'}`}>
                    {d?.temperature ?? '--'}
                  </span>
                  <span className="text-steel-400 text-xs ml-1">°C</span>
                  <div className={`mt-2 h-1 rounded-full ${alarm ? 'bg-ember-500/50' : 'bg-emerald-500/30'}`} />
                  {alarm && <span className="badge-danger mt-2 text-xs">超温报警</span>}
                </div>
              );
            })}
          </div>

          <div className="card p-6">
            <h2 className="section-title mb-4">
              <Thermometer className="w-5 h-5 text-lava-400" />料面温度分布
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tempBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
                <XAxis dataKey="测点" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={[0, 'auto']} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a3a5c', borderRadius: 8 }} />
                <ReferenceLine y={ALARM_THRESHOLD} stroke="#f87171" strokeDasharray="8 4" label={{ value: '报警线', fill: '#f87171', fontSize: 12 }} />
                <Bar dataKey="温度" radius={[4, 4, 0, 0]}
                  fill="#10b981">
                  {tempBarData.map((entry: { isAlarm?: boolean }, idx: number) => (
                    <Cell key={idx} fill={entry.isAlarm ? '#f87171' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
