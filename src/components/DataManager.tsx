import { useState } from 'react';
import { Settings, RotateCcw, Trash2, X } from 'lucide-react';
import { useStore } from '@/store';

export default function DataManager() {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState<'reset' | 'clear' | null>(null);
  const { resetToInitial, clearAllDemo } = useStore();

  const handleReset = () => {
    resetToInitial();
    setConfirming(null);
    setOpen(false);
  };

  const handleClear = () => {
    clearAllDemo();
    setConfirming(null);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-furnace-700/60 border border-furnace-500/30 text-steel-400 hover:text-steel-200 hover:border-furnace-400 transition-colors"
      >
        <Settings className="w-3.5 h-3.5" />
        数据管理
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="card-glow w-96 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-steel-200">数据管理</h3>
              <button onClick={() => setOpen(false)} className="text-steel-500 hover:text-steel-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-steel-400 mb-4">
              所有数据保存在浏览器本地 (localStorage)，不会上传到服务器。
              清理或重置操作不可撤销，请谨慎操作。
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-furnace-800/60 border border-furnace-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <RotateCcw className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-steel-200 mb-1">恢复初始样例</h4>
                    <p className="text-xs text-steel-500 mb-2">
                      将所有数据重置为初始演示数据，您新增的记录将被清除。
                    </p>
                    {confirming === 'reset' ? (
                      <div className="flex gap-2">
                        <button onClick={handleReset} className="btn-primary text-xs py-1 px-3">确认重置</button>
                        <button onClick={() => setConfirming(null)} className="btn-secondary text-xs py-1 px-3">取消</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirming('reset')} className="btn-secondary text-xs py-1 px-3">
                        恢复初始样例
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-furnace-800/60 border border-furnace-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-ember-500/10">
                    <Trash2 className="w-4 h-4 text-ember-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-steel-200 mb-1">清空业务记录</h4>
                    <p className="text-xs text-steel-500 mb-2">
                      清空所有上料、电极、出炉、浇铸、破碎、检测、入库记录，保留配方和基础设置。
                    </p>
                    {confirming === 'clear' ? (
                      <div className="flex gap-2">
                        <button onClick={handleClear} className="btn-danger text-xs py-1 px-3">确认清空</button>
                        <button onClick={() => setConfirming(null)} className="btn-secondary text-xs py-1 px-3">取消</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirming('clear')} className="btn-secondary text-xs py-1 px-3">
                        清空业务记录
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
