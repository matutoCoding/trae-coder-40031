import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Scale, Truck, Cylinder, Flame, Droplets,
  Package, Zap, ChevronLeft, ChevronRight, FlameKindling
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', label: '生产总览', icon: LayoutDashboard },
  { path: '/raw-material', label: '原料配比', icon: Scale },
  { path: '/feeding', label: '入炉上料', icon: Truck },
  { path: '/electrode', label: '电极管理', icon: Cylinder },
  { path: '/smelting', label: '冶炼控制', icon: Flame },
  { path: '/tapping', label: '出炉浇铸', icon: Droplets },
  { path: '/crushing', label: '破碎包装', icon: Package },
  { path: '/power-stats', label: '电耗统计', icon: Zap },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const currentNav = navItems.find(n => {
    if (n.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(n.path);
  });

  return (
    <div className="flex h-screen overflow-hidden bg-furnace-900">
      <aside className={`${collapsed ? 'w-[68px]' : 'w-[220px]'} flex flex-col border-r border-furnace-500/20 bg-furnace-800/80 transition-all duration-300 relative flex-shrink-0`}>
        <div className="h-16 flex items-center gap-3 px-4 border-b border-furnace-500/20 flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-lava-500/20 flex items-center justify-center flex-shrink-0">
            <FlameKindling className="w-5 h-5 text-lava-400" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-steel-200 truncate">电石冶炼车间</div>
              <div className="text-[10px] text-steel-500 truncate">Calcium Carbide Workshop</div>
            </div>
          )}
        </div>

        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-lava-500/15 text-lava-300 border border-lava-500/20'
                    : 'text-steel-400 hover:bg-furnace-600/40 hover:text-steel-200 border border-transparent'
                }`
              }
            >
              <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)) ? 'text-lava-400' : 'text-steel-500 group-hover:text-steel-300'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-furnace-700 border border-furnace-500/30 flex items-center justify-center text-steel-500 hover:text-steel-300 hover:border-furnace-400 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        <div className="p-3 border-t border-furnace-500/20 flex-shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-full bg-furnace-600 flex items-center justify-center text-xs font-bold text-steel-300">张</div>
              <div className="overflow-hidden">
                <div className="text-xs font-medium text-steel-300 truncate">张工 / 车间主任</div>
                <div className="text-[10px] text-steel-600">白班</div>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-furnace-600 flex items-center justify-center text-xs font-bold text-steel-300 mx-auto">张</div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-furnace-500/20 bg-furnace-800/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            {currentNav && (
              <>
                <currentNav.icon className="w-5 h-5 text-lava-400" />
                <h1 className="text-lg font-bold text-steel-200">{currentNav.label}</h1>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">炉况正常</span>
            </div>
            <div className="text-sm text-steel-500 font-mono">
              {new Date().toLocaleDateString('zh-CN')} {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
