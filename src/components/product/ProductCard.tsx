import { memo, useMemo, useState } from 'react';
import { Check, Heart, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ProductVariant, ProductWithVariants } from '../../types';
import { useBranchStore } from '../../store/branchStore';
import { useCartStore } from '../../store/cartStore';
import { useDiscountStore } from '../../store/discountStore';
import { useFavoriteStore } from '../../store/favoriteStore';
import LazyImage from '../common/LazyImage';

interface ProductCardProps { product: ProductWithVariants; index?: number }

const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [addedSize, setAddedSize] = useState<string | null>(null);
  const selectedBranch = useBranchStore((state) => state.selectedBranch);
  const { addItem, openCart } = useCartStore();
  const discount = useDiscountStore((state) => state.activeDiscountsMap.get(product.id));
  const { isFavorite, toggleFavorite } = useFavoriteStore();

  const sizes = useMemo(() => (product.variants || []).map((variant) => {
    const stock = (variant.stock || []).reduce((sum, item) => selectedBranch && item.branch_id !== selectedBranch ? sum : sum + item.quantity, 0);
    return { variant, stock };
  }), [product.variants, selectedBranch]);
  const soldOut = sizes.every(({ stock }) => stock <= 0);
  const secondaryImage = product.images?.find((image) => image && image !== product.image_url);
  const isNew = Date.now() - new Date(product.created_at).getTime() < 1000 * 60 * 60 * 24 * 45;

  const quickAdd = (variant: ProductVariant, stock: number) => {
    if (!stock) return;
    addItem({ product, variant, quantity: 1, availableStock: stock });
    setAddedSize(variant.size);
    window.setTimeout(() => { setAddedSize(null); setQuickAddOpen(false); openCart(); }, 350);
  };

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f2f2f2]">
        <Link to={`/product/${product.id}`} className="block h-full" aria-label={product.name}>
          <LazyImage src={product.image_url} alt={product.name} className={`h-full w-full object-cover transition duration-500 ${secondaryImage ? 'group-hover:opacity-0' : 'group-hover:scale-[1.02]'}`} />
          {secondaryImage && <img src={secondaryImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100" />}
        </Link>
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1.5 sm:left-3 sm:top-3">{soldOut ? <Badge>SOLD OUT</Badge> : isNew ? <Badge>NEW</Badge> : null}{discount && <Badge>-{discount.percentage}%</Badge>}</div>
        <button type="button" onClick={() => toggleFavorite(product.id)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center bg-white/90 sm:right-3 sm:top-3" aria-label={isFavorite(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}><Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-black' : ''}`} /></button>
        {!soldOut && <button type="button" onClick={() => setQuickAddOpen((value) => !value)} className="absolute bottom-0 left-0 right-0 flex h-11 items-center justify-center gap-2 bg-black text-[9px] font-bold uppercase tracking-[0.17em] text-white transition md:translate-y-full md:group-hover:translate-y-0"><Plus className="h-3.5 w-3.5" /> Quick add</button>}
        {quickAddOpen && !soldOut && <div className="absolute inset-x-0 bottom-0 z-10 bg-white p-3 shadow-[0_-8px_30px_rgba(0,0,0,.12)]"><div className="mb-2 flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[0.18em]">Elige talla</span><button type="button" onClick={() => setQuickAddOpen(false)} className="text-lg leading-none" aria-label="Cerrar">×</button></div><div className="grid grid-cols-4 gap-1.5">{sizes.map(({ variant, stock }) => <button key={variant.id} type="button" disabled={!stock} onClick={() => quickAdd(variant, stock)} className="h-9 border border-black text-[10px] font-bold disabled:border-black/15 disabled:text-black/25">{addedSize === variant.size ? <Check className="mx-auto h-4 w-4" /> : variant.size}</button>)}</div></div>}
      </div>
      <div className="pt-3">
        <Link to={`/product/${product.id}`} className="block"><h3 className="truncate text-xs font-semibold uppercase tracking-[0.04em] sm:text-sm">{product.name}</h3></Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs"><span className={discount ? 'text-black/35 line-through' : 'font-medium'}>Bs. {product.price.toFixed(2)}</span>{discount && <span className="font-semibold text-red-600">Bs. {(product.price * (1 - discount.percentage / 100)).toFixed(2)}</span>}</div>
      </div>
    </article>
  );
});

function Badge({ children }: { children: React.ReactNode }) { return <span className="bg-white px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-black">{children}</span>; }

export default ProductCard;
