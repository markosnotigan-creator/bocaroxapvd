
import { ProductType, Product } from './types';

export const CATEGORIES = ['Favoritos', 'Açaí', 'Caldas', 'Adicionais', 'Bebidas', 'Combos'];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Açaí Tradicional',
    price: 49.90,
    type: ProductType.BY_WEIGHT,
    category: 'Açaí',
    image: 'https://picsum.photos/seed/acai1/200/200'
  },
  {
    id: '2',
    name: 'Açaí Zero Açúcar',
    price: 54.90,
    type: ProductType.BY_WEIGHT,
    category: 'Açaí',
    image: 'https://picsum.photos/seed/acai2/200/200'
  },
  {
    id: '3',
    name: 'Água Mineral 500ml',
    price: 4.50,
    type: ProductType.BY_UNIT,
    category: 'Bebidas',
    image: 'https://picsum.photos/seed/water/200/200'
  },
  {
    id: '4',
    name: 'Combo Casal',
    price: 35.00,
    type: ProductType.BY_UNIT,
    category: 'Combos',
    image: 'https://picsum.photos/seed/combo/200/200'
  },
  {
    id: '5',
    name: 'Refrigerante Lata',
    price: 6.00,
    type: ProductType.BY_UNIT,
    category: 'Bebidas',
    image: 'https://picsum.photos/seed/soda/200/200'
  }
];

export const ADDONS = [
  { id: 'a1', name: 'Leite Ninho', price: 2.50 },
  { id: 'a2', name: 'Granola', price: 1.50 },
  { id: 'a3', name: 'Morango', price: 3.00 },
  { id: 'a4', name: 'Banana', price: 1.00 },
  { id: 'a5', name: 'Nutella', price: 5.00 },
];
