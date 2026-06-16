import { useStore } from '@/store';
import { useUIStore, filterByShiftAndDate } from '@/store/ui';
import ShiftFilterBar from '@/components/ShiftFilterBar';
import { Package, Zap, Flame, Droplets, AlertTriangle, Activity, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { castings, furnaceReadings, powerStats, tappings, temperatureReadings, feedings } = useStore();
  const { shiftFilter, dateRange } = useUIStore();

  const latestReading = [...furnaceReadings].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];

  const filteredCastings = filterByShiftAndDate(castings, shiftFilter, dateRange);
  const todayOutput = filteredCastings.reduce((s, c) => s + c.liquidWeight, 0);

  const filteredTappings = tappings.filter(t => {
    if (shiftFilter !== 'all') {
      const hour = parseInt(t.startTime.slice(11, 13), 10);
      const isDay = hour >= 8 && hour < 20;
      if (shiftFilter === 'day' ? !isDay : isDay) return false;
    }
    if (dateRange) {
      const date = t.startTime.slice(0, 10);
      if (date < dateRange.start || date > dateRange.end) return false;
    }
    return true;
  });
  const pendingTappings = filteredTappings.length;

  const filteredPowerStats = powerStats.filter(p => {
    if (dateRange) {
      if (p.date < dateRange.start || p.date > dateRange.end) return false;
    }
    return true;
  });
  const latestPowerStats = [...filteredPowerStats].sort((a, b) => b.date.localeCompare(a.date))[0];

  const filteredReadings = filterByShiftAndDate(furnaceReadings, shiftFilter, dateRange);
  const readings = [...filteredReadings]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(-12)
    .map(r => ({ time: r.timestamp.slice(11, 16), power: r.power }));

  const filteredAlarms = filterByShiftAndDate(temperatureReadings, shiftFilter, dateRange);
  const alarms = filteredAlarms
    .filter(r => r.isAlarm)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);

  const filteredFeedings = filterByShiftAndDate(feedings, shiftFilter, dateRange);
  const recentFeedings = [...filteredFeedings]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);

  const phaseMax = latestReading ? Math.max(latestReading.phaseA, latestReading.phaseB, latestReading.phaseC) : 1;

  return (
    <div className="space-y-6">
      <ShiftFilterBar />

      <div className="grid grid-cols-4 gap-4">
        <div className="card-glow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-lava-400" />
            <span className="text-xs text-steel-400">今日产量</span>
          </div>
          <div className="stat-value text-lava-300">{todayOutput.toLocaleString()}<span className="text-sm text-steel-500 ml-1">kg</span></div>
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-steel-400">当前功率</span>
          </div>
          <div className="stat-value text-amber-300">{latestReading?.power.toLocaleString()}<span className="text-sm text-steel-500 ml-1">kW</span></div>
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-ember-400" />
            <span className="text-xs text-steel-400">吨石电耗</span>
          </div>
          <div className="stat-value text-ember-300">{latestPowerStats?.powerPerTon ?? '-'}<span className="text-sm text-steel-500 ml-1">kWh/t</span></div>
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-steel-400">待出炉</span>
          </div>
          <div className="stat-value text-blue-300">{pendingTappings}<span className="text-sm text-steel-500 ml-1">炉</span></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0"><Activity className="w-4 h-4 text-lava-400" />三相电流</h3>
            <div className="flex items-center gap-1 text-xs text-steel-500">
              <Info className="w-3 h-3" />
              <span>当前炉况不受筛选</span>
            </div>
          </div>
          {latestReading && (
            <div className="space-y-4">
              {([
                { label: 'A相', value: latestReading.phaseA, color: 'bg-lava-400' },
                { label: 'B相', value: latestReading.phaseB, color: 'bg-amber-400' },
                { label: 'C相', value: latestReading.phaseC, color: 'bg-blue-400' },
              ] as const).map(p => (
                <div key={p.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-steel-300">{p.label}</span>
                    <span className="font-mono text-steel-200">{p.value.toLocaleString()} A</span>
                  </div>
                  <div className="h-3 rounded-full bg-furnace-800 overflow-hidden">
                    <div className={`h-full rounded-full ${p.color} transition-all duration-500`} style={{ width: `${(p.value / phaseMax) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 col-span-2">
          <h3 className="section-title mb-4"><Zap className="w-4 h-4 text-lava-400" />功率趋势</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={readings}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#16213e', border: '1px solid #2a3a5c', borderRadius: 8 }}
                labelStyle={{ color: '#cbd5e1' }}
                itemStyle={{ color: '#f97316' }}
              />
              <Line type="monotone" dataKey="power" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="section-title mb-4"><AlertTriangle className="w-4 h-4 text-ember-400" />温度报警</h3>
          {alarms.length === 0 ? (
            <div className="text-sm text-steel-500 text-center py-4">暂无报警</div>
          ) : (
            <div className="space-y-2">
              {alarms.map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-furnace-800/60">
                  <div className="flex items-center gap-2">
                    <span className="badge-danger">{a.pointNo}</span>
                    <span className="font-mono text-ember-300 text-sm">{a.temperature}°C</span>
                  </div>
                  <span className="text-xs text-steel-500 font-mono">{a.timestamp.slice(11, 16)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="section-title mb-4"><Droplets className="w-4 h-4 text-lava-400" />最近上料</h3>
          <div className="space-y-2">
            {recentFeedings.map(f => (
              <div key={f.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-furnace-800/60">
                <div className="flex items-center gap-2">
                  <span className={`badge ${f.material === 'lime' ? 'badge-info' : 'badge-warning'}`}>
                    {f.material === 'lime' ? '石灰' : '焦炭'}
                  </span>
                  <span className="text-sm text-steel-200">{f.siloNo}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-steel-300">{f.weight}kg</span>
                  <span className="text-xs text-steel-500 font-mono">{f.timestamp.slice(11, 16)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
