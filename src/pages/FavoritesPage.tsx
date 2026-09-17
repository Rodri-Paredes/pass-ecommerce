import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { supabase } from '../lib/supabase';
import { useFavoriteStore } from '../store/favoriteStore';
import type { ProductWithVariants } from '../types';

export default function FavoritesPage() {
  const productIds = useFavoriteStore((state) => state.productIds);
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  useEffect(() => {
    if (!productIds.length) { setProducts([]); return; }
    supabase.from('products').select('*, variants:product_variants(*, stock(*, branch:branches(*))), drop:drops(*)').in('id', productIds).then(({ data }) => setProducts(data || []));
  }, [productIds]);
  return <main className="pass-container min-h-[65vh] py-12 sm:py-20"><p className="pass-kicker">Tu selección</p><h1 className="pass-heading mt-2 border-b border-black pb-5 text-4xl sm:text-6xl">Favoritos</h1>{products.length ? <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4 md:gap-x-5">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="flex min-h-[45vh] flex-col items-center justify-center text-center"><Heart className="h-8 w-8 stroke-[1.2]" /><p className="mt-5 text-xl font-bold uppercase tracking-tight">Todavía no guardaste productos</p><Link to="/shop" className="mt-7 bg-black px-8 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white">Ver productos</Link></div>}</main>;
}
