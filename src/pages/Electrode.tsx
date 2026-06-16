import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { useUIStore, filterByShiftAndDate } from '@/store/ui';
import ShiftFilterBar from '@/components/ShiftFilterBar';
import { Cylinder, Plus, ArrowDown, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ELECTRODES = ['1#电极', '2#电极', '3#电极'];
const COLORS = ['#f97316', '#3b82f6', '#10b981'];
const fmtTime = (ts: string) => ts.slice(5, 16);

const getTimeAgo = (timestamp: string): string => {
  const diffMs = new Date().getTime() - new Date(timestamp.replace(' ', 'T')).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 0) return `${diffDays}天前`;
  if (diffHours > 0) return `${diffHours}小时前`;
  if (diffMins > 0) return `${diffMins}分钟前`;
  return '刚刚';
};

export default function Electrode() {
  const [tab, setTab] = useState<'fill' | 'release'>('fill');
  const [showFillForm, setShowFillForm] = useState(false);
  const [showRelForm, setShowRelForm] = useState(false);
  const [fillForm, setFillForm] = useState({ electrodeNo: '1#电极', pasteAmount: '', operator: '' });
  const [relForm, setRelForm] = useState({ electrodeNo: '1#电极', releaseAmount: '', position: '', operator: '' });
  const { electrodeFills, electrodeReleases, addElectrodeFill, addElectrodeRelease } = useStore();
  const { shiftFilter, dateRange } = useUIStore();

  const filteredFills = useMemo(() => filterByShiftAndDate(electrodeFills, shiftFilter, dateRange), [electrodeFills, shiftFilter, dateRange]);
  const filteredReleases = useMemo(() => filterByShiftAndDate(electrodeReleases, shiftFilter, dateRange), [electrodeReleases, shiftFilter, dateRange]);

  const latestRecords = useMemo(() => {
    const latest: Record<string, { position: number; releaseAmount: number; timestamp: string }> = {};
    ELECTRODES.forEach(e => {
      const recs = electrodeReleases.filter(r => r.electrodeNo === e).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      if (recs.length) latest[e] = { position: recs[0].position, releaseAmount: recs[0].releaseAmount, timestamp: recs[0].timestamp };
    });
    return latest;
  }, [electrodeReleases]);

  const latestPositions = useMemo(() => {
    const pos: Record<string, number> = {};
    ELECTRODES.forEach(e => { if (latestRecords[e]) pos[e] = latestRecords[e].position; });
    return pos;
  }, [latestRecords]);

  const mostRecentElectrode = useMemo(() => {
    let latest = '', latestTs = '';
    ELECTRODES.forEach(e => {
      if (latestRecords[e] && latestRecords[e].timestamp > latestTs) { latestTs = latestRecords[e].timestamp; latest = e; }
    });
    return latest;
  }, [latestRecords]);

  const maxPos = useMemo(() => Math.max(...Object.values(latestPositions), 2000), [latestPositions]);

  const fillChartData = useMemo(() => {
    const sorted = [...filteredFills].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const grouped: Record<string, Record<string, number>> = {};
    sorted.forEach(r => { const key = fmtTime(r.timestamp); if (!grouped[key]) grouped[key] = {}; grouped[key][r.electrodeNo] = r.pasteAmount; });
    return Object.entries(grouped).map(([time, vals]) => ({ time, ...vals }));
  }, [filteredFills]);

  const relChartData = useMemo(() => {
    const sorted = [...filteredReleases].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const grouped: Record<string, Record<string, number>> = {};
    sorted.forEach(r => { const key = fmtTime(r.timestamp); if (!grouped[key]) grouped[key] = {}; grouped[key][r.electrodeNo] = r.releaseAmount; });
    return Object.entries(grouped).map(([time, vals]) => ({ time, ...vals }));
  }, [filteredReleases]);

  const submitFill = () => {
    if (!fillForm.pasteAmount || !fillForm.operator) return;
    addElectrodeFill({ electrodeNo: fillForm.electrodeNo, pasteAmount: Number(fillForm.pasteAmount), operator: fillForm.operator, timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ') });
    setFillForm({ electrodeNo: '1#电极', pasteAmount: '', operator: '' });
    setShowFillForm(false);
  };

  const submitRel = () => {
    if (!relForm.releaseAmount || !relForm.position || !relForm.operator) return;
    addElectrodeRelease({ electrodeNo: relForm.electrodeNo, releaseAmount: Number(relForm.releaseAmount), position: Number(relForm.position), operator: relForm.operator, timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ') });
    setRelForm({ electrodeNo: '1#电极', releaseAmount: '', position: '', operator: '' });
    setShowRelForm(false);
  };

  const Select = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select value={value} onChange={e => onChange(e.target.value)} className="input-field">
      {ELECTRODES.map(e => <option key={e} value={e}>{e}</option>)}
    </select>
  );

  const ChartLines = () => <>{ELECTRODES.map((e, i) => <Line key={e} type="monotone" dataKey={e} stroke={COLORS[i]} strokeWidth={2} dot={{ r: 3 }} />)}</>;

  const ChartConfig = () => (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
      <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 12 }} />
      <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a3a5c', borderRadius: 8 }} />
      <Legend />
    </>
  );

  return (
    <div className="space-y-6">
      <ShiftFilterBar />
      <div className="card-glow p-6">
        <h2 className="section-title mb-4"><Activity className="w-5 h-5 text-lava-400" />最新状态</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ELECTRODES.map((e, i) => {
            const rec = latestRecords[e];
            const isRecent = e === mostRecentElectrode;
            return (
              <div key={e} className={`relative p-4 rounded-lg border transition-all ${isRecent ? 'border-lava-500/50 bg-lava-500/10' : 'border-furnace-600/50 bg-furnace-800/30'}`}>
                {isRecent && <span className="absolute top-2 right-2 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lava-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-lava-500"></span></span>}
                <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} /><span className="text-sm font-medium text-steel-200">{e}</span></div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-steel-400">当前位置</span><span className="font-mono text-blue-300">{rec ? `${rec.position}mm` : '--'}</span></div>
                  <div className="flex justify-between"><span className="text-steel-400">上次下放</span><span className="font-mono text-lava-300">{rec ? `${rec.releaseAmount}mm` : '--'}</span></div>
                  <div className="flex justify-between"><span className="text-steel-400">距上次</span><span className="text-steel-300">{rec ? getTimeAgo(rec.timestamp) : '--'}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setTab('fill')} className={tab === 'fill' ? 'btn-primary' : 'btn-secondary'}><Cylinder className="w-4 h-4 inline mr-1" />电极糊填充</button>
        <button onClick={() => setTab('release')} className={tab === 'release' ? 'btn-primary' : 'btn-secondary'}><ArrowDown className="w-4 h-4 inline mr-1" />电极下放</button>
      </div>
      {tab === 'fill' && (
        <div className="space-y-6">
          <div className="card-glow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title"><Cylinder className="w-5 h-5 text-lava-400" />填充记录</h2>
              <button onClick={() => setShowFillForm(!showFillForm)} className="btn-primary text-sm"><Plus className="w-4 h-4 inline mr-1" />添加填充记录</button>
            </div>
            {showFillForm && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4 p-4 bg-furnace-800/50 rounded-lg">
                <Select value={fillForm.electrodeNo} onChange={v => setFillForm({ ...fillForm, electrodeNo: v })} />
                <input type="number" placeholder="糊填充量(kg)" value={fillForm.pasteAmount} onChange={e => setFillForm({ ...fillForm, pasteAmount: e.target.value })} className="input-field" />
                <input type="text" placeholder="操作人" value={fillForm.operator} onChange={e => setFillForm({ ...fillForm, operator: e.target.value })} className="input-field" />
                <button onClick={submitFill} className="btn-primary">确认添加</button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>电极编号</th><th>糊填充量(kg)</th><th>操作人</th><th>时间</th></tr></thead>
                <tbody>{filteredFills.map(r => (<tr key={r.id}><td>{r.electrodeNo}</td><td className="font-mono text-lava-300">{r.pasteAmount}</td><td>{r.operator}</td><td className="text-steel-400 text-xs">{r.timestamp}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="section-title mb-4"><TrendingUp className="w-5 h-5 text-lava-400" />糊填充量趋势</h2>
            <ResponsiveContainer width="100%" height={280}><LineChart data={fillChartData}><ChartConfig /><ChartLines /></LineChart></ResponsiveContainer>
          </div>
        </div>
      )}
      {tab === 'release' && (
        <div className="space-y-6">
          <div className="card-glow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title"><ArrowDown className="w-5 h-5 text-lava-400" />下放记录</h2>
              <button onClick={() => setShowRelForm(!showRelForm)} className="btn-primary text-sm"><Plus className="w-4 h-4 inline mr-1" />添加下放记录</button>
            </div>
            {showRelForm && (
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4 p-4 bg-furnace-800/50 rounded-lg">
                <Select value={relForm.electrodeNo} onChange={v => setRelForm({ ...relForm, electrodeNo: v })} />
                <input type="number" placeholder="下放量(mm)" value={relForm.releaseAmount} onChange={e => setRelForm({ ...relForm, releaseAmount: e.target.value })} className="input-field" />
                <input type="number" placeholder="位置(mm)" value={relForm.position} onChange={e => setRelForm({ ...relForm, position: e.target.value })} className="input-field" />
                <input type="text" placeholder="操作人" value={relForm.operator} onChange={e => setRelForm({ ...relForm, operator: e.target.value })} className="input-field" />
                <button onClick={submitRel} className="btn-primary">确认添加</button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>电极编号</th><th>下放量(mm)</th><th>位置(mm)</th><th>操作人</th><th>时间</th></tr></thead>
                <tbody>{filteredReleases.map(r => (<tr key={r.id}><td>{r.electrodeNo}</td><td className="font-mono text-lava-300">{r.releaseAmount}</td><td className="font-mono text-blue-300">{r.position}</td><td>{r.operator}</td><td className="text-steel-400 text-xs">{r.timestamp}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="section-title mb-4"><Cylinder className="w-5 h-5 text-lava-400" />电极位置图</h2>
              <div className="flex items-end justify-center gap-8 h-56 pt-4">
                {ELECTRODES.map((e, i) => {
                  const pos = latestPositions[e] || 0;
                  const h = (pos / maxPos) * 180;
                  const isRecent = e === mostRecentElectrode;
                  return (
                    <div key={e} className="flex flex-col items-center gap-2">
                      <span className="text-xs font-mono text-steel-300">{pos}mm</span>
                      <div className={`w-14 rounded-t-lg transition-all duration-500 ${isRecent ? 'animate-pulse' : ''}`} style={{ height: `${h}px`, background: `linear-gradient(to top, ${COLORS[i]}, ${COLORS[i]}88)` }} />
                      <span className="text-sm text-steel-200">{e}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card p-6">
              <h2 className="section-title mb-4"><TrendingUp className="w-5 h-5 text-lava-400" />下放量趋势</h2>
              <ResponsiveContainer width="100%" height={280}><LineChart data={relChartData}><ChartConfig /><ChartLines /></LineChart></ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
