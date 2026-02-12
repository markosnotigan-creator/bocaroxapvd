
import React, { useState } from 'react';
import { usePOS } from '../store/pos-store';
import { ScaleMode } from '../types';
import { dbService, DBSource } from '../services/dbService';
import { Button } from '../components/ui/Button';
import { Scale, Monitor, Shield, Smartphone, HelpCircle, Save, Printer, Database, Cloud, Wifi, WifiOff, Lock, Unlock, Mail, Eye, EyeOff, Cable, Activity, RefreshCw, Check, Truck, AlertTriangle, Trash2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    scaleConfig, updateScaleConfig, scaleStatus, connectToScale, rawScaleData, currentWeight,
    receiptConfig, updateReceiptConfig, securityConfig, updateSecurityConfig,
    deliveryConfig, updateDeliveryConfig,
    dashboardConfig, updateDashboardConfig,
    isDarkMode, toggleDarkMode
  } = usePOS();

  // --- ESTADOS DE BLOQUEIO DA PÁGINA (NOVO) ---
  const [isPageLocked, setIsPageLocked] = useState(true);
  const [pagePasswordInput, setPagePasswordInput] = useState('');
  const [pageAuthError, setPageAuthError] = useState('');

  const [dbSource, setDbSource] = useState<DBSource>(dbService.getConfig().source);
  const [apiUrl, setApiUrl] = useState(dbService.getConfig().apiUrl || '');
  const [apiKey, setApiKey] = useState(dbService.getConfig().apiKey || '');
  const [profile, setProfile] = useState(dbService.getConfig().profile || 'default');

  // Local state for security form to avoid constant re-renders/saves
  const [localSecurity, setLocalSecurity] = useState(securityConfig);

  // States for Security Section Locking (Bloqueio interno para edição de senha)
  const [isSecurityUnlocked, setIsSecurityUnlocked] = useState(false);
  const [securityAuthInput, setSecurityAuthInput] = useState('');
  const [securityAuthError, setSecurityAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- FUNÇÃO PARA DESBLOQUEAR A PÁGINA INTEIRA ---
  const handlePageUnlock = () => {
    if (pagePasswordInput === securityConfig.reportsPassword) {
      setIsPageLocked(false);
      setPageAuthError('');
      // Opcional: Já desbloquear a seção interna de segurança se a senha for a mesma
      setIsSecurityUnlocked(true);
    } else {
      setPageAuthError('Senha incorreta. Acesso negado.');
      setPagePasswordInput('');
    }
  };

  const handleUnlockSecurity = () => {
    if (securityAuthInput === securityConfig.reportsPassword) {
      setIsSecurityUnlocked(true);
      setSecurityAuthError('');
      setSecurityAuthInput('');
    } else {
      setSecurityAuthError('Senha incorreta.');
    }
  };

  const handleSaveDB = () => {
    dbService.updateConfig({
      source: dbSource,
      apiUrl,
      apiKey,
      profile: profile.toLowerCase().replace(/\s+/g, '_')
    });
    alert('Configurações de banco de dados e perfil atualizadas! O sistema irá recarregar para aplicar as mudanças.');
    window.location.reload();
  };

  const handleSaveAll = () => {
    updateSecurityConfig(localSecurity);
    alert('Todas as configurações foram salvas com sucesso!');
    setIsSecurityUnlocked(false);
  };

  // --- RENDERIZAÇÃO DA TELA DE BLOQUEIO ---
  if (isPageLocked) {
    return (
      <div className="h-full bg-[#fdfaff] dark:bg-zinc-950 flex flex-col items-center justify-center p-8 transition-colors duration-500">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300 border border-slate-100 dark:border-zinc-800">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/20 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto shadow-xl shadow-rose-50 dark:shadow-none">
              <Lock size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Acesso Restrito</h2>
              <p className="text-slate-500 font-bold mt-2">Área de configurações do sistema.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <input
                type="password"
                placeholder="Digite a senha..."
                value={pagePasswordInput}
                onChange={(e) => setPagePasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePageUnlock()}
                className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl py-5 px-6 text-center text-xl font-black focus:ring-4 focus:ring-rose-100 dark:focus:ring-rose-900/30 transition-all outline-none dark:text-white"
                autoFocus
              />
            </div>

            {pageAuthError && (
              <div className="flex items-center justify-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-rose-500 font-bold text-xs animate-pulse">
                <AlertTriangle size={14} /> {pageAuthError}
              </div>
            )}

            <Button size="lg" fullWidth className="h-16 text-lg" onClick={handlePageUnlock} variant="danger">
              <span className="flex items-center gap-3">
                <Unlock size={24} /> ACESSAR CONFIGURAÇÕES
              </span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO DA PÁGINA NORMAL (QUANDO DESBLOQUEADA) ---
  return (
    <div className="h-full bg-[#fdfaff] dark:bg-zinc-950 p-12 overflow-y-auto transition-colors duration-500 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-purple-950 dark:text-white tracking-tight text-shadow-sm">Configurações</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold">Gerencie hardware, segurança e conexões do seu terminal.</p>
        </div>

        {/* Scale Config - MOVED TO TOP for easy access */}
        <section className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] shadow-sm border border-purple-50 dark:border-purple-900/20 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Scale size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-purple-950 dark:text-white">Integração com Balança</h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Toledo Prix 3 / Filizola</p>
            </div>
            <div className={`ml-auto px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${scaleStatus === 'connected' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
              {scaleStatus === 'connected' ? 'CONECTADO' : 'DESCONECTADO'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: ScaleMode.KEYBOARD, label: 'Modo Teclado', desc: 'A balança digita o peso onde estiver o cursor.' },
              { id: ScaleMode.SERIAL, label: 'Modo Serial (USB)', desc: 'Leitura direta via cabo Serial/USB.' },
              { id: ScaleMode.MANUAL, label: 'Modo Manual', desc: 'Operador digita o peso manualmente.' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => updateScaleConfig({ mode: mode.id as ScaleMode })}
                className={`
                  p-8 rounded-[2rem] text-left border-2 transition-all duration-300 group
                  ${scaleConfig.mode === mode.id
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 ring-4 ring-purple-50 dark:ring-purple-900/10'
                    : 'border-purple-50 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 hover:bg-white hover:border-purple-200'}
                `}
              >
                <div className={`
                  w-10 h-10 rounded-xl mb-4 flex items-center justify-center transition-colors
                  ${scaleConfig.mode === mode.id ? 'bg-purple-600 text-white' : 'bg-white dark:bg-zinc-700 text-slate-400 group-hover:text-purple-400'}
                `}>
                  <Monitor size={20} />
                </div>
                <h3 className={`font-black mb-2 ${scaleConfig.mode === mode.id ? 'text-purple-950 dark:text-purple-100' : 'text-slate-700 dark:text-slate-300'}`}>{mode.label}</h3>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">{mode.desc}</p>
              </button>
            ))}
          </div>

          {scaleConfig.mode === ScaleMode.SERIAL && (
            <div className="bg-slate-50 dark:bg-zinc-800 rounded-3xl p-6 border border-slate-100 dark:border-zinc-700 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-white flex items-center gap-2"><Cable size={18} /> Teste de Conexão</h4>
                  <p className="text-xs text-slate-400 max-w-md mt-1">Clique em "Conectar" e selecione a porta COM correspondente ao cabo USB da balança.</p>
                </div>
                <Button onClick={connectToScale} disabled={scaleStatus === 'connected'}>
                  {scaleStatus === 'connected' ? <Check size={18} className="mr-2" /> : <RefreshCw size={18} className="mr-2" />}
                  {scaleStatus === 'connected' ? 'Balança Pronta' : 'Conectar Agora'}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Baud Rate (Velocidade)</label>
                  <select
                    value={scaleConfig.baudRate || 9600}
                    onChange={(e) => updateScaleConfig({ baudRate: parseInt(e.target.value) })}
                    className="w-full p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-700 font-bold outline-none focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/20"
                  >
                    <option value={2400}>2400 bps</option>
                    <option value={4800}>4800 bps</option>
                    <option value={9600}>9600 bps</option>
                    <option value={19200}>19200 bps</option>
                  </select>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Peso Interpretado</p>
                  <div className="text-2xl font-black text-emerald-500 flex items-center gap-2">
                    <Activity size={24} className={currentWeight > 0 ? "animate-pulse" : ""} />
                    {currentWeight.toFixed(3)} kg
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Delivery Config */}
        <section className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] shadow-sm border border-purple-50 dark:border-purple-900/20 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400">
              <Truck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-purple-950 dark:text-white">Delivery & WhatsApp</h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Link de Pedidos</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link ou Número do WhatsApp</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                  <input
                    type="text"
                    value={deliveryConfig.whatsappUrl}
                    onChange={(e) => updateDeliveryConfig({ whatsappUrl: e.target.value })}
                    placeholder="https://wa.me/5585988504361"
                    className="w-full pl-12 pr-4 py-4 bg-green-50/50 dark:bg-zinc-800 rounded-2xl border-none font-bold outline-none focus:ring-4 focus:ring-green-100 transition-all"
                  />
                </div>
                {deliveryConfig.whatsappUrl && (
                  <Button
                    variant="danger"
                    className="w-16 rounded-2xl"
                    onClick={() => updateDeliveryConfig({ whatsappUrl: '' })}
                    title="Remover WhatsApp"
                  >
                    <Trash2 size={24} />
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Dica: Para usar um número, digite o link no formato <b>https://wa.me/5585988504361</b>
              </p>
            </div>
          </div>
        </section>

        {/* Dashboard Customization */}
        <section className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] shadow-sm border border-purple-50 dark:border-purple-900/20 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Monitor size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-purple-950 dark:text-white">Personalização do Painel</h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Atalhos e Nomes dos Cards</p>
            </div>
          </div>

          <div className="space-y-4">
            {dashboardConfig.cards.map((card, index) => (
              <div key={card.id} className="flex flex-col md:flex-row items-center gap-4 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 transition-all hover:bg-white dark:hover:bg-zinc-800">
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.visible ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                    <Check size={20} className={card.visible ? 'opacity-100' : 'opacity-0'} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Botão</label>
                    <input
                      type="text"
                      value={card.label}
                      onChange={(e) => {
                        const newCards = [...dashboardConfig.cards];
                        newCards[index] = { ...card, label: e.target.value.toUpperCase() };
                        updateDashboardConfig({ cards: newCards });
                      }}
                      className="w-full bg-transparent border-none font-black text-purple-900 dark:text-white focus:ring-0 p-0"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${card.visible ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {card.visible ? 'Visível' : 'Oculto'}
                  </span>
                  <button
                    onClick={() => {
                      const newCards = [...dashboardConfig.cards];
                      newCards[index] = { ...card, visible: !card.visible };
                      updateDashboardConfig({ cards: newCards });
                    }}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${card.visible ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${card.visible ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security Config */}
        <section className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] shadow-sm border border-purple-50 dark:border-purple-900/20 space-y-8 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isSecurityUnlocked ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
              {isSecurityUnlocked ? <Unlock size={24} /> : <Shield size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-black text-purple-950 dark:text-white">Segurança e Acesso</h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Proteção de Relatórios</p>
            </div>
          </div>

          {!isSecurityUnlocked ? (
            <div className="flex flex-col items-center justify-center py-8 gap-6 bg-slate-50 dark:bg-zinc-800/50 rounded-3xl border border-slate-100 dark:border-zinc-800">
              <div className="text-center space-y-2">
                <Lock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Acesso Restrito</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">Digite sua senha atual para visualizar ou alterar as credenciais de segurança.</p>
              </div>

              <div className="w-full max-w-xs space-y-4">
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Senha Atual"
                    value={securityAuthInput}
                    onChange={(e) => setSecurityAuthInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUnlockSecurity()}
                    className="w-full text-center p-4 bg-white dark:bg-zinc-900 rounded-2xl border-none font-black text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-purple-100 shadow-sm"
                  />
                </div>
                {securityAuthError && (
                  <p className="text-xs font-bold text-rose-500 text-center animate-pulse bg-rose-50 p-2 rounded-lg">{securityAuthError}</p>
                )}
                <Button fullWidth onClick={handleUnlockSecurity} variant="secondary">
                  <Unlock size={18} className="mr-2" /> DESBLOQUEAR
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Relatórios</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={localSecurity.reportsPassword}
                    onChange={(e) => setLocalSecurity({ ...localSecurity, reportsPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-4 bg-rose-50/50 dark:bg-zinc-800 rounded-2xl border-none font-bold text-rose-600 outline-none focus:ring-4 focus:ring-rose-100 transition-all"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Recuperação</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={localSecurity.recoveryEmail}
                    onChange={(e) => setLocalSecurity({ ...localSecurity, recoveryEmail: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-none font-bold outline-none focus:ring-4 focus:ring-purple-100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp de Recuperação</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                  <input
                    type="text"
                    value={localSecurity.recoveryPhone}
                    onChange={(e) => setLocalSecurity({ ...localSecurity, recoveryPhone: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-none font-bold outline-none focus:ring-4 focus:ring-purple-100"
                  />
                </div>
              </div>
              <div className="col-span-1 md:col-span-3">
                <p className="text-xs text-slate-400 italic font-medium bg-slate-50 dark:bg-zinc-800 p-3 rounded-xl border border-slate-100 dark:border-zinc-700">
                  <Lock size={12} className="inline mr-1 mb-0.5" />
                  Modo de edição ativo. Lembre-se de clicar em "Salvar Alterações" no final da página para confirmar a nova senha.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Database & Cloud Sync */}
        <section className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] shadow-sm border border-purple-50 dark:border-purple-900/20 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-purple-950 dark:text-white">Fonte de Dados</h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Local ou Nuvem (API)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setDbSource(DBSource.LOCAL)}
              className={`p-6 rounded-3xl text-left border-4 transition-all flex items-center gap-4 ${dbSource === DBSource.LOCAL ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-50 dark:border-zinc-800'}`}
            >
              <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl"><WifiOff size={24} className="text-slate-400" /></div>
              <div>
                <p className="font-black text-purple-950 dark:text-white">Local (Browser)</p>
                <p className="text-[10px] font-bold text-slate-400">Dados salvos apenas neste computador.</p>
              </div>
            </button>
            <button
              onClick={() => setDbSource(DBSource.CLOUD)}
              className={`p-6 rounded-3xl text-left border-4 transition-all flex items-center gap-4 ${dbSource === DBSource.CLOUD ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-50 dark:border-zinc-800'}`}
            >
              <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl"><Cloud size={24} className="text-blue-500" /></div>
              <div>
                <p className="font-black text-purple-950 dark:text-white">Nuvem (External API)</p>
                <p className="text-[10px] font-bold text-slate-400">Dados sincronizados entre vários PDVs.</p>
              </div>
            </button>
          </div>

          {dbSource === DBSource.LOCAL && (
            <div className="p-6 bg-purple-50/50 dark:bg-purple-900/10 rounded-3xl border border-purple-100 dark:border-purple-900/30 space-y-4 animate-in zoom-in-95">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Perfil de Armazenamento (Pasta)</label>
                <div className="relative">
                  <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={18} />
                  <input
                    type="text"
                    placeholder="Ex: Loja_Principal"
                    value={profile}
                    onChange={(e) => setProfile(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-800 rounded-2xl border-none font-bold text-purple-600 outline-none focus:ring-4 focus:ring-purple-100"
                  />
                </div>
                <p className="text-[10px] text-purple-400 font-bold italic">Mude o nome do perfil para simular "outra pasta" e isolar os dados.</p>
              </div>
            </div>
          )}

          {dbSource === DBSource.CLOUD && (
            <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30 space-y-4 animate-in zoom-in-95">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Endpoint da sua API (Base URL)</label>
                  <input
                    type="text"
                    placeholder="https://sua-api.com/v1"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="w-full p-4 bg-white dark:bg-zinc-800 rounded-2xl border-none font-bold text-blue-600 outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Chave de API (Anon Key)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua chave secreta do Supabase"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-white dark:bg-zinc-800 rounded-2xl border-none font-bold text-blue-600 outline-none focus:ring-4 focus:ring-blue-100"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-blue-400 font-bold italic">O sistema aplicará as configurações e tentará sincronizar com o Supabase.</p>
              </div>
            </div>
          )}

          <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex items-start gap-3">
            <Shield className="text-rose-500 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-[11px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider">Segurança Ativa</p>
              <p className="text-[10px] text-rose-600 dark:text-rose-500 font-bold">O Filtro Anti-Ataque (XSS) está monitorando todas as entradas de dados. Scripts maliciosos serão bloqueados automaticamente.</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="success" onClick={handleSaveDB}>
              <Wifi size={18} className="mr-2" /> APLICAR FONTE DE DADOS
            </Button>
          </div>
        </section>

        {/* Impressora e Recibo */}
        <section className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] shadow-sm border border-purple-50 dark:border-purple-900/20 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Printer size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-purple-950 dark:text-white">Impressão de Recibo</h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Configuração Térmica</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Loja</label>
                <input
                  type="text"
                  value={receiptConfig.storeName}
                  onChange={(e) => updateReceiptConfig({ storeName: e.target.value })}
                  className="w-full p-4 bg-purple-50/50 dark:bg-zinc-800 rounded-2xl border-none font-bold outline-none focus:ring-4 focus:ring-purple-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Endereço / CNPJ</label>
                <input
                  type="text"
                  value={receiptConfig.address}
                  onChange={(e) => updateReceiptConfig({ address: e.target.value })}
                  className="w-full p-4 bg-purple-50/50 dark:bg-zinc-800 rounded-2xl border-none font-bold outline-none focus:ring-4 focus:ring-purple-100"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensagem de Rodapé</label>
                <input
                  type="text"
                  value={receiptConfig.footerMessage}
                  onChange={(e) => updateReceiptConfig({ footerMessage: e.target.value })}
                  className="w-full p-4 bg-purple-50/50 dark:bg-zinc-800 rounded-2xl border-none font-bold outline-none focus:ring-4 focus:ring-purple-100"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50/30 dark:bg-zinc-800 rounded-2xl cursor-pointer" onClick={() => updateReceiptConfig({ autoPrint: !receiptConfig.autoPrint })}>
                <span className="font-bold text-slate-600 dark:text-slate-300">Impressão Automática</span>
                <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${receiptConfig.autoPrint ? 'bg-purple-600' : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${receiptConfig.autoPrint ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <Button variant="ghost" size="lg" className="dark:text-slate-400">Descartar</Button>
          <Button size="lg" className="px-12" onClick={handleSaveAll}>
            <span className="flex items-center gap-2"><Save size={20} /> Salvar Alterações</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
