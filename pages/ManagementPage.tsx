
import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Search, Plus, Edit2, Trash2, X, Check, ArrowLeft, LayoutDashboard } from 'lucide-react';

interface ManagementPageProps {
  title: string;
  items: any[];
  fields: { name: string; label: string; type: string; placeholder?: string }[];
  onAdd: (item: any) => void;
  onUpdate: (item: any) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export const ManagementPage: React.FC<ManagementPageProps> = ({ 
  title, items, fields, onAdd, onUpdate, onDelete, onBack 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [search, setSearch] = useState('');

  const filteredItems = items.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem.id) {
      onUpdate(editingItem);
    } else {
      onAdd(editingItem);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const startNew = () => {
    const empty = fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {});
    setEditingItem(empty);
    setIsModalOpen(true);
  };

  return (
    <div className="h-full bg-[#fdfaff] dark:bg-zinc-950 p-8 flex flex-col overflow-hidden">
      <div className="max-w-6xl mx-auto w-full flex flex-col h-full gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="p-2 pr-4 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-2xl transition-all flex items-center gap-2 group"
            >
              <div className="w-8 h-8 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                 <ArrowLeft size={18} />
              </div>
              <span className="font-bold text-sm text-purple-900 dark:text-purple-100 pr-2">Voltar ao Painel</span>
            </button>
            <h1 className="text-3xl font-black text-purple-950 dark:text-white border-l-2 border-purple-200 dark:border-purple-800 pl-4">{title}</h1>
          </div>
          <Button size="lg" onClick={startNew}>
            <Plus size={20} className="mr-2" /> INCLUIR DADOS
          </Button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-purple-100 dark:border-purple-900/30 rounded-2xl font-bold focus:ring-4 focus:ring-purple-100 outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900 rounded-[2rem] border border-purple-100 dark:border-purple-900/20 shadow-sm overflow-hidden custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-purple-50/50 dark:bg-purple-900/10 border-b border-purple-100 dark:border-purple-900/20">
              <tr>
                {fields.map(f => (
                  <th key={f.name} className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label}</th>
                ))}
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 dark:divide-purple-900/20">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={fields.length + 1} className="px-8 py-20 text-center text-purple-200 font-bold italic">Nenhum registro encontrado.</td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-purple-50/20 dark:hover:bg-purple-900/5 transition-colors">
                    {fields.map(f => (
                      <td key={f.name} className="px-8 py-4 font-bold text-slate-700 dark:text-slate-300">{item[f.name]}</td>
                    ))}
                    <td className="px-8 py-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingItem(item); setIsModalOpen(true); }}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => onDelete(item.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-purple-100 dark:border-purple-900/20 flex justify-between items-center">
              <h2 className="text-2xl font-black text-purple-950 dark:text-white">Gerenciar Registro</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-purple-50 rounded-xl text-slate-400"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              {fields.map(f => (
                <div key={f.name} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{f.label}</label>
                  <input 
                    required 
                    type={f.type} 
                    placeholder={f.placeholder}
                    value={editingItem[f.name]}
                    onChange={e => setEditingItem({ ...editingItem, [f.name]: e.target.value })}
                    className="w-full p-4 bg-purple-50/50 dark:bg-zinc-800 rounded-2xl border-none font-bold focus:ring-4 focus:ring-purple-100 outline-none"
                  />
                </div>
              ))}
              <div className="pt-4 flex gap-4">
                <Button type="button" variant="ghost" fullWidth onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" fullWidth>
                  <Check size={20} className="mr-2" /> SALVAR DADOS
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
