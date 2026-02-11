
import React, { useState } from 'react';
import { usePOS } from '../../store/pos-store';
import { PaymentMethod, Payment } from '../../types';
import { Button } from '../ui/Button';
import { CreditCard, Wallet, Smartphone, Banknote, X, Check } from 'lucide-react';

interface PaymentModalProps {
  total: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ total, onClose, onSuccess }) => {
  const { processSale } = usePOS();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentAmount, setCurrentAmount] = useState<string>('');

  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const remaining = Math.max(0, total - totalPaid);
  const change = Math.max(0, totalPaid - total);

  const addPayment = (method: PaymentMethod) => {
    const amount = currentAmount === '' ? remaining : parseFloat(currentAmount);
    if (amount <= 0) return;

    setPayments(prev => [...prev, { method, amount }]);
    setCurrentAmount('');
  };

  const removePayment = (index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    if (totalPaid < total) return;
    const sale = processSale(payments);
    if (sale) {
      onSuccess();
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto animate-in fade-in slide-in-from-bottom-10 duration-300">

        {/* Left: Calculation */}
        <div className="flex-1 p-8 bg-slate-50 border-r border-slate-100 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-800">Finalizar Venda</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total</p>
              <p className="text-3xl font-black text-slate-900">{formatCurrency(total)}</p>
            </div>
            <div className="p-6 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-100 space-y-1 text-white">
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Pago</p>
              <p className="text-3xl font-black">{formatCurrency(totalPaid)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm font-bold text-slate-500 px-2 uppercase tracking-wider">
              <span>Pagamentos realizados</span>
              <span className="text-indigo-600">Misto Ativado</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {payments.length === 0 && (
                <div className="py-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                  Aguardando formas de pagamento...
                </div>
              )}
              {payments.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 animate-in slide-in-from-left-4 duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      {p.method === PaymentMethod.CASH && <Banknote size={16} />}
                      {p.method === PaymentMethod.PIX && <Smartphone size={16} />}
                      {p.method === PaymentMethod.DEBIT && <CreditCard size={16} />}
                      {p.method === PaymentMethod.CREDIT && <CreditCard size={16} />}
                    </div>
                    <span className="font-bold text-slate-700">{p.method}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-slate-900">{formatCurrency(p.amount)}</span>
                    <button onClick={() => removePayment(i)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 flex flex-col gap-4">
            {change > 0 && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center text-emerald-700 animate-bounce">
                <span className="font-bold">Troco:</span>
                <span className="text-2xl font-black">{formatCurrency(change)}</span>
              </div>
            )}
            <div className="flex justify-between items-center px-4">
              <span className="text-slate-400 font-bold">Faltante:</span>
              <span className={`text-xl font-black ${remaining > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {remaining > 0 ? formatCurrency(remaining) : 'PAGO'}
              </span>
            </div>
            <Button
              size="lg"
              fullWidth
              disabled={totalPaid < total}
              onClick={handleFinish}
              variant={totalPaid >= total ? 'success' : 'primary'}
            >
              {totalPaid >= total ? (
                <span className="flex items-center gap-2"><Check size={24} /> Concluir Venda</span>
              ) : 'Aguardando Pagamento'}
            </Button>
          </div>
        </div>

        {/* Right: Payment Buttons */}
        <div className="w-full md:w-96 p-8 bg-white flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Valor a Receber</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
              <input
                type="number"
                placeholder={remaining.toFixed(2)}
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-5 bg-slate-100 rounded-2xl text-2xl font-black focus:outline-none focus:ring-4 focus:ring-indigo-100 border-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            <button
              onClick={() => addPayment(PaymentMethod.CASH)}
              className="group p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <Banknote size={32} />
              </div>
              <span className="font-bold text-slate-700">Dinheiro</span>
            </button>
            <button
              onClick={() => addPayment(PaymentMethod.PIX)}
              className="group p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <Smartphone size={32} />
              </div>
              <span className="font-bold text-slate-700">PIX</span>
            </button>
            <button
              onClick={() => addPayment(PaymentMethod.DEBIT)}
              className="group p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <CreditCard size={32} />
              </div>
              <span className="font-bold text-slate-700">Débito</span>
            </button>
            <button
              onClick={() => addPayment(PaymentMethod.CREDIT)}
              className="group p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <CreditCard size={32} />
              </div>
              <span className="font-bold text-slate-700">Crédito</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[10, 20, 50, 100].map(val => (
              <Button key={val} variant="outline" size="sm" onClick={() => setCurrentAmount(val.toString())}>
                R$ {val}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
