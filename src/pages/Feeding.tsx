import { useState, useMemo } from 'react';
import { Truck, Plus, Warehouse, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useStore } from '@/store';

const SILO_CAPACITY = 10000;

export default function Feeding() {
  const { feedings, addFeeding } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ siloNo: '1#石灰仓', material: 'lime' as 'lime' | 'coke', weight: 0, operator: '' });

  const limeTotal = useMemo(() => feedings.filter(f => f.material === 'lime').reduce((s, f) => s + f.weight, 0), [feedings]);
  const cokeTotal = useMemo(() => feedings.filter(f => f.material === 'coke').reduce((s, f) => s + f.weight, 0), [feedings]);

  const chartData = useMemo(() => {
    const dayMap = new Map<string, { date: string; lime: number; coke: number }>();
    feedings.forEach(f => {
      const date = f.timestamp.slice(0, 10);
      if (!dayMap.has(date)) dayMap.set(date, { date, lime: 0, coke: 0 });
      const entry = dayMap.get(date)!;
      if (f.material === 'lime') entry.lime += f.weight;
      else entry.coke += f.weight;
    });
    return Array.from(dayMap.values()).slice(-7);
  }, [feedings]);

  const autoBatchNo = () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = feedings.filter(f => f.batchNo.includes(today)).length + 1;
    return `FL-${today}-${String(count).padStart(3, '0')}`;
  };

  const handleSubmit = () => {
    if (!form.weight || !form.operator.trim()) return;
    addFeeding({
      batchNo: autoBatchNo(),
      siloNo: form.siloNo,
      material: form.material,
      weight: form.weight,
      operator: form.operator.trim(),
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });
    setForm({ siloNo: '1#石灰仓', material: 'lime', weight: 0, operator: '' });
    setShowForm(false);
  };

  const handleMaterialChange = (mat: 'lime' | 'coke') => {
    setForm(f => ({ ...f, material: mat, siloNo: mat === 'lime' ? '1#石灰仓' : '2#焦炭仓' }));
  };

  const limeLevel = Math.min((limeTotal / SILO_CAPACITY) * 100, 100);
  const cokeLevel = Math.min((cokeTotal / SILO_CAPACITY) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title"><Truck className="w-5 h-5 text-lava-400" />料仓上料记录</h2>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />新增上料
        </button>
      </div>

      <div className="card-glow overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>批次号</th>
              <th>料仓编号</th>
              <th>原料类型</th>
              <th>重量(kg)</th>
              <th>操作人</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            {feedings.map(f => (
              <tr key={f.id}>
                <td className="font-mono text-steel-300">{f.batchNo}</td>
                <td>{f.siloNo}</td>
                <td>
                  {f.material === 'lime'
                    ? <span className="badge-info">石灰</span>
                    : <span className="badge-warning">焦炭</span>}
                </td>
                <td className="font-mono">{f.weight.toLocaleString()}</td>
                <td>{f.operator}</td>
                <td className="text-steel-400 text-xs">{f.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glow p-5">
          <h3 className="section-title mb-4"><Warehouse className="w-5 h-5 text-lava-400" />料仓监控</h3>
          <div className="flex items-end justify-around gap-8 px-4">
            {[
              { label: '1#石灰仓', level: limeLevel, total: limeTotal, gradient: 'from-blue-500 to-amber-400' },
              { label: '2#焦炭仓', level: cokeLevel, total: cokeTotal, gradient: 'from-amber-500 to-red-500' },
            ].map(silo => (
              <div key={silo.label} className="flex flex-col items-center gap-3 flex-1">
                <div className="text-xs text-steel-400 font-medium">{silo.label}</div>
                <div className="w-20 h-48 bg-furnace-800 rounded-lg border border-furnace-500/30 relative overflow-hidden">
                  <div
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${silo.gradient} transition-all duration-700 rounded-b-lg`}
                    style={{ height: `${silo.level}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-mono font-bold text-white drop-shadow-lg">{Math.round(silo.level)}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-mono font-bold text-steel-200">{silo.total.toLocaleString()} kg</div>
                  <div className="text-[10px] text-steel-500">容量 {SILO_CAPACITY.toLocaleString()} kg</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-glow p-5">
          <h3 className="section-title mb-4">每日上料统计</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid #2a3a5c', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Bar dataKey="lime" name="石灰" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="coke" name="焦炭" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="card-glow w-full max-w-md p-6 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="section-title"><Plus className="w-5 h-5 text-lava-400" />新增上料</h3>
              <button className="text-steel-500 hover:text-steel-300 transition-colors" onClick={() => setShowForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-steel-400 mb-1.5">批次号</label>
                <input className="input-field w-full bg-furnace-800/60 cursor-not-allowed" value={autoBatchNo()} disabled readOnly />
              </div>
              <div>
                <label className="block text-xs text-steel-400 mb-1.5">原料类型</label>
                <select className="input-field w-full" value={form.material} onChange={e => handleMaterialChange(e.target.value as 'lime' | 'coke')}>
                  <option value="lime">石灰</option>
                  <option value="coke">焦炭</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-steel-400 mb-1.5">料仓编号</label>
                <select className="input-field w-full" value={form.siloNo} onChange={e => setForm(f => ({ ...f, siloNo: e.target.value }))}>
                  <option value="1#石灰仓">1#石灰仓</option>
                  <option value="2#焦炭仓">2#焦炭仓</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-steel-400 mb-1.5">重量 (kg)</label>
                <input type="number" className="input-field w-full" placeholder="输入重量" value={form.weight || ''} onChange={e => setForm(f => ({ ...f, weight: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-xs text-steel-400 mb-1.5">操作人</label>
                <input className="input-field w-full" placeholder="输入操作人姓名" value={form.operator} onChange={e => setForm(f => ({ ...f, operator: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button className="btn-secondary flex-1" onClick={() => setShowForm(false)}>取消</button>
                <button className="btn-primary flex-1" onClick={handleSubmit}>确认上料</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
