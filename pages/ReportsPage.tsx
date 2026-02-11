
import React, { useState, useMemo } from 'react';
import { usePOS } from '../store/pos-store';
import { Button } from '../components/ui/Button';
import {
  PieChart,
  Users,
  Download,
  Calendar,
  ShoppingBag,
  Trophy,
  BarChart3,
  User,
  CalendarRange,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { sales, securityConfig } = usePOS();

  // Estado para o bloqueio e senha
  const [isLocked, setIsLocked] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  // Estado para o filtro de datas
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0], // Hoje
    end: new Date().toISOString().split('T')[0]    // Hoje
  });

  const handleUnlock = () => {
    if (passwordInput === securityConfig.reportsPassword) {
      setIsLocked(false);
      setError('');
    } else {
      setError('Senha incorreta. Tente novamente.');
      setPasswordInput('');
    }
  };

  const handleForgotPassword = () => {
    const confirm = window.confirm(`Deseja ser redirecionado para recuperar sua senha?`);
    if (confirm) {
      const message = `Olá, estou solicitando a recuperação da senha do PDV Boca Roxa. Minha senha é: ${securityConfig.reportsPassword}`;
      const whatsappUrl = `https://wa.me/${securityConfig.recoveryPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      const mailtoUrl = `mailto:${securityConfig.recoveryEmail}?subject=Recuperacao de Senha PDV&body=${message}`;

      // Abre WhatsApp
      window.open(whatsappUrl, '_blank');
      // Tenta abrir Email também
      window.location.href = mailtoUrl;
    }
  };

  // Cálculo do Período Selecionado
  const periodStats = useMemo(() => {
    if (!sales.length) return { total: 0, count: 0, ticket: 0 };

    const startDate = new Date(dateRange.start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);

    const filtered = sales.filter(s => {
      const saleDate = new Date(s.timestamp);
      return saleDate >= startDate && saleDate <= endDate && s.status === 'completed';
    });

    const total = filtered.reduce((acc, s) => acc + s.totalAmount, 0);

    return {
      total,
      count: filtered.length,
      ticket: filtered.length > 0 ? total / filtered.length : 0
    };
  }, [sales, dateRange]);

  const lifetimeTotal = useMemo(() => {
    return sales.reduce((acc, sale) =>
      sale.status === 'completed' ? acc + sale.totalAmount : acc, 0
    );
  }, [sales]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Cálculo do Ranking MENSAL (Ciclo do Mês Atual)
  const { ranking, maxSales, currentMonthLabel } = useMemo(() => {
    const now = new Date();
    // Primeiro dia do mês atual
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Último dia do mês atual
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Filtra vendas do mês e com status completed
    const monthlySales = sales.filter(s => {
      const saleDate = new Date(s.timestamp);
      return saleDate >= startOfMonth && saleDate <= endOfMonth && s.status === 'completed';
    });

    // Agrupa por vendedor
    const stats = monthlySales.reduce((acc: any, sale) => {
      const sellerName = sale.sellerName || 'Geral';
      if (!acc[sellerName]) acc[sellerName] = { total: 0, count: 0, name: sellerName };
      acc[sellerName].total += sale.totalAmount;
      acc[sellerName].count += 1;
      return acc;
    }, {});

    const sortedRanking = Object.values(stats).sort((a: any, b: any) => b.total - a.total);
    const max = sortedRanking.length > 0 ? (sortedRanking[0] as any).total : 1;

    // Formata o nome do mês (ex: Março de 2024)
    const label = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    return { ranking: sortedRanking, maxSales: max, currentMonthLabel: label };
  }, [sales]);

  const exportSales = () => {
    const headers = "ID;Data;Total;Status;Pagamentos;Vendedor\n";
    const rows = sales.map(s =>
      `${s.id};${new Date(s.timestamp).toLocaleString()};${s.totalAmount};${s.status};${s.payments.map(p => p.method).join(',')};${s.sellerName || 'Geral'}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `vendas_boca_roxa_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="h-full bg-[#fdfaff] dark:bg-zinc-950 p-12 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-purple-950 dark:text-white tracking-tight">Relatórios Financeiros</h1>
            <p className="text-slate-500 font-bold">Análise detalhada de faturamento e performance.</p>
          </div>
          <Button variant="outline" onClick={exportSales}>
            <Download size={20} className="mr-2" /> EXPORTAR CSV
          </Button>
        </div>

        {/* Seção de Consulta por Período PROTEGIDA */}
        <div className="relative bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-purple-100 dark:border-purple-900/30 shadow-lg shadow-purple-100/50 dark:shadow-none space-y-8 overflow-hidden min-h-[300px]">

          {/* Tela de Bloqueio */}
          {isLocked && (
            <div className="absolute inset-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex flex-col items-center justify-center gap-6 animate-in fade-in">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-rose-500 shadow-xl shadow-rose-100 dark:shadow-none">
                <Lock size={32} />
              </div>
              <div className="text-center space-y-2 max-w-sm px-4">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">Área Restrita</h3>
                <p className="text-slate-500 font-bold">Digite a senha para acessar o faturamento.</p>
              </div>
              <div className="flex flex-col items-center gap-4 w-full max-w-xs relative">
                <input
                  type="password"
                  placeholder="Senha"
                  className="w-full text-center text-xl font-black p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-transparent focus:border-rose-300 outline-none tracking-widest transition-all"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                />
                {error && <p className="text-xs font-bold text-rose-500 animate-pulse bg-rose-50 px-3 py-1 rounded-lg">{error}</p>}

                <Button fullWidth onClick={handleUnlock}>
                  <Unlock size={20} className="mr-2" /> DESBLOQUEAR
                </Button>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="mt-4 px-4 py-2 text-xs font-bold text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all cursor-pointer underline decoration-dashed"
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 border-b border-purple-50 dark:border-purple-900/20 pb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200 dark:shadow-none">
              <CalendarRange size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-purple-950 dark:text-white">Consulta por Período</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Acesso Exclusivo da Gerência</p>
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 items-end transition-all duration-500 ${isLocked ? 'blur-md opacity-50' : ''}`}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Inicial</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={18} />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  disabled={isLocked}
                  className="w-full pl-12 pr-4 py-4 bg-purple-50/50 dark:bg-zinc-800 rounded-2xl border-none font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-purple-100 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Final</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={18} />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  disabled={isLocked}
                  className="w-full pl-12 pr-4 py-4 bg-purple-50/50 dark:bg-zinc-800 rounded-2xl border-none font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-purple-100 transition-all"
                />
              </div>
            </div>
            <div className="md:col-span-2 bg-purple-50 dark:bg-zinc-800 rounded-2xl p-4 flex justify-between items-center border border-purple-100 dark:border-purple-900/20">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Total no Período</span>
                <p className="text-3xl font-black text-purple-900 dark:text-white">{formatCurrency(periodStats.total)}</p>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{periodStats.count} Vendas</span>
                <p className="text-xs font-bold text-slate-500">Ticket Médio: {formatCurrency(periodStats.ticket)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-purple-50 dark:border-purple-900/20 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Total de Pedidos</p>
              <h3 className="text-3xl font-black text-purple-950 dark:text-white">{sales.length}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-purple-50 dark:border-purple-900/20 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Ticket Médio Geral</p>
              <h3 className="text-3xl font-black text-purple-950 dark:text-white">
                {formatCurrency(sales.length > 0 ? lifetimeTotal / sales.length : 0)}
              </h3>
            </div>
          </div>
        </div>

        {/* Ranking de Vendedores e Tabela */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-purple-50 dark:border-purple-900/20 overflow-hidden shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-purple-950 dark:text-white tracking-tight">🏆 Ranking Mensal</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest capitalize">
                    {currentMonthLabel}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Performance</span>
            </div>

            <div className="space-y-6">
              {ranking.length === 0 ? (
                <div className="py-20 text-center text-slate-300 font-bold italic">Nenhuma venda registrada neste mês.</div>
              ) : (
                ranking.map((seller: any, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-amber-400 text-amber-950 shadow-lg shadow-amber-100' :
                            idx === 1 ? 'bg-slate-300 text-slate-700' :
                              idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'
                          }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-black text-purple-950 dark:text-white">{seller.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{seller.count} pedidos</p>
                        </div>
                      </div>
                      <span className="font-black text-purple-700 dark:text-purple-400">{formatCurrency(seller.total)}</span>
                    </div>
                    <div className="h-2 bg-slate-50 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${idx === 0 ? 'bg-amber-400' : 'bg-purple-500'}`}
                        style={{ width: `${(seller.total / maxSales) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lista de Vendas Recentes */}
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-purple-50 dark:border-purple-900/20 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-purple-50 dark:border-purple-900/20 flex items-center justify-between">
              <h3 className="text-xl font-black text-purple-950 dark:text-white">Últimas Vendas</h3>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                <BarChart3 size={18} />
                <span>Fluxo</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-50/30 dark:bg-purple-900/10 border-b border-purple-50 dark:border-purple-900/20">
                  <tr>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Vendedor</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50 dark:divide-purple-900/20">
                  {sales.slice(0, 5).map((sale) => (
                    <tr key={sale.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors">
                      <td className="px-8 py-4">
                        <p className="font-bold text-purple-600 text-xs">{sale.id}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <User size={10} /> {sale.sellerName || 'Geral'}
                        </p>
                      </td>
                      <td className="px-8 py-4 font-black text-purple-950 dark:text-white">{formatCurrency(sale.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
