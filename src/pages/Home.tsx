import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { optimizeImageUrl } from '../lib/imageOptimizer';
import { supabase } from '../lib/supabase';
import type { Drop, ProductWithVariants } from '../types';

const HERO = 'https://nvkoustxdmrxhdrcozqz.supabase.co/storage/v1/object/public/drops-banners/IMG_9579.HEIC';
const HOODIES = 'https://nvkoustxdmrxhdrcozqz.supabase.co/storage/v1/object/public/products/1760802011775-Photoroom_20251018_110704.jpeg';
const POLERAS = 'https://nvkoustxdmrxhdrcozqz.supabase.co/storage/v1/object/public/products/1754948116239-Photoroom_20250417_140556.jpeg';
const EDITORIAL = 'https://nvkoustxdmrxhdrcozqz.supabase.co/storage/v1/object/public/products/home.jpeg';

export default function Home() {
  const [latestDrop, setLatestDrop] = useState<Drop | null>(null);
  const [newArrivals, setNewArrivals] = useState<ProductWithVariants[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('drops').select('*').eq('status', 'ACTIVO').order('is_featured', { ascending: false }).order('launch_date', { ascending: false }).limit(1),
      supabase.from('products').select('*, variants:product_variants(*, stock(*, branch:branches(*))), drop:drops(*)').order('created_at', { ascending: false }).limit(4),
    ]).then(([dropResult, productsResult]) => {
      if (dropResult.data?.[0]) setLatestDrop(dropResult.data[0]);
      if (productsResult.data) setNewArrivals(productsResult.data);
    });
  }, []);

  const dropImage = latestDrop?.banner_url || latestDrop?.image_url || EDITORIAL;

  return (
    <div className="bg-white">
      <section className="relative min-h-[calc(100svh-96px)] overflow-hidden bg-black sm:min-h-[calc(100svh-100px)]">
        <img src={optimizeImageUrl(HERO, { width: 1800, quality: 84 })} alt="PASS Clothing" className="absolute inset-0 h-full w-full object-cover object-[center_18%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/10" />
        <div className="pass-container relative flex min-h-[calc(100svh-96px)] items-end pb-10 text-white sm:min-h-[calc(100svh-100px)] sm:pb-16">
          <div className="max-w-3xl">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-xs">New drop</p>
            <h1 className="text-[clamp(3.5rem,11vw,9rem)] font-black uppercase leading-[0.78] tracking-[-0.075em]">Move<br />Different.</h1>
            <div className="mt-8 flex flex-wrap gap-3"><Link to={latestDrop ? `/drops/${latestDrop.id}` : '/drops'} className="inline-flex h-12 items-center gap-3 bg-white px-6 text-[10px] font-bold uppercase tracking-[0.18em] text-black hover:bg-black hover:text-white">Ver colección <ArrowRight className="h-4 w-4" /></Link><Link to="/shop" className="inline-flex h-12 items-center border border-white px-6 text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-white hover:text-black">Shop all</Link></div>
          </div>
        </div>
      </section>

      <section className="pass-container py-16 sm:py-24">
        <div className="mb-8 flex items-end justify-between border-b border-black pb-4"><div><p className="pass-kicker">Lo último</p><h2 className="pass-heading mt-2 text-3xl sm:text-5xl">New arrivals</h2></div><Link to="/shop?sort=newest" className="pass-link hidden text-[10px] font-bold uppercase tracking-[0.18em] sm:block">Ver todo →</Link></div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">{newArrivals.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
        <Link to="/shop?sort=newest" className="mt-10 block border border-black py-4 text-center text-[10px] font-bold uppercase tracking-[0.18em] sm:hidden">Ver todo</Link>
      </section>

      <section className="grid md:grid-cols-2">
        <CategoryBlock image={HOODIES} title="Hoodies" to="/shop?category=Hoodies" />
        <CategoryBlock image={POLERAS} title="Poleras" to="/shop?category=Poleras" />
      </section>

      <section className="pass-container py-16 sm:py-28">
        <div className="grid items-stretch lg:grid-cols-[1.05fr_.95fr]">
          <div className="min-h-[60vh] overflow-hidden bg-neutral-100"><img src={optimizeImageUrl(dropImage, { width: 1200, quality: 82 })} alt={latestDrop?.name || 'PASS Drop'} loading="lazy" className="h-full min-h-[60vh] w-full object-cover" /></div>
          <div className="flex flex-col justify-center bg-black px-7 py-12 text-white sm:px-14 lg:px-16"><p className="pass-kicker text-white/50">Drop destacado</p><h2 className="mt-4 text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] sm:text-7xl">{latestDrop?.name || 'PASS Clothing'}</h2>{latestDrop?.description && <p className="mt-7 max-w-lg text-sm leading-6 text-white/65 sm:text-base">{latestDrop.description}</p>}<Link to={latestDrop ? `/drops/${latestDrop.id}` : '/drops'} className="mt-9 inline-flex w-fit items-center gap-3 border-b border-white pb-2 text-[10px] font-bold uppercase tracking-[0.2em]">Explorar drop <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      <section className="relative min-h-[70vh] overflow-hidden bg-neutral-900"><img src={optimizeImageUrl(EDITORIAL, { width: 1800, quality: 82 })} alt="PASS streetwear" loading="lazy" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-black/35" /><div className="pass-container relative flex min-h-[70vh] items-end pb-12 text-white sm:pb-20"><div><p className="pass-kicker text-white/70">PASS / Bolivia</p><p className="mt-3 max-w-3xl text-4xl font-black uppercase leading-[0.92] tracking-[-0.055em] sm:text-7xl">Diseñado para moverte a tu manera.</p></div></div></section>
    </div>
  );
}

function CategoryBlock({ image, title, to }: { image: string; title: string; to: string }) {
  return <Link to={to} className="group relative min-h-[62vh] overflow-hidden bg-neutral-100"><img src={optimizeImageUrl(image, { width: 1000, quality: 80 })} alt={title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]" /><div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" /><div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white sm:p-10"><h2 className="text-4xl font-black uppercase tracking-[-0.055em] sm:text-6xl">{title}</h2><span className="mb-1 text-2xl transition-transform group-hover:translate-x-1">→</span></div></Link>;
}
