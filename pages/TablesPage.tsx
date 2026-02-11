
import React from 'react';
import { usePOS } from '../store/pos-store';
import { ArrowLeft, Coffee } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const TablesPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { tables, updateTable } = usePOS();

  const toggleStatus = (table: any) => {
    const nextStatus = table.status === 'available' ? 'occupied' : 'available';
    updateTable({ ...table, status: nextStatus });
  };

  return (
    <div className="h-full bg-[#fdfaff] dark:bg-zinc-950 p-8 flex flex-col">
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={onBack} className="p-2 hover:bg-purple-100 rounded-full transition-colors">
            <ArrowLeft className="text-purple-600" />
          </button>
          <h1 className="text-3xl font-black text-purple-950 dark:text-white">Mapa de Mesas</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {tables.map(table => (
            <button
              key={table.id}
              onClick={() => toggleStatus(table)}
              className={`
                aspect-square rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 border-4
                ${table.status === 'available'
                  ? 'bg-white border-emerald-50 text-emerald-500 hover:border-emerald-200 shadow-sm'
                  : 'bg-rose-500 border-rose-600 text-white shadow-xl scale-105'}
              `}
            >
              <div className={`p-3 rounded-2xl ${table.status === 'available' ? 'bg-emerald-50' : 'bg-rose-400/30'}`}>
                <Coffee size={28} />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Mesa</p>
                <h3 className="text-3xl font-black">{table.number}</h3>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest">
                {table.status === 'available' ? 'Livre' : 'Ocupada'}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
