
import React, { useState } from 'react';
import { usePOS } from '../store/pos-store';
import { CATEGORIES } from '../constants';
import { Product, ProductType, ScaleMode } from '../types';
import { ProductCard } from '../components/POS/ProductCard';
import { WeightModal } from '../components/POS/WeightModal';
import { PaymentModal } from '../components/POS/PaymentModal';
import { Button } from '../components/ui/Button';
import { Search, ShoppingCart, Trash2, Tag, ChevronRight, Scale, ShoppingBag, Sparkles, User, Cable } from 'lucide-react';

export const POSPage: React.FC = () => {
  const { products, cart, removeFromCart, addToCart, clearCart, scaleConfig, scaleStatus, connectToScale, sellers, currentSellerId, setCurrentSellerId } = usePOS();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Favoritos' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleQuantityConfirm = (quantity: number) => {
    if (selectedProduct) {
      addToCart(selectedProduct, quantity);
      setSelectedProduct(null);
    }
  };

  const handleCheckout = () => {
    if (!currentSellerId) {
      alert('⚠️ ATENÇÃO: IDENTIFICAÇÃO OBRIGATÓRIA\n\nPor favor, selecione um VENDEDOR no topo da tela para prosseguir com o fechamento do pedido.');
      return;
    }
    setIsPaymentOpen(true);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="flex h-full bg-[#fdfaff] dark:bg-zinc-950 overflow-hidden transition-colors duration-500">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col p-8 gap-8 overflow-hidden relative">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/30 dark:bg-purple-900/5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Header & Search */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-purple-950 dark:text-white tracking-tight flex items-center gap-3">
                Fazer Pedido <Sparkles className="text-amber-400" size={24} />
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">Terminal <span className="text-purple-600 dark:text-purple-400">#01-ROXA</span></p>
                </div>
                {/* Scale Status Indicator */}
                {scaleConfig.mode === ScaleMode.SERIAL && (
                  <button
                    onClick={scaleStatus !== 'connected' ? connectToScale : undefined}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${scaleStatus === 'connected' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100'}`}
                  >
                    <Cable size={12} />
                    {scaleStatus === 'connected' ? 'Balança Conectada' : 'Balança Desconectada'}
                  </button>
                )}
              </div>
            </div>

            {/* Vendedor Selector */}
            <div className={`hidden lg:flex items-center gap-3 bg-white dark:bg-zinc-900 border p-2 pl-4 rounded-2xl shadow-sm transition-all duration-300 ${!currentSellerId ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-900/20' : 'border-purple-100 dark:border-purple-900/30'}`}>
              <User size={18} className={!currentSellerId ? "text-rose-500" : "text-purple-400"} />
              <select
                value={currentSellerId || ''}
                onChange={(e) => setCurrentSellerId(e.target.value)}
                className={`bg-transparent border-none font-black text-xs focus:ring-0 outline-none pr-8 cursor-pointer ${!currentSellerId ? 'text-rose-500' : 'text-purple-900 dark:text-purple-100'}`}
              >
                <option value="">⚠️ SELECIONE VENDEDOR</option>
                {sellers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 group-focus-within:text-purple-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Encontre um sabor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-purple-100 dark:border-purple-900/30 text-slate-800 dark:text-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/20 focus:border-purple-400 transition-all font-bold"
            />
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide relative z-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-400 whitespace-nowrap
                ${activeCategory === cat
                  ? 'bg-purple-700 text-white shadow-xl shadow-purple-200 dark:shadow-none translate-y-[-2px]'
                  : 'bg-white dark:bg-zinc-900 text-purple-400 dark:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-purple-50 dark:border-purple-900/30'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 relative z-10 custom-scrollbar">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-8">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={handleProductClick}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-purple-200 dark:text-purple-900 gap-4">
              <ShoppingBag size={80} />
              <p className="font-black text-xl">Sabor não encontrado...</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart Panel */}
      <div className="w-[480px] bg-white dark:bg-zinc-900 border-l border-purple-50 dark:border-purple-900/30 flex flex-col p-8 shadow-[-20px_0_60px_rgba(76,29,149,0.03)] transition-all duration-500 relative z-20">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h2 className="font-black text-2xl text-purple-950 dark:text-white tracking-tight">Carrinho</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cart.length} itens no balcão</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-xs">Limpar</Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mx-2 px-2 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-purple-100 dark:text-purple-900/50 gap-4 border-4 border-dashed border-purple-50 dark:border-purple-900/10 rounded-[3rem]">
              <div className="w-20 h-20 rounded-full bg-purple-50/50 dark:bg-purple-900/5 flex items-center justify-center">
                <ShoppingBag size={40} />
              </div>
              <p className="font-black text-sm uppercase tracking-tighter">O balcão está vazio</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={item.id} className="group flex items-start justify-between p-6 bg-purple-50/30 dark:bg-zinc-800/50 rounded-[2rem] hover:bg-white dark:hover:bg-zinc-800 hover:shadow-2xl dark:hover:shadow-purple-900/10 border border-transparent hover:border-purple-100 dark:hover:border-purple-800 transition-all duration-500">
                <div className="flex-1 space-y-1">
                  <h4 className="font-black text-purple-900 dark:text-purple-100 text-md group-hover:text-purple-600 transition-colors">{item.name}</h4>
                  <p className="text-[10px] font-bold text-purple-400 dark:text-purple-500 uppercase tracking-widest">
                    {item.quantity} {item.type === ProductType.BY_WEIGHT ? 'kg' : 'un'} @ {formatCurrency(item.price)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <p className="font-black text-purple-950 dark:text-white text-lg">{formatCurrency(item.total)}</p>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 pt-8 border-t-2 border-purple-50 dark:border-purple-900/20 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-slate-400 dark:text-slate-500 font-bold text-sm px-2">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between items-center bg-purple-50/50 dark:bg-purple-900/10 p-6 rounded-[2rem]">
              <span className="text-xl font-black text-purple-950 dark:text-white uppercase tracking-tighter">Total Geral</span>
              <span className="text-4xl font-black text-purple-700 dark:text-purple-400">{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          <div className="flex gap-4 p-5 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] items-center border border-amber-100 dark:border-amber-900/30">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-amber-950 shadow-lg shadow-amber-200 dark:shadow-none">
              <Scale size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-black text-amber-600 tracking-[0.2em]">Toledo Prix 3</p>
              <p className="text-sm font-black text-amber-900 dark:text-amber-100">
                Sincronizada • {scaleConfig.mode.toUpperCase()}
              </p>
            </div>
            {scaleConfig.mode === ScaleMode.SERIAL && scaleStatus === 'connected' && (
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
            )}
          </div>

          <Button
            size="lg"
            fullWidth
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="h-24 text-xl shadow-2xl shadow-purple-200 dark:shadow-none"
          >
            <span className="flex items-center gap-4">
              FECHAR PEDIDO <ChevronRight size={28} className="animate-bounce-x" />
            </span>
          </Button>
        </div>
      </div>

      {selectedProduct && (
        <WeightModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={handleQuantityConfirm}
        />
      )}

      {isPaymentOpen && (
        <PaymentModal
          total={cartTotal}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={() => setIsPaymentOpen(false)}
        />
      )}
    </div>
  );
};
