import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { optimizeImageUrl } from '../lib/imageOptimizer';
import { supabase } from '../lib/supabase';
import type { Drop } from '../types';

export default function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { window.scrollTo(0, 0); supabase.from('drops').select('*').eq('status', 'ACTIVO').order('is_featured', { ascending: false }).order('launch_date', { ascending: false }).then(({ data }) => { setDrops(data || []); setLoading(false); }); }, []);
  if (loading) return <div className="grid min-h-[70vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  return <main><div className="pass-container pb-10 pt-12 sm:pb-16 sm:pt-20"><p className="pass-kicker">Colecciones</p><h1 className="pass-heading mt-2 text-6xl sm:text-8xl">Drops</h1></div>{drops.length ? <div>{drops.map((drop, index) => <Link key={drop.id} to={`/drops/${drop.id}`} className="group relative block min-h-[72vh] overflow-hidden bg-black"><img src={optimizeImageUrl(drop.banner_url || drop.image_url || '', { width: 1800, quality: 82 })} alt={drop.name} className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-[1.02]" loading={index ? 'lazy' : 'eager'} /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" /><div className="pass-container relative flex min-h-[72vh] items-end pb-10 text-white sm:pb-16"><div><p className="pass-kicker text-white/60">{new Date(drop.launch_date).toLocaleDateString('es-BO', { month: 'long', year: 'numeric' })}</p><h2 className="mt-3 text-5xl font-black uppercase leading-[.85] tracking-[-0.06em] sm:text-8xl">{drop.name}</h2><span className="mt-6 inline-block border-b border-white pb-2 text-[10px] font-bold uppercase tracking-[0.2em]">Ver colección →</span></div></div></Link>)}</div> : <div className="grid min-h-[50vh] place-items-center text-center"><p className="text-lg font-bold uppercase">No hay drops activos</p></div>}</main>;
}
