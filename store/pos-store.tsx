
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Product, CartItem, ProductType, ScaleConfig, ScaleMode, 
  CashRegister, Sale, PaymentMethod, ReceiptConfig, SecurityConfig, DeliveryConfig,
  Customer, Seller, Table, DeliveryOrder, ScaleStatus
} from '../types';
import { INITIAL_PRODUCTS } from '../constants';
import { dbService } from '../services/dbService';
import { scaleService } from '../services/scaleService';

interface POSContextType {
  products: Product[];
  customers: Customer[];
  sellers: Seller[];
  currentSellerId: string | null;
  tables: Table[];
  deliveryOrders: DeliveryOrder[];
  cart: CartItem[];
  currentWeight: number;
  scaleConfig: ScaleConfig;
  scaleStatus: ScaleStatus;
  rawScaleData: string; // Para debug
  receiptConfig: ReceiptConfig;
  securityConfig: SecurityConfig;
  deliveryConfig: DeliveryConfig;
  cashRegister: CashRegister | null;
  sales: Sale[];
  isDarkMode: boolean;
  
  // Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addSeller: (seller: Omit<Seller, 'id'>) => void;
  updateSeller: (seller: Seller) => void;
  deleteSeller: (id: string) => void;
  setCurrentSellerId: (id: string | null) => void;
  updateTable: (table: Table) => void;
  addDelivery: (order: Omit<DeliveryOrder, 'id' | 'timestamp'>) => void;
  updateDelivery: (order: DeliveryOrder) => void;
  deleteDelivery: (id: string) => void;
  confirmDeliveryOrder: (order: DeliveryOrder, paymentMethod: PaymentMethod) => void;
  toggleDarkMode: () => void;
  addToCart: (product: Product, quantity?: number, addons?: any[], observations?: string) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  setCurrentWeight: (weight: number) => void;
  updateScaleConfig: (config: Partial<ScaleConfig>) => void;
  connectToScale: () => Promise<void>;
  disconnectScale: () => Promise<void>;
  updateReceiptConfig: (config: Partial<ReceiptConfig>) => void;
  updateSecurityConfig: (config: Partial<SecurityConfig>) => void;
  updateDeliveryConfig: (config: Partial<DeliveryConfig>) => void;
  openRegister: (amount: number) => void;
  closeRegister: () => void;
  processSale: (payments: { method: PaymentMethod, amount: number }[]) => Sale | null;
  refundSale: (saleId: string, reason: string) => void;
  printReceipt: (sale: Sale | DeliveryOrder, isDelivery?: boolean) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);

  const [currentSellerId, setCurrentSellerId] = useState<string | null>(localStorage.getItem('br_active_seller'));
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Balança
  const [currentWeight, setCurrentWeight] = useState<number>(0);
  const [scaleConfig, setScaleConfig] = useState<ScaleConfig>({ mode: ScaleMode.MANUAL });
  const [scaleStatus, setScaleStatus] = useState<ScaleStatus>('disconnected');
  const [rawScaleData, setRawScaleData] = useState<string>('');

  const [isDarkMode, setIsDarkMode] = useState<boolean>(localStorage.getItem('br_theme') === 'dark');
  
  const [receiptConfig, setReceiptConfig] = useState<ReceiptConfig>({
    storeName: 'Boca Roxa Açaí',
    address: 'Rua do Açaí, 123 - Centro',
    phone: '(11) 99999-9999',
    cnpj: '00.000.000/0001-00',
    footerMessage: 'Obrigado pela preferência!',
    autoPrint: true,
    showLogo: true
  });

  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>({
    reportsPassword: '1234',
    recoveryEmail: 'marcos_notigan@hotmail.com',
    recoveryPhone: '5585988504361'
  });

  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig>({
    whatsappUrl: 'https://wa.me/5585988504361'
  });

  // Carregamento Inicial via dbService
  useEffect(() => {
    const loadData = async () => {
      const p = await dbService.getAll('products');
      setProducts(p.length > 0 ? p : INITIAL_PRODUCTS);
      setCustomers(await dbService.getAll('customers'));
      setSellers(await dbService.getAll('sellers'));
      setTables(await dbService.getAll('tables'));
      setDeliveryOrders(await dbService.getAll('delivery'));
      setSales(await dbService.getAll('sales'));
      
      const savedRegister = await dbService.getAll('register');
      if (savedRegister && !Array.isArray(savedRegister)) setCashRegister(savedRegister);
      
      const savedReceipt = localStorage.getItem('br_receipt_config');
      if (savedReceipt) setReceiptConfig(JSON.parse(savedReceipt));

      const savedSecurity = localStorage.getItem('br_security_config');
      if (savedSecurity) setSecurityConfig(JSON.parse(savedSecurity));
      
      const savedDelivery = localStorage.getItem('br_delivery_config');
      if (savedDelivery) setDeliveryConfig(JSON.parse(savedDelivery));

      const savedScale = localStorage.getItem('br_scale_config');
      if (savedScale) setScaleConfig(JSON.parse(savedScale));

      document.documentElement.classList.toggle('dark', isDarkMode);
    };
    loadData();
  }, []);

  // Persistência Automática
  useEffect(() => { if (products.length > 0) dbService.saveAll('products', products); }, [products]);
  useEffect(() => { dbService.saveAll('customers', customers); }, [customers]);
  useEffect(() => { dbService.saveAll('sellers', sellers); }, [sellers]);
  useEffect(() => { dbService.saveAll('tables', tables); }, [tables]);
  useEffect(() => { dbService.saveAll('delivery', deliveryOrders); }, [deliveryOrders]);
  useEffect(() => { dbService.saveAll('sales', sales); }, [sales]);
  useEffect(() => { if (cashRegister) dbService.saveAll('register', [cashRegister] as any); }, [cashRegister]);

  const addProduct = (p: Omit<Product, 'id'>) => setProducts(prev => [...prev, { ...p, id: Math.random().toString(36).substr(2, 9) }]);
  const updateProduct = (p: Product) => setProducts(prev => prev.map(x => x.id === p.id ? p : x));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(x => x.id !== id));

  const addCustomer = (c: Omit<Customer, 'id'>) => setCustomers(prev => [...prev, { ...c, id: Math.random().toString(36).substr(2, 9) }]);
  const updateCustomer = (c: Customer) => setCustomers(prev => prev.map(x => x.id === c.id ? c : x));
  const deleteCustomer = (id: string) => setCustomers(prev => prev.filter(x => x.id !== id));

  const addSeller = (s: Omit<Seller, 'id'>) => setSellers(prev => [...prev, { ...s, id: Math.random().toString(36).substr(2, 9) }]);
  const updateSeller = (s: Seller) => setSellers(prev => prev.map(x => x.id === s.id ? s : x));
  const deleteSeller = (id: string) => setSellers(prev => prev.filter(x => x.id !== id));

  const updateTable = (t: Table) => setTables(prev => prev.map(x => x.id === t.id ? t : x));

  const addDelivery = (d: Omit<DeliveryOrder, 'id' | 'timestamp'>) => setDeliveryOrders(prev => [{ ...d, id: Date.now().toString(), timestamp: Date.now() }, ...prev]);
  const updateDelivery = (d: DeliveryOrder) => setDeliveryOrders(prev => prev.map(x => x.id === d.id ? d : x));
  const deleteDelivery = (id: string) => setDeliveryOrders(prev => prev.filter(x => x.id !== id));

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('br_theme', newVal ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newVal);
      return newVal;
    });
  };

  const addToCart = useCallback((product: Product, quantity: number = 1, addons: any[] = [], observations: string = '') => {
    const itemTotal = (product.price * quantity) + addons.reduce((acc, a) => acc + a.price, 0);
    setCart(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), productId: product.id, name: product.name, price: product.price, type: product.type, quantity, addons, observations, total: itemTotal }]);
  }, []);

  const removeFromCart = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));
  const clearCart = () => setCart([]);
  
  const updateScaleConfig = (c: Partial<ScaleConfig>) => {
    setScaleConfig(prev => {
      const newVal = { ...prev, ...c };
      localStorage.setItem('br_scale_config', JSON.stringify(newVal));
      return newVal;
    });
  };

  const connectToScale = async () => {
    setScaleStatus('connecting');
    const success = await scaleService.connect((weight, raw) => {
      if (raw) {
        setRawScaleData(prev => (prev + raw).slice(-100)); // Mantém apenas os últimos 100 caracteres
      }
      if (weight !== -1) {
        setCurrentWeight(weight);
      }
    });

    if (success) {
      setScaleStatus('connected');
    } else {
      setScaleStatus('error');
    }
  };

  const disconnectScale = async () => {
    await scaleService.disconnect();
    setScaleStatus('disconnected');
  };
  
  const updateReceiptConfig = (c: Partial<ReceiptConfig>) => {
    setReceiptConfig(prev => {
      const newVal = { ...prev, ...c };
      localStorage.setItem('br_receipt_config', JSON.stringify(newVal));
      return newVal;
    });
  };

  const updateSecurityConfig = (c: Partial<SecurityConfig>) => {
    setSecurityConfig(prev => {
      const newVal = { ...prev, ...c };
      localStorage.setItem('br_security_config', JSON.stringify(newVal));
      return newVal;
    });
  };

  const updateDeliveryConfig = (c: Partial<DeliveryConfig>) => {
    setDeliveryConfig(prev => {
      const newVal = { ...prev, ...c };
      localStorage.setItem('br_delivery_config', JSON.stringify(newVal));
      return newVal;
    });
  };

  const openRegister = (amount: number) => setCashRegister({ id: Date.now().toString(), openedAt: Date.now(), openingBalance: amount, currentBalance: amount, status: 'open', entries: [] });
  const closeRegister = () => setCashRegister(prev => prev ? { ...prev, status: 'closed', closedAt: Date.now() } : null);

  const processSale = (payments: { method: PaymentMethod, amount: number }[]) => {
    const totalAmount = cart.reduce((acc, item) => acc + item.total, 0);
    const activeSeller = sellers.find(s => s.id === currentSellerId);
    const sale: Sale = { 
      id: 'SALE-' + Math.random().toString(36).substr(2, 6).toUpperCase(), 
      timestamp: Date.now(), 
      items: [...cart], 
      totalAmount, 
      payments, 
      change: Math.max(0, payments.reduce((acc, p) => acc + p.amount, 0) - totalAmount), 
      status: 'completed',
      sellerId: currentSellerId || undefined,
      sellerName: activeSeller?.name || 'Geral'
    };
    setSales(prev => [sale, ...prev]);
    if (cashRegister) setCashRegister(prev => prev ? { ...prev, currentBalance: prev.currentBalance + totalAmount, entries: [...prev.entries, { type: 'sale', amount: totalAmount, description: `Venda ${sale.id}`, timestamp: Date.now() }] } : null);
    clearCart();
    return sale;
  };

  // Função para confirmar e pagar Delivery
  const confirmDeliveryOrder = (order: DeliveryOrder, paymentMethod: PaymentMethod) => {
    const sale: Sale = {
      id: 'DEL-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      timestamp: Date.now(),
      items: [{
        id: 'del-item',
        productId: 'delivery',
        name: `Delivery: ${order.items}`,
        price: order.total,
        type: ProductType.BY_UNIT,
        quantity: 1,
        addons: [],
        total: order.total
      }],
      totalAmount: order.total,
      payments: [{ method: paymentMethod, amount: order.total }],
      change: 0,
      status: 'completed',
      sellerName: 'Delivery'
    };

    // 1. Adiciona Venda
    setSales(prev => [sale, ...prev]);
    
    // 2. Adiciona ao Caixa
    if (cashRegister) {
      setCashRegister(prev => prev ? { 
        ...prev, 
        currentBalance: prev.currentBalance + order.total, 
        entries: [...prev.entries, { 
          type: 'sale', 
          amount: order.total, 
          description: `Delivery ${order.customerName}`, 
          timestamp: Date.now() 
        }] 
      } : null);
    }

    // 3. Atualiza status do pedido para 'delivered'
    const updatedOrder = { ...order, status: 'delivered' as const };
    updateDelivery(updatedOrder);

    // 4. Imprime Comprovante
    printReceipt(sale);
  };

  const refundSale = (saleId: string, reason: string) => setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: 'refunded' } : s));
  
  const printReceipt = (data: Sale | DeliveryOrder, isDeliveryOrder = false) => {
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) return;

    // Se for apenas um pedido de Delivery (comanda de produção)
    if (isDeliveryOrder) {
      const order = data as DeliveryOrder;
      printWindow.document.write(`
        <html>
          <body style="font-family: monospace; font-size: 12px; width: 300px;">
            <div style="text-align: center; margin-bottom: 10px;">
              <h2 style="margin: 0;">PEDIDO DELIVERY</h2>
              <p style="margin: 0;">#${order.id.slice(-6)}</p>
            </div>
            <div style="border-bottom: 1px dashed #000; margin-bottom: 10px;"></div>
            <p><strong>CLIENTE:</strong> ${order.customerName}</p>
            <p><strong>ENDEREÇO:</strong> ${order.address}</p>
            <div style="border-bottom: 1px dashed #000; margin: 10px 0;"></div>
            <p style="font-size: 14px; font-weight: bold;">ITENS:</p>
            <p>${order.items}</p>
            <div style="border-top: 1px dashed #000; margin-top: 10px; padding-top: 10px;">
              <p style="font-size: 16px; font-weight: bold; text-align: right;">TOTAL: R$ ${order.total.toFixed(2)}</p>
            </div>
            <script>window.print();window.close();</script>
          </body>
        </html>
      `);
    } else {
      // Cupom Fiscal Não Fiscal (Venda Comum)
      const sale = data as Sale;
      printWindow.document.write(`
        <html>
          <body style="font-family: monospace; font-size: 12px; width: 300px;">
             <div style="text-align: center; margin-bottom: 10px;">
              <h3 style="margin: 0;">${receiptConfig.storeName}</h3>
              <p style="margin: 0;">${receiptConfig.address}</p>
              <p style="margin: 0;">${receiptConfig.phone}</p>
            </div>
            <p style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 5px;">COMPROVANTE DE VENDA</p>
            <p>Data: ${new Date(sale.timestamp).toLocaleString()}</p>
            <table style="width: 100%; text-align: left;">
              <thead><tr><th>Item</th><th style="text-align: right;">Val</th></tr></thead>
              <tbody>
                ${sale.items.map(i => `<tr><td>${i.name} x${i.quantity}</td><td style="text-align: right;">${i.total.toFixed(2)}</td></tr>`).join('')}
              </tbody>
            </table>
            <div style="border-top: 1px dashed #000; margin-top: 10px; padding-top: 5px;">
              <p style="font-size: 16px; font-weight: bold; text-align: right;">TOTAL: R$ ${sale.totalAmount.toFixed(2)}</p>
            </div>
            <p style="text-align: center; margin-top: 20px;">${receiptConfig.footerMessage}</p>
            <script>window.print();window.close();</script>
          </body>
        </html>
      `);
    }
    printWindow.document.close();
  };

  return (
    <POSContext.Provider value={{
      products, customers, sellers, currentSellerId, tables, deliveryOrders, cart, currentWeight, 
      scaleConfig, scaleStatus, rawScaleData, receiptConfig, securityConfig, deliveryConfig, cashRegister, sales, isDarkMode,
      addProduct, updateProduct, deleteProduct, addCustomer, updateCustomer, deleteCustomer,
      addSeller, updateSeller, deleteSeller, setCurrentSellerId, updateTable, addDelivery, updateDelivery, deleteDelivery,
      confirmDeliveryOrder,
      toggleDarkMode, addToCart, removeFromCart, clearCart, setCurrentWeight, updateScaleConfig, connectToScale, disconnectScale,
      updateReceiptConfig, updateSecurityConfig, updateDeliveryConfig,
      openRegister, closeRegister, processSale, refundSale, printReceipt
    }}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) throw new Error('usePOS must be used within a POSProvider');
  return context;
};
