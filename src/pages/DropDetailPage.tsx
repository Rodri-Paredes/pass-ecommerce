import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import { optimizeImageUrl } from '../lib/imageOptimizer';
import { supabase } from '../lib/supabase';
import type { Drop } from '../types';

export default function DropDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [drop, setDrop] = useState<Drop | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { window.scrollTo(0, 0); if (!id) return; supabase.from('drops').select('*').eq('id', id).single().then(({ data }) => { setDrop(data); setLoading(false); }); }, [id]);
  if (loading) return <div className="grid min-h-[70vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!drop) return <div className="grid min-h-[70vh] place-items-center text-center"><div><p className="text-xl font-bold uppercase">Drop no encontrado</p><Link to="/drops" className="mt-5 inline-block underline">Ver drops</Link></div></div>;
  return <main>{(drop.banner_url || drop.image_url) && <section className="relative min-h-[72vh] overflow-hidden bg-black"><img src={optimizeImageUrl(drop.banner_url || drop.image_url || '', { width: 1800, quality: 82 })} alt={drop.name} className="absolute inset-0 h-full w-full object-cover opacity-80" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" /><div className="pass-container relative flex min-h-[72vh] items-end pb-12 text-white"><div><p className="pass-kicker text-white/60">Drop / {new Date(drop.launch_date).toLocaleDateString('es-BO', { month: 'long', year: 'numeric' })}</p><h1 className="mt-3 text-6xl font-black uppercase leading-[.84] tracking-[-0.065em] sm:text-9xl">{drop.name}</h1>{drop.description && <p className="mt-6 max-w-2xl text-sm leading-6 text-white/70">{drop.description}</p>}</div></div></section>}<section className="pass-container py-16 sm:py-24"><div className="mb-9 flex items-end justify-between border-b border-black pb-4"><div><p className="pass-kicker">La colección</p><h2 className="pass-heading mt-2 text-4xl sm:text-6xl">Shop the drop</h2></div></div><ProductGrid dropId={drop.id} /></section></main>;
}
