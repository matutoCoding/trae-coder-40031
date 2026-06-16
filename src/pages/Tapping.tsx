import { useState, useMemo } from 'react';
import { Droplets, Plus, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '@/store';
import { useUIStore, filterByShiftAndDate, isDayShift, inDateRange } from '@/store/ui';
import ShiftFilterBar from '@/components/ShiftFilterBar';

const POTS = ['锅-01', '锅-02', '锅-03', '锅-04', '锅-05', '锅-06'];

const getTimeAgo = (ts: string): string => {
  const diff = new Date().getTime() - new Date(ts.replace(' ', 'T')).getTime();
  const d = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000), m = Math.floor(diff / 60000);
  if (d > 0) return `${d}天前`; if (h > 0) return `${h}小时前`; if (m > 0) return `${m}分钟前`; return '刚刚';
};

export default function Tapping() {
  const { tappings, castings, addTapping, addCasting } = useStore();
  const { shiftFilter, dateRange } = useUIStore();
  const [tab, setTab] = useState(0);
  const [showTappingForm, setShowTappingForm] = useState(false);
  const [showCastingForm, setShowCastingForm] = useState(false);
  const [tForm, setTForm] = useState({ burnThroughMethod: '烧穿器', burnDuration: 0, operator: '', startTime: '', endTime: '' });
  const [cForm, setCForm] = useState({ potNo: '锅-01', liquidWeight: 0, operator: '' });

  const autoTapNo = () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = tappings.filter(t => t.tapNo.includes(today)).length + 1;
    return `TP-${today}-${String(count).padStart(2, '0')}`;
  };

  const handleTappingSubmit = () => {
    if (!tForm.burnDuration || !tForm.operator.trim() || !tForm.startTime || !tForm.endTime) return;
    addTapping({
      tapNo: autoTapNo(),
      burnThroughMethod: tForm.burnThroughMethod,
      burnDuration: tForm.burnDuration,
      operator: tForm.operator.trim(),
      startTime: tForm.startTime.replace('T', ' '),
      endTime: tForm.endTime.replace('T', ' '),
    });
    setTForm({ burnThroughMethod: '烧穿器', burnDuration: 0, operator: '', startTime: '', endTime: '' });
    setShowTappingForm(false);
  };

  const handleCastingSubmit = () => {
    if (!cForm.liquidWeight || !cForm.operator.trim()) return;
    addCasting({
      potNo: cForm.potNo,
      liquidWeight: cForm.liquidWeight,
      operator: cForm.operator.trim(),
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });
    setCForm({ potNo: '锅-01', liquidWeight: 0, operator: '' });
    setShowCastingForm(false);
  };

  const filteredTappings = useMemo(() => {
    return tappings.filter(t => {
      if (shiftFilter !== 'all') {
        const isDay = isDayShift(t.startTime);
        if (shiftFilter === 'day' ? !isDay : isDay) return false;
      }
      return inDateRange(t.startTime, dateRange);
    });
  }, [tappings, shiftFilter, dateRange]);

  const filteredCastings = useMemo(() =>
    filterByShiftAndDate(castings, shiftFilter, dateRange),
    [castings, shiftFilter, dateRange]
  );

  const timelineData = useMemo(() => {
    if (!filteredTappings.length) return [];
    const sorted = [...filteredTappings].sort((a, b) => a.startTime.localeCompare(b.startTime));
    return sorted.map(t => ({
      ...t,
      startMs: new Date(t.startTime.replace(' ', 'T')).getTime(),
      endMs: new Date(t.endTime.replace(' ', 'T')).getTime(),
    }));
  }, [filteredTappings]);

  const potLatest = useMemo(() => {
    const map = new Map<string, typeof castings[0]>();
    const sorted = [...castings].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    sorted.forEach(c => {
      if (!map.has(c.potNo)) map.set(c.potNo, c);
    });
    return POTS.map(p => map.get(p)).filter(Boolean) as typeof castings;
  }, [castings]);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    filteredCastings.forEach(c => { map.set(c.potNo, (map.get(c.potNo) || 0) + c.liquidWeight); });
    return POTS.map(p => ({ potNo: p, weight: map.get(p) || 0 }));
  }, [filteredCastings]);

  const potColor = (w: number) => w >= 2800 ? 'border-red-500/60 bg-red-500/10' : w >= 2600 ? 'border-amber-500/60 bg-amber-500/10' : 'border-green-500/60 bg-green-500/10';

  const freshGlow = (ts: string) => new Date().getTime() - new Date(ts.replace(' ', 'T')).getTime() < 1800000 ? 'ring-2 ring-lime-400/60 ring-offset-1 ring-offset-furnace-900 animate-pulse' : '';

  const timelineMin = timelineData.length ? Math.min(...timelineData.map(t => t.startMs)) : 0;
  const timelineMax = timelineData.length ? Math.max(...timelineData.map(t => t.endMs)) : 1;
  const timelineRange = timelineMax - timelineMin || 1;

  return (
    <div className="space-y-6">
      <ShiftFilterBar />

      <div className="flex gap-2">
        {['出炉烧穿', '电石锅浇铸'].map((label, i) => (
          <button key={label} onClick={() => setTab(i)}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${tab === i ? 'bg-lava-600 text-white shadow-lg shadow-lava-600/30' : 'bg-furnace-700 text-steel-400 hover:text-steel-200'}`}>
            {i === 0 ? <Flame className="w-4 h-4 inline mr-1.5" /> : <Droplets className="w-4 h-4 inline mr-1.5" />}{label}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="section-title"><Flame className="w-5 h-5 text-lava-400" />出炉烧穿记录</h2>
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowTappingForm(!showTappingForm)}>
              <Plus className="w-4 h-4" />新增出炉记录
            </button>
          </div>

          {showTappingForm && (
            <div className="card-glow p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-steel-400 mb-1.5">出炉编号</label>
                  <input className="input-field w-full bg-furnace-800/60 cursor-not-allowed" value={autoTapNo()} disabled readOnly />
                </div>
                <div>
                  <label className="block text-xs text-steel-400 mb-1.5">烧穿方式</label>
                  <select className="input-field w-full" value={tForm.burnThroughMethod} onChange={e => setTForm(f => ({ ...f, burnThroughMethod: e.target.value }))}>
                    <option value="烧穿器">烧穿器</option>
                    <option value="氧管烧穿">氧管烧穿</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-steel-400 mb-1.5">烧穿时长 (min)</label>
                  <input type="number" className="input-field w-full" value={tForm.burnDuration || ''} onChange={e => setTForm(f => ({ ...f, burnDuration: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-xs text-steel-400 mb-1.5">操作人</label>
                  <input className="input-field w-full" value={tForm.operator} onChange={e => setTForm(f => ({ ...f, operator: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-steel-400 mb-1.5">开始时间</label>
                  <input type="datetime-local" className="input-field w-full" value={tForm.startTime} onChange={e => setTForm(f => ({ ...f, startTime: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-steel-400 mb-1.5">结束时间</label>
                  <input type="datetime-local" className="input-field w-full" value={tForm.endTime} onChange={e => setTForm(f => ({ ...f, endTime: e.target.value }))} />
                </div>
              </div>
              <button className="btn-primary" onClick={handleTappingSubmit}>确认提交</button>
            </div>
          )}

          <div className="card-glow overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>出炉编号</th><th>烧穿方式</th><th>烧穿时长(min)</th><th>操作人</th><th>开始时间</th><th>结束时间</th>
                </tr>
              </thead>
              <tbody>
                {filteredTappings.map(t => (
                  <tr key={t.id}>
                    <td className="font-mono text-steel-300">{t.tapNo}</td>
                    <td>{t.burnThroughMethod === '烧穿器' ? <span className="badge-info">烧穿器</span> : <span className="badge-warning">氧管烧穿</span>}</td>
                    <td className="font-mono">{t.burnDuration}</td>
                    <td>{t.operator}</td>
                    <td className="text-steel-400 text-xs">{t.startTime}</td>
                    <td className="text-steel-400 text-xs">{t.endTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card-glow p-5">
            <h3 className="section-title mb-4">出炉时间线</h3>
            <div className="space-y-2">
              {timelineData.map(t => (
                <div key={t.id} className="flex items-center gap-3">
                  <span className="text-xs text-steel-400 font-mono w-28 shrink-0">{t.tapNo}</span>
                  <div className="flex-1 h-7 bg-furnace-800 rounded relative">
                    <div className={`absolute top-0.5 bottom-0.5 rounded ${t.burnThroughMethod === '烧穿器' ? 'bg-blue-500/70' : 'bg-amber-500/70'}`}
                      style={{ left: `${((t.startMs - timelineMin) / timelineRange) * 100}%`, width: `${Math.max(((t.endMs - t.startMs) / timelineRange) * 100, 2)}%` }} />
                  </div>
                  <span className="text-xs text-steel-400 shrink-0">{t.burnDuration}min</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 1 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="section-title"><Droplets className="w-5 h-5 text-lava-400" />电石锅浇铸记录</h2>
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowCastingForm(!showCastingForm)}>
              <Plus className="w-4 h-4" />新增浇铸记录
            </button>
          </div>

          {showCastingForm && (
            <div className="card-glow p-5 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-steel-400 mb-1.5">锅号</label>
                  <select className="input-field w-full" value={cForm.potNo} onChange={e => setCForm(f => ({ ...f, potNo: e.target.value }))}>
                    {POTS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-steel-400 mb-1.5">液态电石量 (kg)</label>
                  <input type="number" className="input-field w-full" value={cForm.liquidWeight || ''} onChange={e => setCForm(f => ({ ...f, liquidWeight: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-xs text-steel-400 mb-1.5">操作人</label>
                  <input className="input-field w-full" value={cForm.operator} onChange={e => setCForm(f => ({ ...f, operator: e.target.value }))} />
                </div>
              </div>
              <button className="btn-primary" onClick={handleCastingSubmit}>确认提交</button>
            </div>
          )}

          <div className="card-glow overflow-hidden">
            <table className="data-table">
              <thead>
                <tr><th>锅号</th><th>液态电石量(kg)</th><th>操作人</th><th>时间</th></tr>
              </thead>
              <tbody>
                {filteredCastings.map(c => (
                  <tr key={c.id}>
                    <td className="font-mono text-steel-300">{c.potNo}</td>
                    <td className="font-mono">{c.liquidWeight.toLocaleString()}</td>
                    <td>{c.operator}</td>
                    <td className="text-steel-400 text-xs">{c.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-glow p-5">
              <h3 className="section-title mb-4">电石锅状态</h3>
              <div className="grid grid-cols-3 gap-3">
                {potLatest.map(c => (
                  <div key={c.id} className={`rounded-lg border p-3 ${potColor(c.liquidWeight)} ${freshGlow(c.timestamp)}`}>
                    <div className="text-sm font-bold text-steel-200">{c.potNo}</div>
                    <div className="stat-value text-lg">{c.liquidWeight.toLocaleString()}<span className="text-xs text-steel-400 ml-1">kg</span></div>
                    <div className="text-xs text-steel-400 mt-1">{c.operator}</div>
                    <div className="text-xs text-steel-500 mt-0.5">{getTimeAgo(c.timestamp)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-glow p-5">
              <h3 className="section-title mb-4">各锅浇铸量统计</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
                  <XAxis dataKey="potNo" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a3a5c', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#e2e8f0' }} />
                  <Bar dataKey="weight" name="浇铸量(kg)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
