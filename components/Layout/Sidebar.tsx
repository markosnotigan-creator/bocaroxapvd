
import React from 'react';
import { usePOS } from '../../store/pos-store';
import {
  ShoppingBag,
  Package,
  PieChart,
  Settings,
  Wallet,
  LogOut,
  ChevronRight,
  RefreshCcw,
  Moon,
  Sun,
  LayoutDashboard
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { isDarkMode, toggleDarkMode } = usePOS();

  const menuItems = [
    { id: 'dashboard', label: 'Painel Inicial', icon: LayoutDashboard },
    { id: 'pos', label: 'Vendas PDV', icon: ShoppingBag },
    { id: 'cash', label: 'Caixa', icon: Wallet },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'refunds', label: 'Devoluções', icon: RefreshCcw },
    { id: 'reports', label: 'Relatórios', icon: PieChart },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="w-72 bg-white dark:bg-zinc-950 border-r border-purple-100 dark:border-purple-900/30 h-full flex flex-col p-6 transition-all duration-500 relative z-10">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-200 dark:shadow-none">
          <ShoppingBag size={24} />
        </div>
        <div>
          <h1 className="font-black text-xl tracking-tight text-purple-950 dark:text-purple-50">Boca Roxa</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-purple-500 dark:text-purple-400">Açaí & Sabor</p>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-400 group relative
                ${isActive
                  ? 'bg-purple-700 text-white shadow-2xl shadow-purple-200 dark:shadow-none translate-x-1'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-900 dark:hover:text-purple-200'}
              `}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-purple-600 dark:group-hover:text-purple-400'} />
              <span className="font-bold text-sm flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight size={16} className="animate-pulse" />}
            </button>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-purple-50 dark:border-purple-900/30 space-y-2">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300"
        >
          {isDarkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-purple-600" />}
          <span className="font-bold text-sm">{isDarkMode ? 'Modo Claro' : 'Modo Noturno'}</span>
        </button>
        <button className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-300">
          <LogOut size={20} />
          <span className="font-bold text-sm">Sair</span>
        </button>
      </div>
    </div>
  );
};
