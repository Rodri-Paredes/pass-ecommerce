import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

export default function PassCrewExperience({ onNavigate }: { onNavigate?: () => void }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-[#050505] text-[#f2f0e8]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-[18%] h-64 w-[26rem] rotate-[-9deg] border border-white/15 sm:right-[6%] sm:h-72 sm:w-[34rem]"
      >
        <div className="absolute inset-3 border border-white/[.07]" />
        <span className="absolute bottom-5 left-6 text-[10px] font-semibold tracking-[.32em] text-white/20">
          MEMBER ACCESS / LOCKED
        </span>
      </div>

      <motion.main
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[1600px] flex-col px-4 pb-5 pt-6 sm:px-8 sm:pb-8 sm:pt-8 lg:px-12"
      >
        <header className="flex items-center justify-between border-b border-white/15 pb-4 text-[10px] font-semibold tracking-[.24em] text-white/55 sm:text-xs">
          <span>PASS CREW</span>
          <span className="flex items-center gap-2 tracking-[.16em] text-[#c9a961]">
            <span className="h-2 w-2 bg-[#c9a961]" />
            ACCESO CERRADO
          </span>
        </header>

        <div className="grid flex-1 content-center gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end lg:gap-16 lg:py-16">
          <section>
            <p className="mb-5 max-w-sm text-xs leading-5 text-white/45 sm:mb-8 sm:text-sm">
              Algo nuevo se está armando dentro de PASS.
            </p>
            <h1 className="max-w-6xl text-[clamp(4.25rem,14vw,12.5rem)] font-black uppercase leading-[.73] tracking-[-.09em]">
              Próxi<br />mamente.
            </h1>
          </section>

          <aside className="relative border-l border-[#8d7443] pl-5 sm:max-w-md sm:pl-7 lg:mb-3">
            <div className="absolute -left-px top-0 h-10 w-px bg-[#c9a961]" />
            <p className="text-lg font-semibold leading-6 tracking-[-.025em] text-white/90 sm:text-xl">
              Estamos preparando el acceso para quienes quieren ir un paso adelante.
            </p>
            <p className="mt-4 text-sm leading-6 text-white/45">
              Aún no abrimos. Cuando esté listo, lo vas a saber.
            </p>
            <Link
              to="/shop"
              onClick={onNavigate}
              className="mt-8 inline-flex min-h-12 items-center border border-[#8d7443] px-5 text-[10px] font-bold tracking-[.18em] text-[#e1d2ad] transition-colors hover:border-[#c9a961] hover:bg-[#c9a961] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c9a961]"
            >
              VOLVER A LA TIENDA
            </Link>
          </aside>
        </div>

        <footer className="grid gap-3 border-t border-white/15 pt-4 text-[9px] font-semibold tracking-[.2em] text-white/35 sm:grid-cols-[1fr_auto] sm:text-[10px]">
          <p>EARLY ACCESS&nbsp;&nbsp; / &nbsp;&nbsp;PRIVATE DROPS&nbsp;&nbsp; / &nbsp;&nbsp;CREW ONLY</p>
          <p className="text-[#c9a961]">NO DISPONIBLE TODAVÍA</p>
        </footer>
      </motion.main>
    </div>
  );
}
