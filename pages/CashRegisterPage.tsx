
import React, { useState } from 'react';
import { usePOS } from '../store/pos-store';
import { Button } from '../components/ui/Button';
import { Wallet, LogIn, LogOut, ArrowDownCircle, ArrowUpCircle, History, ReceiptText } from 'lucide-react';

export const CashRegisterPage: React.FC = () => {
  const { cashRegister, openRegister, closeRegister } = usePOS();
  const [openingAmount, setOpeningAmount] = useState('0.00');

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (!cashRegister || cashRegister.status === 'closed') {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 p-8">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-100">
              <Wallet size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Caixa Fechado</h2>
            <p className="text-slate-500 font-medium">Informe o saldo inicial para abrir o terminal de vendas.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Saldo Inicial</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">R$</span>
                <input
                  type="number"
                  value={openingAmount}
                  onChange={(e) => setOpeningAmount(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-6 pl-16 pr-6 text-3xl font-black focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>
            </div>
            <Button size="lg" fullWidth className="h-20" onClick={() => openRegister(parseFloat(openingAmount))}>
              <span className="flex items-center gap-3 text-lg">
                <LogIn size={24} /> ABRIR CAIXA
              </span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 p-12 space-y-12 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Gestão de Caixa</h1>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-xs font-black rounded-full uppercase tracking-wider">Aberto</span>
            <span className="text-slate-400 font-medium text-sm">Iniciado em {new Date(cashRegister.openedAt).toLocaleString()}</span>
          </div>
        </div>
        <Button variant="danger" size="lg" onClick={closeRegister}>
          <span className="flex items-center gap-3">
            <LogOut size={20} /> FECHAR CAIXA
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <LogIn size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Saldo de Abertura</span>
          </div>
          <p className="text-4xl font-black text-slate-800">{formatCurrency(cashRegister.openingBalance)}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <ArrowUpCircle size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Vendas do Período</span>
          </div>
          <p className="text-4xl font-black text-emerald-500">{formatCurrency(cashRegister.currentBalance - cashRegister.openingBalance)}</p>
        </div>
        <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-100 space-y-4 text-white">
          <div className="flex items-center gap-3 text-indigo-200">
            <Wallet size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Saldo Atual em Caixa</span>
          </div>
          <p className="text-4xl font-black">{formatCurrency(cashRegister.currentBalance)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                <History size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800">Fluxo de Operações</h3>
            </div>
            <Button variant="ghost" size="sm">Ver tudo</Button>
          </div>
          <div className="p-4 space-y-2 flex-1 overflow-y-auto max-h-[500px]">
            {cashRegister.entries.length === 0 ? (
              <div className="py-20 text-center text-slate-300 italic font-medium">Nenhuma operação registrada ainda.</div>
            ) : (
              cashRegister.entries.slice().reverse().map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 rounded-3xl hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${entry.type === 'sale' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                      {entry.type === 'sale' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{entry.description}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <span className={`text-lg font-black ${entry.type === 'sale' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {entry.type === 'sale' ? '+' : '-'} {formatCurrency(entry.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                <ArrowDownCircle size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800">Sangria de Caixa</h3>
            </div>
            <p className="text-slate-500 font-medium">Retire valores do caixa para pagamentos ou depósito bancário.</p>
            <div className="space-y-4">
              <input type="number" placeholder="Valor (R$)" className="w-full p-6 bg-slate-50 rounded-2xl text-xl font-black outline-none focus:ring-4 focus:ring-rose-100 border-none" />
              <input type="text" placeholder="Motivo da sangria" className="w-full p-6 bg-slate-50 rounded-2xl text-lg font-bold outline-none focus:ring-4 focus:ring-slate-100 border-none" />
              <Button variant="danger" size="lg" fullWidth>EFETUAR SANGRIA</Button>
            </div>
          </div>

          <div className="bg-indigo-50 p-10 rounded-[2.5rem] flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-100">
                <ReceiptText size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-indigo-900 text-xl">Resumo do Turno</h4>
                <p className="text-indigo-400 font-bold text-sm">Gere um comprovante de fechamento</p>
              </div>
            </div>
            <Button variant="outline" className="bg-white border-transparent">Visualizar</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
