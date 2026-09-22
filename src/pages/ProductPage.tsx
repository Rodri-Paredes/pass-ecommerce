import { useEffect, useMemo, useState } from 'react';
import { Crown, Heart, Loader2, Minus, Plus } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import ProductGallery from '../components/product/ProductGallery';
import SizeGuideModal from '../components/product/SizeGuideModal';
import SizeSelector from '../components/product/SizeSelector';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { useDiscountStore } from '../store/discountStore';
import { useFavoriteStore } from '../store/favoriteStore';
import type { ProductVariant, ProductWithVariants } from '../types';
import { useCustomerAuthStore } from '../store/customerAuthStore';
import { passCrewService } from '../services/passCrewService';
import type { CrewSaleQuote } from '../types';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductWithVariants | null>(null);
  const [recommended, setRecommended] = useState<ProductWithVariants[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [stock, setStock] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [crewQuote, setCrewQuote] = useState<CrewSaleQuote | null>(null);
  const { addItem, openCart } = useCartStore();
  const discount = useDiscountStore((state) => id ? state.activeDiscountsMap.get(id) : undefined);
  const loadDiscounts = useDiscountStore((state) => state.loadActiveDiscountsMap);
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const customer = useCustomerAuthStore((state) => state.customer);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;
    setLoading(true);
    loadDiscounts();
    supabase.from('products').select('*, variants:product_variants(*, stock(*, branch:branches(*))), drop:drops(*)').eq('id', id).single().then(async ({ data }) => {
      setProduct(data);
      setLoading(false);
      if (data) {
        const { data: related } = await supabase.from('products').select('*, variants:product_variants(*, stock(*, branch:branches(*))), drop:drops(*)').eq('category', data.category).neq('id', data.id).limit(4);
        setRecommended(related || []);
      }
    });
  }, [id, loadDiscounts]);

  const images = useMemo(() => product ? [product.image_url, ...(product.images || [])] : [], [product]);
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
  return <main><div className="pass-container py-5 sm:py-10"><div className="mb-5 text-[10px] uppercase tracking-[0.14em] text-black/45"><Link to="/shop">Shop</Link> / <span>{product.category}</span></div><div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,.65fr)] lg:gap-10"><ProductGallery images={images} name={product.name} /><aside className="lg:sticky lg:top-32 lg:h-fit"><div className="flex items-start justify-between gap-4"><div>{product.drop && <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">{product.drop.name}</p>}<h1 className="text-3xl font-black uppercase leading-[.95] tracking-[-0.045em] sm:text-4xl">{product.name}</h1></div><button type="button" onClick={() => toggleFavorite(product.id)} className="shrink-0 p-2" aria-label="Favorito"><Heart className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-black' : ''}`} /></button></div><div className="mt-5 flex items-center gap-3 text-lg">{discount && <span className="text-black/35 line-through">Bs. {product.price.toFixed(2)}</span>}<span className="font-bold">Bs. {finalPrice.toFixed(2)}</span>{discount && <span className="bg-black px-2 py-1 text-[9px] font-bold text-white">-{discount.percentage}%</span>}</div>{crewQuote && <div className="mt-4 flex items-center gap-2 border border-[#c9a961]/40 bg-[#c9a961]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#765a28]"><Crown className="h-3.5 w-3.5"/> PASS Crew benefit disponible</div>}{product.description && <p className="mt-6 text-sm leading-6 text-black/65">{product.description}</p>}{hasMetadata && <div className="mt-7 grid grid-cols-3 border-y border-black/10 py-4">{product.color && <Meta label="Color" value={product.color} />}{product.fit && <Meta label="Fit" value={product.fit} />}{product.product_style && <Meta label="Estilo" value={product.product_style} />}</div>}<div className="mt-7"><SizeSelector variants={product.variants || []} selectedSize={selectedVariant?.size || null} onSizeSelect={selectSize} productCategory={product.category} onShowSizeGuide={() => setGuideOpen(true)} /></div>{selectedVariant && <div className="mt-6 flex items-center justify-between border-y border-black/10 py-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em]">Cantidad</span><div className="flex items-center"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-9 w-9 place-items-center border border-black/15"><Minus className="h-3.5 w-3.5" /></button><span className="grid h-9 w-10 place-items-center text-xs font-bold">{quantity}</span><button type="button" onClick={() => setQuantity(Math.min(stock, quantity + 1))} disabled={quantity >= stock} className="grid h-9 w-9 place-items-center border border-black/15 disabled:opacity-25"><Plus className="h-3.5 w-3.5" /></button></div></div>}<button type="button" onClick={add} disabled={!selectedVariant} className="mt-6 h-14 w-full bg-black text-[11px] font-bold uppercase tracking-[0.2em] text-white disabled:bg-black/20">{selectedVariant ? `Agregar al carrito · Bs. ${(finalPrice * quantity).toFixed(2)}` : 'Selecciona una talla'}</button><div className="mt-7 divide-y divide-black/10 border-y border-black/10 text-xs"><InfoLine text="Envíos a todo Bolivia" /><InfoLine text="Pago contra entrega disponible" /><Link to="/returns" className="flex py-4 uppercase tracking-[0.12em]">Cambios y devoluciones</Link></div></aside></div></div>{recommended.length > 0 && <section className="pass-container border-t border-black/10 py-16 sm:py-24"><div className="mb-8 flex items-end justify-between"><div><p className="pass-kicker">También te puede gustar</p><h2 className="pass-heading mt-2 text-3xl sm:text-5xl">Más de {product.category}</h2></div></div><div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">{recommended.map((item, index) => <ProductCard key={item.id} product={item} index={index} />)}</div></section>}<div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white p-3 lg:hidden"><button type="button" onClick={add} disabled={!selectedVariant} className="h-14 w-full bg-black text-[10px] font-bold uppercase tracking-[0.18em] text-white disabled:bg-black/25">{selectedVariant ? `Agregar · Bs. ${(finalPrice * quantity).toFixed(2)}` : 'Selecciona una talla'}</button></div><SizeGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} category={product.category} /></main>;
}

function Meta({ label, value }: { label: string; value: string }) { return <div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-black/40">{label}</p><p className="mt-1 text-xs font-medium">{value}</p></div>; }
function InfoLine({ text }: { text: string }) { return <p className="py-4 uppercase tracking-[0.12em]">{text}</p>; }
