
import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductType, ScaleMode } from '../../types';
import { usePOS } from '../../store/pos-store';
import { Button } from '../ui/Button';
import { Weight, Plus, Minus, X } from 'lucide-react';

interface WeightModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
}

export const WeightModal: React.FC<WeightModalProps> = ({ product, onClose, onConfirm }) => {
  const { currentWeight, scaleConfig, setCurrentWeight } = usePOS();
  const [manualValue, setManualValue] = useState<string>(
    product.type === ProductType.BY_WEIGHT ? '0.000' : '1'
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scaleConfig.mode === ScaleMode.KEYBOARD) {
      inputRef.current?.focus();
    }
  }, [scaleConfig.mode]);

  // If in weight mode and scale updates, reflect in local state
  useEffect(() => {
    if (product.type === ProductType.BY_WEIGHT && currentWeight > 0) {
      setManualValue(currentWeight.toFixed(3));
    }
  }, [currentWeight, product.type]);

  const handleKeyboardInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = parseFloat(manualValue);
      if (val > 0) onConfirm(val);
    }
  };

  const increment = () => setManualValue(prev => (parseFloat(prev) + 1).toString());
  const decrement = () => setManualValue(prev => Math.max(1, parseFloat(prev) - 1).toString());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Weight size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg">{product.name}</h2>
              <p className="text-xs text-slate-500">
                {product.type === ProductType.BY_WEIGHT ? 'Capture o peso da balança' : 'Informe a quantidade'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-10 space-y-6 text-center">
          {product.type === ProductType.BY_WEIGHT ? (
            <div className="space-y-4">
              <div className="text-6xl font-black text-slate-900 flex items-baseline justify-center gap-2">
                <input
                  ref={inputRef}
                  type="number"
                  step="0.001"
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                  onKeyDown={handleKeyboardInput}
                  className="w-48 bg-transparent text-center focus:outline-none border-b-4 border-indigo-600"
                />
                <span className="text-2xl text-slate-400">kg</span>
              </div>
              <div className="bg-indigo-50 p-4 rounded-2xl">
                <p className="text-indigo-600 font-bold text-xl">
                  Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price * parseFloat(manualValue || '0'))}
                </p>
              </div>
              <p className="text-xs text-slate-400 italic">
                {scaleConfig.mode === ScaleMode.KEYBOARD ? 'Aguardando balança (modo teclado)...' : 'Digite o peso manualmente'}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-8">
              <Button size="icon" variant="outline" className="w-16 h-16 rounded-full" onClick={decrement}>
                <Minus size={24} />
              </Button>
              <span className="text-5xl font-black text-slate-900 w-24">{manualValue}</span>
              <Button size="icon" variant="outline" className="w-16 h-16 rounded-full" onClick={increment}>
                <Plus size={24} />
              </Button>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 flex gap-4">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button
            fullWidth
            disabled={parseFloat(manualValue) <= 0}
            onClick={() => onConfirm(parseFloat(manualValue))}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
};
