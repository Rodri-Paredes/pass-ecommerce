import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props { title: string; subtitle?: string; children: ReactNode; footer: ReactNode }
const IMAGE = 'https://nvkoustxdmrxhdrcozqz.supabase.co/storage/v1/object/public/products/home.jpeg';

export default function AuthLayout({ title, subtitle, children, footer }: Props) {
  return <main className="grid min-h-[calc(100svh-100px)] bg-white lg:grid-cols-2"><div className="relative hidden overflow-hidden bg-black lg:block"><img src={IMAGE} alt="PASS Clothing" className="absolute inset-0 h-full w-full object-cover opacity-75" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" /><p className="absolute bottom-12 left-12 max-w-lg text-6xl font-black uppercase leading-[.88] tracking-[-0.065em] text-white">Wear your own movement.</p></div><div className="flex items-center justify-center px-5 py-14 sm:px-10"><div className="w-full max-w-md"><Link to="/" className="mb-12 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-black/45"><ArrowLeft className="h-3.5 w-3.5" /> Volver</Link><p className="pass-kicker">PASS Account</p><h1 className="pass-heading mt-2 text-4xl sm:text-5xl">{title}</h1>{subtitle && <p className="mt-3 text-sm text-black/45">{subtitle}</p>}<div className="mt-9">{children}</div><div className="mt-8 border-t border-black/10 pt-6 text-sm text-black/50">{footer}</div></div></div></main>;
}
