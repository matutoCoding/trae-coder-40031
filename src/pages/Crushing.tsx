import { useState } from 'react';
import { Package, Plus, Thermometer, Archive } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, ReferenceLine, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useStore } from '@/store';
import ShiftFilterBar from '@/components/ShiftFilterBar';
import { useUIStore, filterByShiftAndDate } from '@/store/ui';

const PARTICLE_SIZES = ['5-25mm', '25-50mm', '50-200mm', '200mm+'];
const WAREHOUSES = ['A区1号库', 'A区2号库', 'B区1号库', 'B区2号库'];
const GRADE_MAP: Record<string, { label: string; cls: string }> = {
  premium: { label: '优等品', cls: 'badge-success' },
  first: { label: '一等品', cls: 'badge-info' },
  qualified: { label: '合格品', cls: 'badge-warning' },
  offgrade: { label: '等外品', cls: 'badge-danger' },
};
const GRADE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];
const CHART_STYLE = { background: '#1a1a2e', border: '1px solid rgba(42,58,92,0.5)', borderRadius: '8px', fontSize: '13px' };

const genBatchNo = () => {
  const d = new Date();
  const ds = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `CR-${ds}-${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}`;
};
const nowStr = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
const tabs = [{ label: '冷却破碎', icon: Package }, { label: '发气量检测', icon: Thermometer }, { label: '入库分级', icon: Archive }];

export default function Crushing() {
  const { crushings, gasTests, storages, addCrushing, addGasTest, addStorage } = useStore();
  const { shiftFilter, dateRange } = useUIStore();
  const [tab, setTab] = useState(0);
  const [showCrushForm, setShowCrushForm] = useState(false);
  const [crushForm, setCrushForm] = useState({ coolingHours: 6, particleSize: '50-200mm', crushedWeight: 0, operator: '' });
  const [showGasForm, setShowGasForm] = useState(false);
  const [gasForm, setGasForm] = useState({ batchNo: '', gasVolume: 0, isQualified: true, tester: '' });
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [storeForm, setStoreForm] = useState({ batchNo: '', grade: 'first' as 'premium' | 'first' | 'qualified' | 'offgrade', quantity: 0, warehouse: 'A区1号库', operator: '' });

  const filteredCrushings = filterByShiftAndDate(crushings, shiftFilter, dateRange);
  const filteredGasTests = filterByShiftAndDate(gasTests.map(g => ({ ...g, timestamp: g.testTime })), shiftFilter, dateRange);
  const filteredStorages = filterByShiftAndDate(storages, shiftFilter, dateRange);

  const handleAddCrush = () => {
    if (!crushForm.operator) return;
    addCrushing({ batchNo: genBatchNo(), ...crushForm, timestamp: nowStr() });
    setCrushForm({ coolingHours: 6, particleSize: '50-200mm', crushedWeight: 0, operator: '' });
    setShowCrushForm(false);
  };
  const handleAddGas = () => {
    if (!gasForm.batchNo || !gasForm.tester) return;
    addGasTest({ ...gasForm, testTime: nowStr() });
    setGasForm({ batchNo: '', gasVolume: 0, isQualified: true, tester: '' });
    setShowGasForm(false);
  };
  const handleAddStore = () => {
    if (!storeForm.batchNo || !storeForm.operator) return;
    addStorage({ ...storeForm, timestamp: nowStr() });
    setStoreForm({ batchNo: '', grade: 'first', quantity: 0, warehouse: 'A区1号库', operator: '' });
    setShowStoreForm(false);
  };

  const barData = filteredCrushings.map(c => ({ name: c.batchNo.slice(-6), 破碎量: c.crushedWeight }));
  const lineData = filteredGasTests.map(g => ({ name: g.batchNo.slice(-6), 发气量: g.gasVolume }));
  const pieData = Object.entries(
    filteredStorages.reduce<Record<string, number>>((acc, s) => { acc[s.grade] = (acc[s.grade] || 0) + s.quantity; return acc; }, {})
  ).map(([grade, qty]) => ({ name: GRADE_MAP[grade]?.label ?? grade, value: qty }));

  const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1"><label className="text-xs text-steel-400">{label}</label>{children}</div>
  );

  return (
    <div className="space-y-6">
      <ShiftFilterBar />
      <div className="flex gap-2">
        {tabs.map((t, i) => (
          <button key={i} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${tab === i ? 'bg-lava-500/20 text-lava-400 border border-lava-500/30' : 'bg-furnace-800/50 text-steel-400 border border-transparent hover:text-steel-200'}`} onClick={() => setTab(i)}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="section-title"><Package className="w-5 h-5 text-lava-400" />冷却破碎记录</div>
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowCrushForm(!showCrushForm)}><Plus className="w-4 h-4" />新增破碎记录</button>
          </div>
          {showCrushForm && (
            <div className="card-glow p-4 flex flex-wrap items-end gap-4">
              <FormField label="批次号"><input className="input-field w-40" value="自动生成" disabled /></FormField>
              <FormField label="冷却时长(h)"><input className="input-field w-24" type="number" value={crushForm.coolingHours} onChange={e => setCrushForm(f => ({ ...f, coolingHours: +e.target.value }))} /></FormField>
              <FormField label="粒度">
                <select className="input-field w-32" value={crushForm.particleSize} onChange={e => setCrushForm(f => ({ ...f, particleSize: e.target.value }))}>
                  {PARTICLE_SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="破碎量(kg)"><input className="input-field w-28" type="number" value={crushForm.crushedWeight} onChange={e => setCrushForm(f => ({ ...f, crushedWeight: +e.target.value }))} /></FormField>
              <FormField label="操作人"><input className="input-field w-28" value={crushForm.operator} onChange={e => setCrushForm(f => ({ ...f, operator: e.target.value }))} /></FormField>
              <button className="btn-primary" onClick={handleAddCrush}>确认添加</button>
              <button className="btn-secondary" onClick={() => setShowCrushForm(false)}>取消</button>
            </div>
          )}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card overflow-hidden">
              <table className="data-table">
                <thead><tr><th>批次号</th><th>冷却时长(h)</th><th>粒度</th><th>破碎量(kg)</th><th>操作人</th><th>时间</th></tr></thead>
                <tbody>
                  {filteredCrushings.map(c => (
                    <tr key={c.id}>
                      <td className="font-medium text-steel-100">{c.batchNo}</td>
                      <td className="font-mono">{c.coolingHours}</td>
                      <td>{c.particleSize}</td>
                      <td className="font-mono">{c.crushedWeight}</td>
                      <td>{c.operator}</td>
                      <td className="text-steel-400 text-xs">{c.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-glow p-5">
              <div className="section-title mb-4">各批次破碎量</div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,58,92,0.4)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Bar dataKey="破碎量" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {tab === 1 && (
        <>
          <div className="flex items-center justify-between">
            <div className="section-title"><Thermometer className="w-5 h-5 text-lava-400" />发气量检测记录</div>
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowGasForm(!showGasForm)}><Plus className="w-4 h-4" />新增检测记录</button>
          </div>
          {showGasForm && (
            <div className="card-glow p-4 flex flex-wrap items-end gap-4">
              <FormField label="批次号">
                <select className="input-field w-44" value={gasForm.batchNo} onChange={e => setGasForm(f => ({ ...f, batchNo: e.target.value }))}>
                  <option value="">选择批次</option>
                  {crushings.map(c => <option key={c.id} value={c.batchNo}>{c.batchNo}</option>)}
                </select>
              </FormField>
              <FormField label="发气量(L/kg)"><input className="input-field w-28" type="number" value={gasForm.gasVolume} onChange={e => setGasForm(f => ({ ...f, gasVolume: +e.target.value }))} /></FormField>
              <FormField label="&nbsp;">
                <label className="text-xs text-steel-400 flex items-center gap-2">
                  <input type="checkbox" checked={gasForm.isQualified} onChange={e => setGasForm(f => ({ ...f, isQualified: e.target.checked }))} />是否合格
                </label>
              </FormField>
              <FormField label="检测人"><input className="input-field w-28" value={gasForm.tester} onChange={e => setGasForm(f => ({ ...f, tester: e.target.value }))} /></FormField>
              <button className="btn-primary" onClick={handleAddGas}>确认添加</button>
              <button className="btn-secondary" onClick={() => setShowGasForm(false)}>取消</button>
            </div>
          )}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card overflow-hidden">
              <table className="data-table">
                <thead><tr><th>批次号</th><th>发气量(L/kg)</th><th>是否合格</th><th>检测人</th><th>检测时间</th></tr></thead>
                <tbody>
                  {filteredGasTests.map(g => (
                    <tr key={g.id}>
                      <td className="font-medium text-steel-100">{g.batchNo}</td>
                      <td className="font-mono">{g.gasVolume}</td>
                      <td><span className={g.isQualified ? 'badge-success' : 'badge-danger'}>{g.isQualified ? '合格' : '不合格'}</span></td>
                      <td>{g.tester}</td>
                      <td className="text-steel-400 text-xs">{g.testTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-glow p-5">
              <div className="section-title mb-4">发气量趋势 (标准: 285 L/kg)</div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,58,92,0.4)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[250, 320]} />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <ReferenceLine y={285} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '285', fill: '#ef4444', fontSize: 12 }} />
                  <Line type="monotone" dataKey="发气量" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {tab === 2 && (
        <>
          <div className="flex items-center justify-between">
            <div className="section-title"><Archive className="w-5 h-5 text-lava-400" />入库分级记录</div>
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowStoreForm(!showStoreForm)}><Plus className="w-4 h-4" />新增入库记录</button>
          </div>
          {showStoreForm && (
            <div className="card-glow p-4 flex flex-wrap items-end gap-4">
              <FormField label="批次号"><input className="input-field w-44" value={storeForm.batchNo} onChange={e => setStoreForm(f => ({ ...f, batchNo: e.target.value }))} /></FormField>
              <FormField label="等级">
                <select className="input-field w-28" value={storeForm.grade} onChange={e => setStoreForm(f => ({ ...f, grade: e.target.value as 'premium' | 'first' | 'qualified' | 'offgrade' }))}>
                  {Object.entries(GRADE_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </FormField>
              <FormField label="数量(kg)"><input className="input-field w-28" type="number" value={storeForm.quantity} onChange={e => setStoreForm(f => ({ ...f, quantity: +e.target.value }))} /></FormField>
              <FormField label="仓库">
                <select className="input-field w-32" value={storeForm.warehouse} onChange={e => setStoreForm(f => ({ ...f, warehouse: e.target.value }))}>
                  {WAREHOUSES.map(w => <option key={w}>{w}</option>)}
                </select>
              </FormField>
              <FormField label="操作人"><input className="input-field w-28" value={storeForm.operator} onChange={e => setStoreForm(f => ({ ...f, operator: e.target.value }))} /></FormField>
              <button className="btn-primary" onClick={handleAddStore}>确认添加</button>
              <button className="btn-secondary" onClick={() => setShowStoreForm(false)}>取消</button>
            </div>
          )}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card overflow-hidden">
              <table className="data-table">
                <thead><tr><th>批次号</th><th>等级</th><th>数量(kg)</th><th>仓库</th><th>操作人</th><th>时间</th></tr></thead>
                <tbody>
                  {filteredStorages.map(s => (
                    <tr key={s.id}>
                      <td className="font-medium text-steel-100">{s.batchNo}</td>
                      <td><span className={GRADE_MAP[s.grade]?.cls}>{GRADE_MAP[s.grade]?.label}</span></td>
                      <td className="font-mono">{s.quantity}</td>
                      <td>{s.warehouse}</td>
                      <td>{s.operator}</td>
                      <td className="text-steel-400 text-xs">{s.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-glow p-5">
              <div className="section-title mb-4">等级分布</div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={GRADE_COLORS[i % GRADE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => `${v} kg`} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
