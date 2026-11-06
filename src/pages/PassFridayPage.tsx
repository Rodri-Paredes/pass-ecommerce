import { useEffect, useState } from 'react';
import { ArrowLeft, BellRing } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PassFridayTime } from '../components/pass-friday/PassFridayCountdown';
import { supabase } from '../lib/supabase';

type TeaserProduct = { id: string; image_url: string };

const FALLBACK_TILES = [
  { id: 'reserve-01', background: 'linear-gradient(145deg, #341b17 0%, #11110f 58%, #f0442f 165%)', ink: '#090909', angle: -14 },
  { id: 'reserve-02', background: 'linear-gradient(160deg, #121312 0%, #49211b 53%, #11110f 100%)', ink: '#f0442f', angle: 9 },
  { id: 'reserve-03', background: 'linear-gradient(145deg, #271b18 0%, #121312 61%, #7a2920 145%)', ink: '#141414', angle: -7 },
  { id: 'reserve-04', background: 'linear-gradient(155deg, #11110f 0%, #5e251e 56%, #161714 100%)', ink: '#e4dfd5', angle: 15 },
];

function HiddenGarment({ index }: { index: number }) {
  const tile = FALLBACK_TILES[index % FALLBACK_TILES.length];

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: tile.background }} aria-hidden="true">
      <div className="absolute -right-[30%] top-[-12%] h-[68%] w-[86%] rounded-full bg-white/10 blur-3xl" />
      <div className="absolute left-1/2 top-[23%] h-[57%] w-[45%] -translate-x-1/2 rounded-[42%_42%_18%_18%] blur-lg" style={{ backgroundColor: tile.ink, transform: `translateX(-50%) rotate(${tile.angle}deg)` }} />
      <div className="absolute left-1/2 top-[33%] h-[25%] w-[70%] -translate-x-1/2 rounded-[35%] bg-black/70 blur-lg" style={{ transform: `translateX(-50%) rotate(${tile.angle}deg)` }} />
      <div className="absolute bottom-[-14%] left-[7%] h-[50%] w-[86%] rounded-full bg-black/70 blur-2xl" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.08),transparent_35%,rgba(0,0,0,.5))]" />
    </div>
  );
}

export default function PassFridayPage() {
  const [products, setProducts] = useState<TeaserProduct[]>([]);

  useEffect(() => {
    supabase
      .from('products')
      .select('id, image_url')
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => setProducts((data || []).filter((product): product is TeaserProduct => Boolean(product.image_url))));
  }, []);

  const tiles = products.length ? products : FALLBACK_TILES.map((tile) => ({ id: tile.id, image_url: '' }));

  return (
    <main className="min-h-screen bg-[#0a0b08] text-white">
      <section className="bg-[#f0442f] text-black">
        <div className="pass-container py-7 sm:py-10">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.17em] text-black/65 transition hover:text-black"><ArrowLeft className="h-4 w-4" /> Volver a PASS</Link>
          <div className="relative grid gap-12 pb-12 pt-16 sm:pb-16 sm:pt-24 md:grid-cols-[1.15fr_.85fr] md:gap-x-12 lg:gap-x-16">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.24em] text-black/65">Viernes 27 de noviembre</p>
              <h1 className="mt-5 whitespace-nowrap text-[clamp(2.75rem,7.5vw,7rem)] font-black uppercase leading-[.86] tracking-[-.035em]">PASS <span className="tracking-[-.005em] text-white">FRIDAY</span></h1>
              <p className="mt-9 max-w-md text-sm font-medium leading-6 text-black/70 sm:text-base">Una selección especial está por desbloquearse. Los detalles aparecen el día del lanzamiento.</p>
            </div>
            <div className="self-end md:pb-3">
              <p className="text-[9px] font-bold uppercase tracking-[.21em] text-black/55">La cuenta ya corre</p>
              <div className="mt-4 border-y-2 border-black py-5 sm:py-6"><PassFridayTime tone="dark" /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="pass-container py-14 sm:py-20">
        <div className="mb-7 border-b border-white/15 pb-5 sm:mb-10">
          <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#f0442f]">Vista previa</p>
          <h2 className="mt-2 text-3xl font-black uppercase leading-none tracking-[-.06em] sm:text-5xl">Aún oculto.</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:gap-5">
          {tiles.map((product, index) => (
            <article key={product.id} className="group relative aspect-[4/5] overflow-hidden border border-white/15 bg-[#151512]">
              {product.image_url ? <img src={product.image_url} alt="" className="h-full w-full scale-110 object-cover grayscale blur-lg brightness-[.55] contrast-150 opacity-95 transition duration-700 group-hover:scale-105 group-hover:blur-md" /> : <HiddenGarment index={index} />}
              <div className="pointer-events-none absolute inset-0 bg-[#f0442f]/60 mix-blend-screen" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,.15),rgba(0,0,0,.72))]" aria-hidden="true" />
              <div className="absolute inset-x-3 bottom-3 flex items-center justify-between border-t border-white/50 pt-2 text-[8px] font-bold uppercase tracking-[.13em] text-white/80 sm:inset-x-4 sm:bottom-4"><span>PASS / {String(index + 1).padStart(2, '0')}</span><span>Sin revelar</span></div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col justify-between gap-5 border-t border-white/15 pt-6 sm:mt-16 sm:flex-row sm:items-center">
          <p className="max-w-xl text-sm leading-6 text-white/55">Regístrate o inicia sesión para tener tu código PASS listo cuando se active la campaña.</p>
          <Link to="/signup?redirect=/pass-friday" className="inline-flex w-fit items-center gap-3 bg-[#f0442f] px-5 py-4 text-[10px] font-bold uppercase tracking-[.16em] text-black transition hover:bg-white"><BellRing className="h-4 w-4" /> Preparar mi PASS</Link>
        </div>
      </section>
    </main>
  );
}
