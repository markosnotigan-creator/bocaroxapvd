
import React from 'react';
import { Product, ProductType } from '../../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div 
      onClick={() => onClick(product)}
      className="group bg-white dark:bg-zinc-900 rounded-[2rem] p-4 shadow-sm hover:shadow-2xl dark:hover:shadow-purple-900/20 hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-purple-50 dark:border-purple-900/20 relative overflow-hidden"
    >
      <div className="absolute top-4 right-4 z-10">
        <span className={`
          px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm
          ${product.type === ProductType.BY_WEIGHT 
            ? 'bg-purple-600 text-white' 
            : 'bg-amber-400 text-amber-950'}
        `}>
          {product.type === ProductType.BY_WEIGHT ? 'Pesar' : 'Unid'}
        </span>
      </div>
      
      <div className="aspect-square w-full mb-4 rounded-[1.5rem] overflow-hidden bg-purple-50 dark:bg-zinc-800">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700"
        />
      </div>
      
      <div className="space-y-1 px-1">
        <h3 className="font-black text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
          {product.name}
        </h3>
        <p className="text-purple-700 dark:text-purple-400 font-black text-xl">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold ml-1 uppercase">
            {product.type === ProductType.BY_WEIGHT ? '/kg' : ''}
          </span>
        </p>
      </div>
      
      {/* Overlay sutil ao passar o mouse */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
};
