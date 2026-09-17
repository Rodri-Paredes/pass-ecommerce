import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  const close = () => { setOpen(false); setQuery(''); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    navigate(`/shop?search=${encodeURIComponent(value)}`);
    close();
  };

  return <><button type="button" onClick={() => setOpen(true)} className="p-2" aria-label="Buscar"><Search className="h-[19px] w-[19px] stroke-[1.6]" /></button>{open && <div className="fixed inset-0 z-[80] bg-white" role="dialog" aria-modal="true" aria-label="Buscar productos"><div className="pass-container flex h-16 items-center justify-between border-b border-black/10 lg:h-[72px]"><span className="text-xl font-black tracking-[-0.06em]">PASS</span><button type="button" onClick={close} className="p-2" aria-label="Cerrar búsqueda"><X className="h-6 w-6" /></button></div><form onSubmit={submit} className="mx-auto flex max-w-5xl items-center border-b border-black px-4 pb-3 pt-[12vh] sm:px-8"><Search className="mr-3 h-6 w-6 shrink-0 stroke-[1.5]" /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="¿Qué estás buscando?" className="min-w-0 flex-1 border-0 bg-transparent py-3 text-2xl font-semibold tracking-tight outline-none placeholder:text-black/25 sm:text-4xl" /><button type="submit" className="ml-3 hidden bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white sm:block">Buscar</button></form><p className="mx-auto mt-5 max-w-5xl px-4 text-[10px] uppercase tracking-[0.2em] text-black/40 sm:px-8">Busca por nombre o colección</p></div>}</>;
}
