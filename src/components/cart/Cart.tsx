import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { optimizeImageUrl } from '../../lib/imageOptimizer';
import { supabase } from '../../lib/supabase';
import { useBranchStore } from '../../store/branchStore';
import { useCartStore } from '../../store/cartStore';
import { useDiscountStore } from '../../store/discountStore';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { passCrewService } from '../../services/passCrewService';
import { CITIES, type Branch, type CrewSaleQuote } from '../../types';

const WHATSAPP_BY_BRANCH: Record<string, { name: string; number: string; location: string }[]> = {
  cochabamba: [{ name: 'Asesor Comercial Cochabamba', number: '59174563943', location: 'Sucursal Cochabamba' }],
  tarija: [{ name: 'Asesor Comercial Tarija 1', number: '59157908595', location: 'Sucursal Tarija' }, { name: 'Asesor Comercial Tarija 2', number: '59175131474', location: 'Sucursal Tarija' }],
};
const BRANCH_TO_CITY: Record<string, string> = { cochabamba: 'Cochabamba', tarija: 'Tarija' };

export default function Cart() {
  const { items, selectedCity, selectedStore, comments, isOpen, closeCart, removeItem, updateQuantity, setCity, setSelectedStore, setComments, clearCart } = useCartStore();
  const selectedBranch = useBranchStore((state) => state.selectedBranch);
  const { activeDiscountsMap, loadActiveDiscountsMap } = useDiscountStore();
  const customer = useCustomerAuthStore((state) => state.customer);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stores, setStores] = useState<{ name: string; number: string; location: string }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [crewQuote, setCrewQuote] = useState<CrewSaleQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const catalogTotal = items.reduce((sum, item) => { const discount = activeDiscountsMap.get(item.product.id); const price = discount ? item.product.price * (1 - discount.percentage / 100) : item.product.price; return sum + price * item.quantity; }, 0);
  const quoteItems = useMemo(() => items.map(item => { const discount = activeDiscountsMap.get(item.product.id); return { variantId: item.variant.id, quantity: item.quantity, unitPrice: item.product.price * (discount ? 1 - discount.percentage / 100 : 1) }; }), [items, activeDiscountsMap]);
  const total = crewQuote?.total ?? catalogTotal;
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => { supabase.from('branches').select('id, name, address, created_at').then(({ data }) => setBranches(data || [])); loadActiveDiscountsMap(); }, [loadActiveDiscountsMap]);
  useEffect(() => {
    if (selectedBranch && branches.length) {
      const branch = branches.find((item) => item.id === selectedBranch);
      if (!branch) return;
      const key = branch.name.replace(/^Sucursal\s+/i, '').trim().toLowerCase();
      const available = WHATSAPP_BY_BRANCH[key] || [];
      setStores(available);
      if (available.length && !selectedStore) setSelectedStore(available[0].number);
      if (BRANCH_TO_CITY[key] && !selectedCity) setCity(BRANCH_TO_CITY[key]);
    } else {
      const available = Object.values(WHATSAPP_BY_BRANCH).flat();
      setStores(available);
      if (available.length && !selectedStore) setSelectedStore(available[0].number);
    }
  }, [selectedBranch, branches, selectedStore, selectedCity, setSelectedStore, setCity]);
  useEffect(() => { if (!isOpen) return; const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; }; }, [isOpen]);
  useEffect(() => {
    let cancelled = false;
    if (!customer || !items.length) { setCrewQuote(null); setQuoteLoading(false); return; }
    setQuoteLoading(true);
    const timer = window.setTimeout(() => {
      passCrewService.quoteCart(customer.id, quoteItems).then(value => { if (!cancelled) setCrewQuote(value); }).catch(() => { if (!cancelled) setCrewQuote(null); }).finally(() => { if (!cancelled) setQuoteLoading(false); });
    }, 180);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [customer, items.length, quoteItems]);

  const orderCode = () => Array.from({ length: 8 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');
  const message = (code: string) => {
    const url = `${window.location.origin}/pedido/${code}`;
    let text = `¡Hola! 👋 Quiero realizar el siguiente pedido:\n\n*RESUMEN DEL PEDIDO:*\n📦 ${count} producto${count > 1 ? 's' : ''} - Total: Bs. ${total.toFixed(2)}\n📍 Ciudad de entrega: ${selectedCity}`;
    if (crewQuote?.source === 'crew') text += `\n👑 PASS Crew: ${crewQuote.benefit_snapshot?.name || 'beneficio validado'} (- Bs. ${crewQuote.savings.toFixed(2)})`;
    text += `\n\n🔗 *Ver pedido completo con imágenes:*\n${url}\n\nCódigo de pedido: *${code}*`;
    if (comments.trim()) text += `\n\n💬 *Comentarios:*\n${comments}`;
    return `${text}\n\n¿Podrían confirmarme la disponibilidad y opciones de pago? ¡Gracias! 🙌`;
  };
  const checkout = async () => {
    if (!selectedCity) { alert('Por favor selecciona una ciudad de entrega'); return; }
    if (!items.length || !selectedStore) return;
    setProcessing(true);
    try {
      const code = orderCode();
      void supabase.from('shared_orders').insert({ order_code: code, items, total, selected_city: selectedCity, selected_store: selectedStore, comments }).then(({ error }) => { if (error) console.warn('No se pudo guardar en BD:', error.message); });
      window.open(`https://wa.me/${selectedStore}?text=${encodeURIComponent(message(code))}`, '_blank');
      clearCart(); closeCart();
    } catch (error) { console.error('Error en checkout:', error); alert('Error al procesar el pedido. Por favor intenta nuevamente.'); } finally { setProcessing(false); }
  };

  return <AnimatePresence>{isOpen && <><motion.button aria-label="Cerrar carrito" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeCart} className="fixed inset-0 z-50 cursor-default bg-black/55" /><motion.aside role="dialog" aria-modal="true" aria-label="Carrito" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: .28, ease: [0.22, 1, .36, 1] }} className="fixed bottom-0 right-0 top-0 z-[60] flex w-full flex-col bg-white sm:w-[460px]"><header className="flex h-16 shrink-0 items-center justify-between border-b border-black/10 px-4 sm:px-6"><div><h2 className="text-sm font-black uppercase tracking-[0.14em]">Tu carrito</h2><p className="mt-0.5 text-[9px] uppercase tracking-wider text-black/45">{count} {count === 1 ? 'producto' : 'productos'}</p></div><button type="button" onClick={closeCart} className="p-2" aria-label="Cerrar"><X className="h-5 w-5" /></button></header>{!items.length ? <div className="flex flex-1 flex-col items-center justify-center px-6 text-center"><ShoppingBag className="h-9 w-9 stroke-[1.2]" /><p className="mt-6 text-2xl font-black uppercase tracking-[-0.035em]">Tu carrito está vacío</p><button type="button" onClick={closeCart} className="mt-7 bg-black px-9 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white">Ver productos</button></div> : <><div className="flex-1 overflow-y-auto px-4 sm:px-6">{items.map((item) => { const discount = activeDiscountsMap.get(item.product.id); const price = item.product.price * (discount ? 1 - discount.percentage / 100 : 1); return <div key={item.variant.id} className="grid grid-cols-[84px_1fr] gap-4 border-b border-black/10 py-5"><Link to={`/product/${item.product.id}`} onClick={closeCart} className="aspect-[3/4] overflow-hidden bg-neutral-100"><img src={optimizeImageUrl(item.product.image_url, { width: 220, quality: 75 })} alt={item.product.name} className="h-full w-full object-cover" /></Link><div className="flex min-w-0 flex-col"><div className="flex justify-between gap-2"><div><p className="truncate text-xs font-bold uppercase">{item.product.name}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-black/45">Talla {item.variant.size}</p></div><button type="button" onClick={() => removeItem(item.variant.id)} className="self-start p-1 text-black/40 hover:text-black" aria-label="Eliminar"><Trash2 className="h-4 w-4" /></button></div><p className="mt-2 text-xs font-semibold">Bs. {(price * item.quantity).toFixed(2)}</p><div className="mt-auto flex items-center"><button type="button" onClick={() => updateQuantity(item.variant.id, Math.max(1, item.quantity - 1))} className="grid h-8 w-8 place-items-center border border-black/15"><Minus className="h-3 w-3" /></button><span className="grid h-8 w-9 place-items-center text-xs font-bold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.variant.id, Math.min(item.availableStock, item.quantity + 1))} disabled={item.quantity >= item.availableStock} className="grid h-8 w-8 place-items-center border border-black/15 disabled:opacity-25"><Plus className="h-3 w-3" /></button></div></div></div>; })}</div><div className="shrink-0 border-t border-black/10 bg-white px-4 pb-5 pt-4 sm:px-6">{crewQuote?.source === 'crew' && <div className="mb-3 flex items-center justify-between bg-black px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-champagne"><span>PASS Crew · {crewQuote.benefit_snapshot?.name || 'Beneficio'}</span><span>− Bs. {crewQuote.savings.toFixed(2)}</span></div>}<div className="mb-4 flex items-end justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.18em]">Total</span><span className="text-2xl font-black tracking-[-0.04em]">{quoteLoading ? 'Validando…' : `Bs. ${total.toFixed(2)}`}</span></div><div className="grid grid-cols-2 gap-2"><label><span className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-black/45">Atención</span><select value={selectedStore} onChange={(event) => setSelectedStore(event.target.value)} className="h-11 w-full border border-black/15 bg-white px-2 text-[10px] outline-none">{stores.map((store) => <option key={store.number} value={store.number}>{store.location}</option>)}</select></label><label><span className="mb-1.5 block text-[9px] font-bold uppercase tracking-wider text-black/45">Entrega</span><select value={selectedCity} onChange={(event) => setCity(event.target.value)} className="h-11 w-full border border-black/15 bg-white px-2 text-[10px] outline-none"><option value="">Ciudad</option>{CITIES.map((city) => <option key={city} value={city}>{city}</option>)}</select></label></div><textarea value={comments} onChange={(event) => setComments(event.target.value)} rows={2} placeholder="Comentarios del pedido (opcional)" className="mt-2 w-full resize-none border border-black/15 p-3 text-xs outline-none focus:border-black" /><button type="button" onClick={checkout} disabled={!selectedCity || !selectedStore || processing || quoteLoading} className="mt-3 h-14 w-full bg-black text-[10px] font-bold uppercase tracking-[0.2em] text-white disabled:bg-black/25">{processing ? 'Generando pedido...' : `Finalizar compra · Bs. ${total.toFixed(2)}`}</button><p className="mt-2 text-center text-[9px] text-black/45">Continuarás por WhatsApp para confirmar disponibilidad y pago.</p></div></>}</motion.aside></>}</AnimatePresence>;
}
