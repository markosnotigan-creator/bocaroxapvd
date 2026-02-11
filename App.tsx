
import React, { useState } from 'react';
import { POSProvider, usePOS } from './store/pos-store';
import { Sidebar } from './components/Layout/Sidebar';
import { POSPage } from './pages/POSPage';
import { CashRegisterPage } from './pages/CashRegisterPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReportsPage } from './pages/ReportsPage';
import { InventoryPage } from './pages/InventoryPage';
import { DashboardPage } from './pages/DashboardPage';
import { ManagementPage } from './pages/ManagementPage';
import { TablesPage } from './pages/TablesPage';
import { DeliveryPage } from './pages/DeliveryPage';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    customers, addCustomer, updateCustomer, deleteCustomer,
    sellers, addSeller, updateSeller, deleteSeller
  } = usePOS();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage onNavigate={setActiveTab} />;
      case 'pos': return <POSPage />;
      case 'cash': return <CashRegisterPage />;
      case 'inventory': return <InventoryPage />;
      case 'settings': return <SettingsPage />;
      case 'reports': return <ReportsPage />;

      // Módulos Dinâmicos
      case 'cliente':
        return <ManagementPage
          title="Gestão de Clientes"
          items={customers}
          onAdd={addCustomer}
          onUpdate={updateCustomer}
          onDelete={deleteCustomer}
          onBack={() => setActiveTab('dashboard')}
          fields={[
            { name: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Ex: João Silva' },
            { name: 'phone', label: 'Telefone', type: 'text', placeholder: '(11) 99999-9999' },
            { name: 'address', label: 'Endereço', type: 'text', placeholder: 'Rua, Número, Bairro' }
          ]}
        />;

      case 'vendedor':
        return <ManagementPage
          title="Equipe de Vendas"
          items={sellers}
          onAdd={addSeller}
          onUpdate={updateSeller}
          onDelete={deleteSeller}
          onBack={() => setActiveTab('dashboard')}
          fields={[
            { name: 'name', label: 'Nome do Vendedor', type: 'text' },
            { name: 'code', label: 'Código Interno', type: 'text' }
          ]}
        />;

      case 'delivery':
        return <DeliveryPage onBack={() => setActiveTab('dashboard')} />;

      case 'mesas':
        return <TablesPage onBack={() => setActiveTab('dashboard')} />;

      default: return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  const isDashboard = activeTab === 'dashboard';

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950">
      {!isDashboard && <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />}
      <main className={`flex-1 overflow-hidden ${isDashboard ? 'w-full' : ''}`}>
        {renderContent()}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <POSProvider>
    <AppContent />
  </POSProvider>
);

export default App;
