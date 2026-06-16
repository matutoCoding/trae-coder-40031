import { useState } from 'react';
import { Scale, Plus, Calculator, ToggleLeft, ToggleRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '@/store';

const COLORS = ['#f97316', '#64748b'];

export default function RawMaterial() {
  const { recipes, addRecipe, updateRecipe } = useStore();
  const [totalWeight, setTotalWeight] = useState(1000);
  const [selectedId, setSelectedId] = useState(recipes[0]?.id ?? '');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', limeRatio: 0.6, cokeRatio: 0.4, createdBy: '' });

  const selected = recipes.find(r => r.id === selectedId);
  const calcLime = selected ? Math.round(totalWeight * selected.limeRatio) : 0;
  const calcCoke = selected ? Math.round(totalWeight * selected.cokeRatio) : 0;

  const pieData = selected
    ? [
        { name: '石灰', value: Number((selected.limeRatio * 100).toFixed(1)) },
        { name: '焦炭', value: Number((selected.cokeRatio * 100).toFixed(1)) },
      ]
    : [];

  const handleAdd = () => {
    if (!form.name || !form.createdBy) return;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    addRecipe({
      name: form.name,
      limeRatio: form.limeRatio,
      cokeRatio: form.cokeRatio,
      limeWeight: Math.round(1000 * form.limeRatio),
      cokeWeight: Math.round(1000 * form.cokeRatio),
      createdBy: form.createdBy,
      createdAt: now,
      status: 'active',
    });
    setForm({ name: '', limeRatio: 0.6, cokeRatio: 0.4, createdBy: '' });
    setShowForm(false);
  };

  const toggleStatus = (id: string, status: 'active' | 'archived') => {
    updateRecipe(id, { status: status === 'active' ? 'archived' : 'active' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="section-title">
          <Scale className="w-5 h-5 text-lava-400" />
          石灰焦炭配比方案
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          新增配比
        </button>
      </div>

      {showForm && (
        <div className="card-glow p-4 flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-steel-400">配方名称</label>
            <input className="input-field w-40" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-steel-400">石灰配比</label>
            <input className="input-field w-24" type="number" step="0.01" value={form.limeRatio} onChange={e => setForm(f => ({ ...f, limeRatio: +e.target.value, cokeRatio: +(1 - +e.target.value).toFixed(2) }))} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-steel-400">焦炭配比</label>
            <input className="input-field w-24" type="number" step="0.01" value={form.cokeRatio} readOnly />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-steel-400">创建人</label>
            <input className="input-field w-28" value={form.createdBy} onChange={e => setForm(f => ({ ...f, createdBy: e.target.value }))} />
          </div>
          <button className="btn-primary" onClick={handleAdd}>确认添加</button>
          <button className="btn-secondary" onClick={() => setShowForm(false)}>取消</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>配方名称</th>
                <th>石灰配比</th>
                <th>焦炭配比</th>
                <th>石灰重量(kg)</th>
                <th>焦炭重量(kg)</th>
                <th>创建人</th>
                <th>创建时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(r => (
                <tr key={r.id}>
                  <td className="font-medium text-steel-100">{r.name}</td>
                  <td className="font-mono">{(r.limeRatio * 100).toFixed(0)}%</td>
                  <td className="font-mono">{(r.cokeRatio * 100).toFixed(0)}%</td>
                  <td className="font-mono">{r.limeWeight}</td>
                  <td className="font-mono">{r.cokeWeight}</td>
                  <td>{r.createdBy}</td>
                  <td className="text-steel-400 text-xs">{r.createdAt}</td>
                  <td>
                    <span className={r.status === 'active' ? 'badge-success' : 'badge-warning'}>
                      {r.status === 'active' ? '启用' : '归档'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="flex items-center gap-1 text-steel-300 hover:text-lava-400 transition-colors"
                      onClick={() => toggleStatus(r.id, r.status)}
                    >
                      {r.status === 'active' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      <span className="text-xs">{r.status === 'active' ? '归档' : '启用'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="card-glow p-5">
            <div className="section-title mb-4">
              <Calculator className="w-5 h-5 text-lava-400" />
              配比计算器
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-steel-400">总重量 (kg)</label>
                <input
                  className="input-field"
                  type="number"
                  value={totalWeight}
                  onChange={e => setTotalWeight(+e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-steel-400">选择配方</label>
                <select
                  className="input-field"
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                >
                  {recipes.filter(r => r.status === 'active').map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              {selected && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-furnace-800/60 rounded-lg p-3 text-center">
                    <div className="text-xs text-steel-400 mb-1">石灰重量</div>
                    <div className="stat-value text-lava-400">{calcLime}</div>
                    <div className="text-xs text-steel-500">kg</div>
                  </div>
                  <div className="bg-furnace-800/60 rounded-lg p-3 text-center">
                    <div className="text-xs text-steel-400 mb-1">焦炭重量</div>
                    <div className="stat-value text-steel-200">{calcCoke}</div>
                    <div className="text-xs text-steel-500">kg</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card-glow p-5">
            <div className="section-title mb-4">
              <Scale className="w-5 h-5 text-lava-400" />
              配比可视化
            </div>
            {selected && (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(42,58,92,0.5)', borderRadius: '8px', fontSize: '13px' }}
                    formatter={(v: number) => `${v}%`}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px' }}
                    formatter={(v: string) => <span className="text-steel-300">{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
