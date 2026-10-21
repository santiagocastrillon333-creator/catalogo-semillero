export interface Producto {
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  stock: number;
  category: { id: number; name: string };
}