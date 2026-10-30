import { useEffect, useMemo, useState } from 'react';
import { Crown, Heart, Loader2, Minus, Plus } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import ProductGallery from '../components/product/ProductGallery';
import SizeGuideModal from '../components/product/SizeGuideModal';
import SizeSelector from '../components/product/SizeSelector';
import { rankProductRecommendations, type ProductPreferenceSignal } from '../lib/productRecommendations';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { useDiscountStore } from '../store/discountStore';
import { useFavoriteStore } from '../store/favoriteStore';
import type { ProductVariant, ProductWithVariants } from '../types';
import { useCustomerAuthStore } from '../store/customerAuthStore';
import { passCrewService } from '../services/passCrewService';
import type { CrewSaleQuote } from '../types';

const RECENTLY_VIEWED_KEY = 'pass-recently-viewed-products';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductWithVariants | null>(null);
  const [recommendationPool, setRecommendationPool] = useState<ProductWithVariants[]>([]);
  const [preferenceSignals, setPreferenceSignals] = useState<ProductPreferenceSignal[]>([]);
  const [recentProductIds, setRecentProductIds] = useState<string[]>(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
      return Array.isArray(stored) ? stored.filter((productId): productId is string => typeof productId === 'string').slice(0, 12) : [];
    } catch {
      return [];
    }
  });
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [stock, setStock] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [crewQuote, setCrewQuote] = useState<CrewSaleQuote | null>(null);
  const { addItem, openCart } = useCartStore();
  const discount = useDiscountStore((state) => id ? state.activeDiscountsMap.get(id) : undefined);
  const loadDiscounts = useDiscountStore((state) => state.loadActiveDiscountsMap);
  const { isFavorite, toggleFavorite, productIds: favoriteProductIds } = useFavoriteStore();
  const customer = useCustomerAuthStore((state) => state.customer);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setRecommendationPool([]);
    loadDiscounts();
    const loadProduct = async () => {
      const { data } = await supabase.from('products').select('*, variants:product_variants(*, stock(*, branch:branches(*))), drop:drops(*)').eq('is_visible', true).eq('id', id).single();
      if (cancelled) return;
      setProduct(data);
      setLoading(false);
      if (data) {
        setRecentProductIds((current) => {
          const next = [data.id, ...current.filter((productId) => productId !== data.id)].slice(0, 12);
          if (next.every((productId, index) => productId === current[index])) return current;
          localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
          return next;
        });
        const { data: related } = await supabase.from('products').select('*, variants:product_variants(*, stock(*, branch:branches(*))), drop:drops(*)').eq('is_visible', true).eq('category', data.category).neq('id', data.id).order('created_at', { ascending: false }).limit(200);
        if (!cancelled) setRecommendationPool(related || []);
      }
    };
    loadProduct();
    return () => { cancelled = true; };
  }, [id, loadDiscounts]);

  useEffect(() => {
    const preferenceIds = [...new Set([...favoriteProductIds, ...recentProductIds])].filter((productId) => productId !== id).slice(0, 24);
    if (!preferenceIds.length) { setPreferenceSignals([]); return; }
    let cancelled = false;
    supabase.from('products').select('id, name, category, price, color, fit, product_style').eq('is_visible', true).in('id', preferenceIds).then(({ data }) => {
      if (!cancelled) setPreferenceSignals(data || []);
    });
    return () => { cancelled = true; };
  }, [favoriteProductIds, recentProductIds, id]);

  const images = useMemo(() => product ? [product.image_url, ...(product.images || [])] : [], [product]);
  const recommended = useMemo(() => {
    if (!product) return [];
    const favoriteIds = new Set(favoriteProductIds);
    const recentIds = new Set(recentProductIds);
    return rankProductRecommendations(product, recommendationPool, {
      favoriteProducts: preferenceSignals.filter((item) => favoriteIds.has(item.id)),
      recentlyViewedProducts: preferenceSignals.filter((item) => recentIds.has(item.id)),
      favoriteProductIds,
    });
  }, [product, recommendationPool, preferenceSignals, favoriteProductIds, recentProductIds]);
  const finalPrice = product ? product.price * (discount ? 1 - discount.percentage / 100 : 1) : 0;
  useEffect(() => {
    if (!customer || !selectedVariant || !product) { setCrewQuote(null); return; }
    passCrewService.quoteCart(customer.id, [{ variantId: selectedVariant.id, quantity: 1, unitPrice: finalPrice }]).then((quote) => setCrewQuote(quote.source === 'crew' ? quote : null)).catch(() => setCrewQuote(null));
  }, [customer, selectedVariant, product, finalPrice]);
  const selectSize = (variant: ProductVariant, available: number) => { setSelectedVariant(variant); setStock(available); setQuantity(1); };
  const add = () => { if (!product || !selectedVariant) return; addItem({ product, variant: selectedVariant, quantity, availableStock: stock }); openCart(); };

  if (loading) return <div className="grid min-h-[70vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin" /></div>;
  if (!product) return <div className="grid min-h-[70vh] place-items-center text-center"><div><p className="text-xl font-bold uppercase">Producto no encontrado</p><Link to="/shop" className="mt-5 inline-block underline">Volver al shop</Link></div></div>;

  const hasMetadata = Boolean(product.color || product.fit || product.product_style);
  return <main className="pb-20 md:pb-0"><div className="pass-container py-5 sm:py-10"><div className="mb-5 text-[10px] uppercase tracking-[0.14em] text-black/45"><Link to="/shop">Shop</Link> / <span>{product.category}</span></div><div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:gap-10 xl:gap-14"><ProductGallery images={images} name={product.name} /><aside className="min-w-0 md:sticky md:top-28 md:h-fit"><div className="flex items-start justify-between gap-4"><div className="min-w-0">{product.drop && <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">{product.drop.name}</p>}<h1 className="break-words text-3xl font-black uppercase leading-[.95] tracking-[-0.045em] sm:text-4xl">{product.name}</h1></div><button type="button" onClick={() => toggleFavorite(product.id)} className="shrink-0 p-2" aria-label="Favorito"><Heart className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-black' : ''}`} /></button></div><div className="mt-5 flex flex-wrap items-center gap-3 text-lg">{discount && <span className="text-black/35 line-through">Bs. {product.price.toFixed(2)}</span>}<span className="font-bold">Bs. {finalPrice.toFixed(2)}</span>{discount && <span className="bg-black px-2 py-1 text-[9px] font-bold text-white">-{discount.percentage}%</span>}</div>{crewQuote && <div className="mt-4 flex items-center gap-2 border border-[#c9a961]/40 bg-[#c9a961]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#765a28]"><Crown className="h-3.5 w-3.5"/> PASS Crew benefit disponible</div>}{product.description && <p className="mt-6 text-sm leading-6 text-black/65">{product.description}</p>}{hasMetadata && <div className="mt-7 grid grid-cols-2 gap-4 border-y border-black/10 py-4 sm:grid-cols-3">{product.color && <Meta label="Color" value={product.color} />}{product.fit && <Meta label="Fit" value={product.fit} />}{product.product_style && <Meta label="Estilo" value={product.product_style} />}</div>}<div className="mt-7"><SizeSelector variants={product.variants || []} selectedSize={selectedVariant?.size || null} onSizeSelect={selectSize} productCategory={product.category} onShowSizeGuide={() => setGuideOpen(true)} /></div>{selectedVariant && <div className="mt-6 flex items-center justify-between border-y border-black/10 py-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em]">Cantidad</span><div className="flex items-center"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-9 w-9 place-items-center border border-black/15"><Minus className="h-3.5 w-3.5" /></button><span className="grid h-9 w-10 place-items-center text-xs font-bold">{quantity}</span><button type="button" onClick={() => setQuantity(Math.min(stock, quantity + 1))} disabled={quantity >= stock} className="grid h-9 w-9 place-items-center border border-black/15 disabled:opacity-25"><Plus className="h-3.5 w-3.5" /></button></div></div>}<button type="button" onClick={add} disabled={!selectedVariant} className="mt-6 h-14 w-full bg-black text-[11px] font-bold uppercase tracking-[0.2em] text-white disabled:bg-black/20">{selectedVariant ? `Agregar al carrito · Bs. ${(finalPrice * quantity).toFixed(2)}` : 'Selecciona una talla'}</button><div className="mt-7 divide-y divide-black/10 border-y border-black/10 text-xs"><InfoLine text="Envíos a todo Bolivia" /><InfoLine text="Pago contra entrega disponible" /><Link to="/returns" className="flex py-4 uppercase tracking-[0.12em]">Cambios y devoluciones</Link></div></aside></div></div>{recommended.length > 0 && <section className="pass-container border-t border-black/10 py-16 sm:py-24"><div className="mb-8 flex items-end justify-between"><div><p className="pass-kicker">Según tu estilo</p><h2 className="pass-heading mt-2 text-3xl sm:text-5xl">Más de {product.category}</h2></div></div><div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">{recommended.map((item, index) => <ProductCard key={item.id} product={item} index={index} />)}</div></section>}<div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden"><button type="button" onClick={add} disabled={!selectedVariant} className="h-14 w-full bg-black text-[10px] font-bold uppercase tracking-[0.18em] text-white disabled:bg-black/25">{selectedVariant ? `Agregar · Bs. ${(finalPrice * quantity).toFixed(2)}` : 'Selecciona una talla'}</button></div><SizeGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} category={product.category} /></main>;
}

function Meta({ label, value }: { label: string; value: string }) { return <div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-black/40">{label}</p><p className="mt-1 text-xs font-medium">{value}</p></div>; }
function InfoLine({ text }: { text: string }) { return <p className="py-4 uppercase tracking-[0.12em]">{text}</p>; }
