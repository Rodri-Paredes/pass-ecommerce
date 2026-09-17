import { useMemo } from 'react';
import { Ruler } from 'lucide-react';
import { useBranchStore } from '../../store/branchStore';
import type { Branch, ProductVariant, Stock } from '../../types';

interface Props { variants: (ProductVariant & { stock?: (Stock & { branch?: Branch })[] })[]; selectedSize: string | null; onSizeSelect: (variant: ProductVariant, totalStock: number) => void; productCategory?: string; onShowSizeGuide?: () => void }
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40'];

export default function SizeSelector({ variants, selectedSize, onSizeSelect, productCategory, onShowSizeGuide }: Props) {
  const selectedBranch = useBranchStore((state) => state.selectedBranch);
  const sizes = useMemo(() => variants.map((variant) => ({ variant, size: variant.size.trim().toUpperCase(), stock: (variant.stock || []).reduce((sum, item) => selectedBranch && item.branch_id !== selectedBranch ? sum : sum + item.quantity, 0) })).sort((a, b) => { const ai = SIZE_ORDER.indexOf(a.size); const bi = SIZE_ORDER.indexOf(b.size); return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi) || a.size.localeCompare(b.size); }), [variants, selectedBranch]);
  const selected = sizes.find((item) => item.size === selectedSize?.trim().toUpperCase());
  return <div><div className="mb-3 flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.18em]">Selecciona talla</p>{onShowSizeGuide && productCategory === 'Pantalones' && <button type="button" onClick={onShowSizeGuide} className="flex items-center gap-1 text-[10px] uppercase tracking-wider underline"><Ruler className="h-3.5 w-3.5" /> Guía</button>}</div><div className="grid grid-cols-4 gap-2 sm:grid-cols-5">{sizes.map(({ variant, size, stock }) => <button key={variant.id} type="button" disabled={!stock} onClick={() => onSizeSelect(variant, stock)} className={`relative h-12 border text-xs font-bold transition ${selectedSize?.trim().toUpperCase() === size ? 'border-black bg-black text-white' : stock ? 'border-black/25 hover:border-black' : 'cursor-not-allowed border-black/10 text-black/25 after:absolute after:left-2 after:right-2 after:top-1/2 after:h-px after:-rotate-12 after:bg-black/20'}`}>{size}</button>)}</div>{!sizes.length && <p className="text-sm text-red-600">No hay tallas disponibles.</p>}{selected && <p className="mt-3 text-xs text-black/50">{selected.stock} {selected.stock === 1 ? 'unidad disponible' : 'unidades disponibles'} en esta selección de sucursal.</p>}</div>;
}
