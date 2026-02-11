
import React from 'react';
import { usePOS } from '../store/pos-store';
import {
  ShoppingCart,
  Users,
  UserCircle,
  Truck,
  Coffee,
  ClipboardList,
  CreditCard,
  Clock,
  History,
  RefreshCcw,
  LayoutGrid,
  MessageCircle,
  Bell
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { deliveryOrders, deliveryConfig } = usePOS();
  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('pt-BR');

  // Conta pedidos pendentes para o alerta
  const pendingDeliveryCount = deliveryOrders.filter(o => o.status === 'pending').length;

  const rightMenuItems = [
    { id: 'delivery', label: 'DELIVERY / WHATSAPP', icon: Truck, color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'mesas', label: 'MESAS', icon: Coffee, color: 'bg-emerald-500 hover:bg-emerald-600' },
    { id: 'comandas', label: 'COMANDAS', icon: LayoutGrid, color: 'bg-cyan-500 hover:bg-cyan-600' },
    { id: 'creditos', label: 'CREDITO / ADIANT.', icon: CreditCard, color: 'bg-teal-400 hover:bg-teal-500' },
    { id: 'atendimentos', label: 'ATENDIMENTOS', icon: Clock, color: 'bg-zinc-700 hover:bg-zinc-800' },
    { id: 'reports', label: 'ULTIMAS VENDAS', icon: History, color: 'bg-purple-600 hover:bg-purple-700' },
    { id: 'refunds', label: 'DEVOLUÇÃO', icon: RefreshCcw, color: 'bg-rose-500 hover:bg-rose-600' },
  ];

  const handleMenuClick = (id: string) => {
    if (id === 'delivery') {
      // Abre o WhatsApp Web (ou link configurado) em uma nova aba para verificar mensagens
      window.open(deliveryConfig.whatsappUrl || 'https://web.whatsapp.com', '_blank');
    }
    // Navega para a tela interna do sistema
    onNavigate(id);
  };

  return (
    <div className="h-full bg-zinc-950 flex flex-col overflow-hidden text-white font-sans">
      <div className="h-10 bg-zinc-900 flex items-center justify-between px-4 border-b border-white/5">
        <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500">
          <span className="flex items-center gap-1"><LayoutGrid size={12} /> BOCA ROXA POS</span>
          <span>{currentDate} {currentTime}</span>
          <span className="text-zinc-600">v 2.5.1</span>
        </div>
        <div className="flex gap-4">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 grid grid-cols-12 gap-4 h-full max-h-[calc(100vh-40px)]">
        <div className="col-span-12 md:col-span-4 h-full">
          <button
            onClick={() => onNavigate('pos')}
            className="w-full h-full bg-sky-500 hover:bg-sky-600 transition-all rounded-xl shadow-2xl flex flex-col items-center justify-center gap-6 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
            <ShoppingCart size={120} className="text-white/90 group-hover:scale-110 transition-transform duration-500" />
            <div className="text-center">
              <h2 className="text-4xl font-black tracking-tighter">BALCÃO</h2>
              <p className="text-sm font-bold text-white/70 tracking-widest mt-1">(F1)</p>
            </div>
          </button>
        </div>

        <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
          <button
            onClick={() => onNavigate('cliente')}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 transition-all rounded-xl shadow-xl flex flex-col items-center justify-center gap-4 group relative"
          >
            <Users size={64} className="text-white/90 group-hover:rotate-6 transition-transform" />
            <div className="text-center">
              <h3 className="text-2xl font-black tracking-tight">CLIENTE</h3>
              <p className="text-xs font-bold text-white/70 tracking-widest mt-1">(F3)</p>
            </div>
          </button>
          <button
            onClick={() => onNavigate('vendedor')}
            className="flex-1 bg-green-600 hover:bg-green-700 transition-all rounded-xl shadow-xl flex flex-col items-center justify-center gap-4 group relative"
          >
            <UserCircle size={64} className="text-white/90 group-hover:scale-95 transition-transform" />
            <div className="text-center">
              <h3 className="text-2xl font-black tracking-tight">VENDEDOR</h3>
              <p className="text-xs font-bold text-white/70 tracking-widest mt-1">(F5)</p>
            </div>
          </button>
        </div>

        <div className="col-span-12 md:col-span-4 flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
          {rightMenuItems.map((item) => {
            const Icon = item.icon;
            const isDelivery = item.id === 'delivery';
            const hasAlert = isDelivery && pendingDeliveryCount > 0;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`relative flex items-center gap-4 p-4 rounded-xl transition-all shadow-md group ${item.color} ${hasAlert ? 'animate-pulse ring-2 ring-white' : ''}`}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-black/10 rounded-lg">
                  {isDelivery ? <MessageCircle size={24} className="group-hover:scale-110 transition-transform" /> : <Icon size={24} className="group-hover:scale-110 transition-transform" />}
                </div>
                <span className="font-black text-sm tracking-widest flex-1 text-left flex items-center gap-2">
                  {item.label}
                </span>

                {/* Alerta de Pedidos Pendentes */}
                {hasAlert && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-rose-600 text-white px-3 py-1 rounded-full flex items-center gap-2 shadow-lg animate-bounce border-2 border-white">
                    <Bell size={12} fill="currentColor" />
                    <span className="text-xs font-black">{pendingDeliveryCount}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-12 bg-zinc-900/50 backdrop-blur border-t border-white/5 flex items-center px-8 justify-between text-[10px] font-bold text-zinc-400">
        <div className="flex gap-8">
          <span className="flex items-center gap-2 text-sky-400"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> BANCO DE DADOS CONECTADO</span>
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> IMPRESSORA PRONTA</span>
        </div>
        <div className="uppercase tracking-widest">Terminal: PDV-AÇAI-01 | Operador: GERENTE</div>
      </div>
    </div>
  );
};
