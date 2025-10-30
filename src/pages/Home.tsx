import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import DropsSection from '../components/drops/DropsSection';
import ProductGrid from '../components/product/ProductGrid';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[65svh] md:h-[80vh] bg-gray-900 overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center lg:bg-fixed"
          style={{
            backgroundImage:
              'url(https://firebasestorage.googleapis.com/v0/b/texnoexpert-a1b93.appspot.com/o/passweb%2Fpasscrisis2.jpg?alt=media&token=9d67a8b4-093f-43d5-a75a-1ad7cc4468b8)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

        <div className="relative h-full flex items-center justify-center text-center text-white px-4">
          <div className="max-w-3xl">
            <motion.h1
              {...fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
            >
              PASS CLOTHING
            </motion.h1>
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl mb-8 text-gray-200"
            >
              Ropa urbana que define tu estilo
            </motion.p>
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-white text-black px-6 sm:px-8 py-3 sm:py-4 font-medium tracking-wide rounded-full shadow-lg hover:shadow-xl hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 transition-all"
              >
                VER COLECCIÓN
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DropsSection />

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="py-16"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-3 tracking-tight">NUEVOS PRODUCTOS</h2>
            <p className="text-gray-600">Descubre nuestras últimas prendas</p>
          </div>
          <ProductGrid />
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="py-16 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8"
        >
          <Link
            to="/shop?category=Hoodies"
            className="relative aspect-[4/3] overflow-hidden group rounded-xl shadow-md hover:shadow-xl transition-shadow"
          >
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2787"
              alt="Hoodies"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-center justify-center">
              <h3 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide">
                HOODIES
              </h3>
            </div>
          </Link>

          <Link
            to="/shop?category=Poleras"
            className="relative aspect-[4/3] overflow-hidden group rounded-xl shadow-md hover:shadow-xl transition-shadow"
          >
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2072"
              alt="Poleras"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-center justify-center">
              <h3 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide">
                POLERAS
              </h3>
            </div>
          </Link>
        </motion.section>
      </div>
    </div>
  );
}
