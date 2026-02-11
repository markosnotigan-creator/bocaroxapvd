
export enum ProductType {
  BY_WEIGHT = 'weight',
  BY_UNIT = 'unit',
  COMBO = 'combo'
}

export enum PaymentMethod {
  CASH = 'CASH',
  PIX = 'PIX',
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  type: ProductType;
  category: string;
  image: string;
  stock?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  creditLimit: number;
}

export interface Seller {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

export interface Table {
  id: string;
  number: number;
  status: 'available' | 'occupied' | 'reserved';
  currentTotal: number;
}

export interface DeliveryOrder {
  id: string;
  customerName: string;
  address: string;
  items: string;
  total: number;
  status: 'pending' | 'preparing' | 'shipping' | 'delivered';
  timestamp: number;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  type: ProductType;
  quantity: number; 
  addons: Addon[];
  observations?: string;
  total: number;
}

export interface Payment {
  method: PaymentMethod;
  amount: number;
}

export interface Sale {
  id: string;
  timestamp: number;
  items: CartItem[];
  totalAmount: number;
  payments: Payment[];
  change: number;
  status: 'completed' | 'refunded';
  sellerId?: string;
  sellerName?: string;
}

export enum ScaleMode {
  KEYBOARD = 'keyboard',
  SERIAL = 'serial',
  MANUAL = 'manual'
}

export interface ScaleConfig {
  mode: ScaleMode;
  comPort?: string;
  baudRate?: number;
}

export type ScaleStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ReceiptConfig {
  storeName: string;
  address: string;
  phone: string;
  cnpj: string;
  footerMessage: string;
  autoPrint: boolean;
  showLogo: boolean;
}

export interface SecurityConfig {
  reportsPassword: string;
  recoveryEmail: string;
  recoveryPhone: string;
}

export interface DeliveryConfig {
  whatsappUrl: string;
}

export interface CashRegister {
  id: string;
  openedAt: number;
  closedAt?: number;
  openingBalance: number;
  currentBalance: number;
  status: 'open' | 'closed';
  entries: {
    type: 'sale' | 'bleed' | 'entry';
    amount: number;
    description: string;
    timestamp: number;
  }[];
}
