
import React, { useState } from 'react';
import { usePOS } from '../store/pos-store';
import { Product, ProductType } from '../types';
import { CATEGORIES } from '../constants';
import { Button } from '../components/ui/Button';
import { Plus, Edit2, Trash2, Tag, Image as ImageIcon, X, Check } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = usePOS();
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct({
      name: '',
      price: 0,
      type: ProductType.BY_UNIT,
      category: CATEGORIES[1],
      image: 'https://picsum.photos/seed/new/200/200'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editingProduct.id) {
      updateProduct(editingProduct as Product);
    } else {
      addProduct(editingProduct as Omit<Product, 'id'>);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="h-full bg-slate-50 p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Gestão de Cardápio</h1>
            <p className="text-slate-500 font-medium">Cadastre e altere preços, fotos e categorias dos seus produtos.</p>
          </div>
          <Button size="lg" onClick={handleAddNew}>
            <Plus size={20} className="mr-2" /> NOVO PRODUTO
          </Button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img src={product.image} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                      <span className="font-bold text-slate-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-xs font-bold ${product.type === ProductType.BY_WEIGHT ? 'text-purple-600' : 'text-blue-600'}`}>
                      {product.type === ProductType.BY_WEIGHT ? 'Por Quilo' : 'Por Unidade'}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                    <span className="text-[10px] text-slate-400 font-normal ml-1">
                      {product.type === ProductType.BY_WEIGHT ? '/kg' : ''}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50" onClick={() => {
                      if (confirm('Deseja excluir este produto?')) deleteProduct(product.id);
                    }}>
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800">
                {editingProduct.id ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Produto</label>
                <input
                  required
                  type="text"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Preço (R$)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Venda por</label>
                  <select
                    value={editingProduct.type}
                    onChange={e => setEditingProduct({ ...editingProduct, type: e.target.value as ProductType })}
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                  >
                    <option value={ProductType.BY_UNIT}>Unidade</option>
                    <option value={ProductType.BY_WEIGHT}>Quilo (Balança)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">URL da Imagem</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingProduct.image}
                    onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    placeholder="https://exemplo.com/foto.jpg"
                    className="flex-1 p-4 bg-slate-50 rounded-2xl border-none text-sm focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                  />
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-200">
                    <img src={editingProduct.image} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                <select
                  value={editingProduct.category}
                  onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="button" variant="ghost" fullWidth onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" fullWidth>
                  <Check size={20} className="mr-2" /> SALVAR PRODUTO
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
