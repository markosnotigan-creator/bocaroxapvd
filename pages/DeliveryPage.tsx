
import React, { useState } from 'react';
import { usePOS } from '../store/pos-store';
import { DeliveryOrder, PaymentMethod } from '../types';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  Truck,
  Search,
  Printer,
  CheckCircle,
  MessageCircle,
  Clock,
  MapPin,
  ShoppingBag,
  Trash2,
  Plus,
  ExternalLink
} from 'lucide-react';

interface DeliveryPageProps {
  onBack: () => void;
}

export const DeliveryPage: React.FC<DeliveryPageProps> = ({ onBack }) => {
  const { deliveryOrders, confirmDeliveryOrder, printReceipt, deleteDelivery, deliveryConfig, addDelivery } = usePOS();
  const [search, setSearch] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Estado para novo pedido
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    address: '',
    items: '',
    total: ''
  });

  const filteredOrders = deliveryOrders.filter(order =>
    order.customerName.toLowerCase().includes(search.toLowerCase()) ||
    order.id.includes(search)
  ).sort((a, b) => b.timestamp - a.timestamp);

  const handlePrint = (order: DeliveryOrder) => {
    printReceipt(order, true);
  };

  const handleOpenPayment = (order: DeliveryOrder) => {
    setSelectedOrder(order);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = (method: PaymentMethod) => {
    if (selectedOrder) {
      confirmDeliveryOrder(selectedOrder, method);
      setIsPaymentModalOpen(false);
      setSelectedOrder(null);
    }
  };

  const handleWhatsApp = (order?: DeliveryOrder) => {
    // Se tiver pedido, tenta extrair número, senão abre geral
    const url = deliveryConfig.whatsappUrl || 'https://web.whatsapp.com';
    window.open(url, '_blank');
  };

  const handleSaveNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    addDelivery({
      customerName: newOrder.customerName,
      address: newOrder.address,
      items: newOrder.items,
      total: parseFloat(newOrder.total) || 0,
      status: 'pending'
    });
    setIsAddModalOpen(false);
    setNewOrder({ customerName: '', address: '', items: '', total: '' });
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="h-full bg-[#fdfaff] dark:bg-zinc-950 p-6 flex flex-col overflow-hidden relative">

      {/* Aviso de fluxo */}
      <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-[10px] font-bold text-center py-1 uppercase tracking-widest z-0">
        WhatsApp aberto em nova aba • Use esta tela para lançar o pedido no sistema
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 mt-4 z-10 relative">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="flex items-center gap-3 px-8 py-4 bg-purple-600 text-white border-2 border-purple-700 rounded-2xl hover:bg-purple-700 hover:scale-105 transition-all shadow-lg shadow-purple-200 dark:shadow-purple-900/40 group"
          >
            <ArrowLeft className="text-white" size={24} />
            <span className="font-black text-sm uppercase tracking-widest">
              VOLTAR AO PAINEL
            </span>
          </button>

          <div className="h-12 w-px bg-slate-200 dark:bg-zinc-800 hidden md:block"></div>

          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Truck className="text-blue-500" /> Delivery
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Gestão de Pedidos e Entregas</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl font-bold focus:ring-4 focus:ring-blue-100 outline-none w-64"
            />
          </div>
          <button
            onClick={() => handleWhatsApp()}
            className="hidden lg:flex items-center justify-center p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors border border-green-100"
            title="Abrir WhatsApp Novamente"
          >
            <MessageCircle size={20} />
          </button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} className="mr-2" /> NOVO PEDIDO
          </Button>
        </div>
      </div>

      {/* Grid de Pedidos */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
              <Truck size={64} className="text-slate-300 mb-4" />
              <p className="font-bold text-slate-400 text-lg">Nenhum pedido de delivery encontrado.</p>
              <Button variant="ghost" className="mt-4" onClick={() => setIsAddModalOpen(true)}>
                + Registrar pedido do WhatsApp
              </Button>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div
                key={order.id}
                className={`
                  relative bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-sm border-2 transition-all duration-300
                  ${order.status === 'delivered'
                    ? 'border-emerald-100 opacity-60 hover:opacity-100'
                    : 'border-blue-100 dark:border-blue-900/30 hover:shadow-xl hover:-translate-y-1'}
                `}
              >
                {/* Status Badge */}
                <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                  ${order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-blue-100 text-blue-600'}
                `}>
                  {order.status === 'pending' ? 'Pendente' : order.status === 'delivered' ? 'Concluído' : order.status}
                </div>

                <div className="space-y-6">
                  {/* Info Cliente */}
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white line-clamp-1">{order.customerName}</h3>
                    <div className="flex items-center gap-2 text-slate-400 mt-1">
                      <Clock size={12} />
                      <span className="text-xs font-bold">{new Date(order.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="flex items-start gap-3 bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                    <MapPin className="text-blue-500 shrink-0 mt-1" size={16} />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 line-clamp-2">{order.address}</p>
                  </div>

                  {/* Itens */}
                  <div className="flex items-start gap-3">
                    <ShoppingBag className="text-purple-400 shrink-0 mt-1" size={16} />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-3 italic">
                      "{order.items}"
                    </p>
                  </div>

                  {/* Total e Ações */}
                  <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{formatCurrency(order.total)}</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePrint(order)}
                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                        title="Imprimir Comanda"
                      >
                        <Printer size={20} />
                      </button>
                      {order.status !== 'delivered' && (
                        <button
                          onClick={() => handleOpenPayment(order)}
                          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg shadow-blue-200 dark:shadow-none animate-pulse"
                          title="Finalizar e Lançar no Caixa"
                        >
                          <CheckCircle size={20} />
                        </button>
                      )}
                      <button
                        onClick={() => { if (confirm('Excluir pedido?')) deleteDelivery(order.id); }}
                        className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Pagamento (Conclusão) */}
      {isPaymentModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">Receber Pedido</h2>
              <p className="text-slate-500 font-bold">Total: {formatCurrency(selectedOrder.total)}</p>
              <p className="text-xs text-slate-400">Selecione a forma de pagamento para dar baixa no caixa automaticamente.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleConfirmPayment(PaymentMethod.CASH)} className="p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl font-bold transition-colors">DINHEIRO</button>
              <button onClick={() => handleConfirmPayment(PaymentMethod.PIX)} className="p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-2xl font-bold transition-colors">PIX</button>
              <button onClick={() => handleConfirmPayment(PaymentMethod.DEBIT)} className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl font-bold transition-colors">DÉBITO</button>
              <button onClick={() => handleConfirmPayment(PaymentMethod.CREDIT)} className="p-4 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-2xl font-bold transition-colors">CRÉDITO</button>
            </div>

            <Button variant="ghost" fullWidth onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Modal Novo Pedido */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white">Registrar Pedido</h2>
                <p className="text-xs text-slate-400 font-bold">Transcreva aqui o pedido do WhatsApp</p>
              </div>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <MessageCircle size={12} /> WhatsApp
              </div>
            </div>

            <form onSubmit={handleSaveNewOrder} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cliente</label>
                <input required autoFocus className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none" value={newOrder.customerName} onChange={e => setNewOrder({ ...newOrder, customerName: e.target.value })} placeholder="Nome do cliente" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Endereço / Telefone</label>
                <input required className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none" value={newOrder.address} onChange={e => setNewOrder({ ...newOrder, address: e.target.value })} placeholder="Ex: Rua A, 123" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Descrição do Pedido</label>
                <textarea required className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none h-24 resize-none" value={newOrder.items} onChange={e => setNewOrder({ ...newOrder, items: e.target.value })} placeholder="Ex: 1x Açaí 500ml com Morango..." />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Valor Total (R$)</label>
                <input required type="number" step="0.01" className="w-full p-3 bg-slate-50 rounded-xl font-black text-xl outline-none" value={newOrder.total} onChange={e => setNewOrder({ ...newOrder, total: e.target.value })} placeholder="0.00" />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="ghost" fullWidth onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                <Button type="submit" fullWidth>Salvar e Lançar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
