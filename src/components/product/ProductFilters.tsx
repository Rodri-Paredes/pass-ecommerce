import { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { EMPTY_FILTERS, type FilterFacets, type ShopFilters } from './productFilterTypes';
interface Props { value: ShopFilters; facets: FilterFacets; sortBy: string; onChange: (filters: ShopFilters) => void; onSortChange: (sort: string) => void; mobileOpen: boolean; setMobileOpen: (open: boolean) => void }

export default function ProductFilters(props: Props) {
  const { mobileOpen, setMobileOpen } = props;
  const activeCount = [...props.value.sizes, ...props.value.colors, ...props.value.fits, ...props.value.styles].length + (props.value.availableOnly ? 1 : 0) + (props.value.price.min > 0 || props.value.price.max < 10000 ? 1 : 0);
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', closeOnEscape); };
  }, [mobileOpen, setMobileOpen]);
  return <><div className="hidden border-y border-black/10 lg:block"><div className="flex items-center gap-1 py-2"><FilterContent {...props} /><Sort value={props.sortBy} onChange={props.onSortChange} /></div></div><div className="sticky top-[94px] z-30 -mx-4 flex border-y border-black/10 bg-white/95 backdrop-blur sm:-mx-6 lg:hidden"><button type="button" onClick={() => setMobileOpen(true)} className="relative flex h-12 flex-1 items-center justify-center gap-2 border-r border-black/10 text-[10px] font-bold uppercase tracking-[0.18em]"><SlidersHorizontal className="h-4 w-4" /> Filtros{activeCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-black px-1 text-[9px] text-white">{activeCount}</span>}</button><div className="flex-1"><Sort value={props.sortBy} onChange={props.onSortChange} /></div></div>{mobileOpen && <div className="fixed inset-0 z-[75] flex items-end bg-black/50 lg:hidden"><button type="button" aria-label="Cerrar filtros" onClick={() => setMobileOpen(false)} className="absolute inset-0 cursor-default" /><section role="dialog" aria-modal="true" aria-label="Filtros de productos" className="relative flex max-h-[88dvh] w-full flex-col rounded-t-[28px] bg-white shadow-2xl"><div className="mx-auto mt-3 h-1 w-10 rounded-full bg-black/20" /><header className="flex items-center justify-between border-b border-black/10 px-5 py-4"><div><p className="text-sm font-black uppercase tracking-[-0.02em]">Filtrar productos</p>{activeCount > 0 && <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-black/45">{activeCount} {activeCount === 1 ? 'filtro activo' : 'filtros activos'}</p>}</div><button type="button" onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-black/[0.06]" aria-label="Cerrar"><X className="h-4 w-4" /></button></header><div className="min-h-0 flex-1 overflow-y-auto px-5"><FilterContent {...props} mobile /></div><div className="grid grid-cols-[.8fr_1.2fr] gap-2 border-t border-black/10 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"><button type="button" onClick={() => props.onChange(EMPTY_FILTERS)} disabled={!activeCount} className="h-12 border border-black/15 text-[10px] font-bold uppercase tracking-[0.15em] disabled:opacity-30">Limpiar</button><button type="button" onClick={() => setMobileOpen(false)} className="h-12 bg-black text-[10px] font-bold uppercase tracking-[0.15em] text-white">Ver productos</button></div></section></div>}</>;
}

function FilterContent({ value, facets, onChange, mobile = false }: Props & { mobile?: boolean }) {
  type SectionKey = 'sizes' | 'colors' | 'fits' | 'styles';
  type OpenSection = SectionKey | 'price' | null;
  const [openSection, setOpenSection] = useState<OpenSection>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const toggle = (key: 'sizes' | 'colors' | 'fits' | 'styles', option: string) => onChange({ ...value, [key]: value[key].includes(option) ? value[key].filter((item) => item !== option) : [...value[key], option] });
  const sections: { key: SectionKey; label: string; options: string[] }[] = [{ key: 'sizes', label: 'Talla', options: facets.sizes }, { key: 'colors', label: 'Color', options: facets.colors }, { key: 'fits', label: 'Fit', options: facets.fits }, { key: 'styles', label: 'Estilo', options: facets.styles }];

  useEffect(() => {
    if (mobile || !openSection) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!contentRef.current?.contains(event.target as Node)) setOpenSection(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenSection(null);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobile, openSection]);

  const toggleSection = (event: React.MouseEvent, section: OpenSection) => {
    if (mobile) return;
    event.preventDefault();
    setOpenSection((current) => current === section ? null : section);
  };

  return <div ref={contentRef} className={mobile ? 'divide-y divide-black/10' : 'flex items-center'}>{sections.filter((section) => section.options.length).map((section) => <details key={section.key} className={mobile ? 'py-1' : 'relative'} open={mobile || openSection === section.key}><summary onClick={(event) => toggleSection(event, section.key)} aria-expanded={mobile || openSection === section.key} className={`${mobile ? 'py-4' : 'cursor-pointer px-4 py-3'} list-none text-[10px] font-bold uppercase tracking-[0.16em]`}>{section.label}{value[section.key].length ? ` (${value[section.key].length})` : ''}</summary><div className={mobile ? 'flex flex-wrap gap-2 pb-4' : 'absolute left-0 top-full z-40 mt-2 max-h-[min(65vh,420px)] min-w-52 overflow-y-auto border border-black/10 bg-white p-4 shadow-xl'}>{section.options.map((option) => <label key={option} className={`${mobile ? '' : 'flex'} cursor-pointer items-center gap-2 whitespace-nowrap`}><input type="checkbox" checked={value[section.key].includes(option)} onChange={() => toggle(section.key, option)} className="peer sr-only" /><span className={`${mobile ? 'inline-flex border px-3 py-2' : 'py-1 text-xs'} border-black/15 peer-checked:bg-black peer-checked:text-white`}>{option}</span></label>)}</div></details>)}<details className={mobile ? 'py-1' : 'relative'} open={mobile || openSection === 'price'}><summary onClick={(event) => toggleSection(event, 'price')} aria-expanded={mobile || openSection === 'price'} className={`${mobile ? 'py-4' : 'cursor-pointer px-4 py-3'} list-none text-[10px] font-bold uppercase tracking-[0.16em]`}>Precio</summary><div className={mobile ? 'grid grid-cols-2 gap-3 pb-4' : 'absolute left-0 top-full z-40 mt-2 grid w-64 grid-cols-2 gap-3 border border-black/10 bg-white p-4 shadow-xl'}><PriceInput label="Mín." value={value.price.min} onChange={(min) => onChange({ ...value, price: { ...value.price, min } })} /><PriceInput label="Máx." value={value.price.max} onChange={(max) => onChange({ ...value, price: { ...value.price, max } })} /></div></details><label className={`${mobile ? 'flex py-5' : 'ml-2 flex px-3'} cursor-pointer items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em]`}><input type="checkbox" checked={value.availableOnly} onChange={(event) => onChange({ ...value, availableOnly: event.target.checked })} /> En stock</label></div>;
}

function PriceInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <label><span className="mb-1 block text-[9px] uppercase tracking-wider text-black/45">{label}</span><input type="number" min="0" value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} className="w-full border border-black/20 px-3 py-2 text-sm outline-none focus:border-black" /></label>; }
function Sort({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full cursor-pointer border-0 bg-white px-3 text-[10px] font-bold uppercase tracking-[0.14em] outline-none lg:ml-auto lg:w-auto"><option value="newest">Más recientes</option><option value="price-asc">Precio menor</option><option value="price-desc">Precio mayor</option></select>; }
