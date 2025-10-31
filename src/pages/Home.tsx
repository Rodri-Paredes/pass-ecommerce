import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Sparkles, Instagram, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[75svh] md:h-[85vh] bg-gray-900 overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />

        <div className="relative h-full flex items-center justify-center text-center text-white px-4">
          <div className="max-w-3xl">
            <motion.h1
              {...fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight"
            >
              PASS CLOTHING
            </motion.h1>
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-sm sm:text-base md:text-lg mb-8 text-gray-200 font-light tracking-wide"
            >
              Ropa urbana que define tu estilo
            </motion.p>
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Link
                to="/drops"
                className="inline-flex items-center gap-2 bg-white text-black px-6 sm:px-8 py-3 sm:py-4 font-medium tracking-wide hover:bg-gray-100 transition-all rounded-full"
              >
                VER ÚLTIMO DROP
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categories Grid */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="py-16 sm:py-20 md:py-28 lg:py-32"
        >
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <span className="text-xs sm:text-sm tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gray-400 mb-4 sm:mb-6 block font-medium">Explora por Categoría</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">Encuentra tu <span className="font-bold">estilo</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
            <Link
              to="/shop?category=Hoodies"
              className="relative aspect-[4/3] overflow-hidden group shadow-xl hover:shadow-2xl transition-shadow duration-500"
            >
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                src="https://jbdiidhseumjqdfxyzop.supabase.co/storage/v1/object/public/products/1760802011775-Photoroom_20251018_110704.jpeg"
                alt="Hoodies"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end p-6 sm:p-8 md:p-10">
                <div>
                  <h3 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-2 sm:mb-3">HOODIES</h3>
                  <p className="text-gray-200 text-sm sm:text-base tracking-wider">Comodidad y estilo urbano</p>
                </div>
              </div>
            </Link>

            <Link
              to="/shop?category=Poleras"
              className="relative aspect-[4/3] overflow-hidden group shadow-xl hover:shadow-2xl transition-shadow duration-500"
            >
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                src="https://jbdiidhseumjqdfxyzop.supabase.co/storage/v1/object/public/products/1754948116239-Photoroom_20250417_140556.jpeg"
                alt="Poleras"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end p-6 sm:p-8 md:p-10">
                <div>
                  <h3 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-2 sm:mb-3">POLERAS</h3>
                  <p className="text-gray-200 text-sm sm:text-base tracking-wider">Esenciales versátiles</p>
                </div>
              </div>
            </Link>
          </div>
        </motion.section>

        {/* About Section - Quiénes Somos */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8 }}
          className="py-16 sm:py-20 md:py-28 lg:py-32"
        >
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-xs sm:text-sm tracking-[0.25em] sm:tracking-[0.3em] uppercase text-gray-400 mb-4 sm:mb-6 block font-medium">Nuestra Historia</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6 sm:mb-8 leading-tight">
                Diseñamos el <span className="font-bold">futuro</span> del streetwear boliviano
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mb-5 sm:mb-6">
                PASS nació de la pasión por la moda urbana y el deseo de crear prendas que 
                representen la identidad de nuestra generación.
              </p>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mb-8 sm:mb-10">
                Creemos que la ropa es más que tela: es una forma de expresión y una actitud.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-sm sm:text-base tracking-[0.15em] sm:tracking-[0.2em] uppercase hover:gap-4 transition-all group font-medium"
              >
                Conoce nuestra colección
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative mt-10 md:mt-0"
            >
              <div className="aspect-[3/4] bg-gray-100 overflow-hidden shadow-2xl">
                <img
                  src="https://jbdiidhseumjqdfxyzop.supabase.co/storage/v1/object/public/products/home.jpeg"
                  alt="Pass Clothing"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 bg-black text-white p-6 sm:p-8 md:p-10 max-w-[220px] sm:max-w-sm shadow-2xl">
                <p className="text-sm sm:text-base tracking-wide leading-relaxed font-light italic">
                  "Cada prenda cuenta una historia, cada diseño rompe esquemas"
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="py-16 sm:py-20 md:py-24 border-y border-gray-200"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-14 md:gap-16">
            <motion.div variants={fadeInUp} className="text-center px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-black text-white mb-6 sm:mb-8 rounded-sm shadow-lg">
                <Truck className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold tracking-wide mb-3 sm:mb-4">Envíos a Todo Bolivia</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xs mx-auto">
                Llegamos a todo el país con envíos rápidos y seguros.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="text-center px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-black text-white mb-6 sm:mb-8 rounded-sm shadow-lg">
                <Shield className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold tracking-wide mb-3 sm:mb-4">Calidad Garantizada</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xs mx-auto">
                Materiales premium y acabados impecables.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="text-center px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-black text-white mb-6 sm:mb-8 rounded-sm shadow-lg">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold tracking-wide mb-3 sm:mb-4">Drops Exclusivos</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xs mx-auto">
                Colecciones limitadas que solo podrás encontrar aquí.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Community Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8 }}
          className="py-16 sm:py-20 md:py-24 lg:py-28"
        >
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            {/* Background - Pure black */}
            <div className="absolute inset-0 bg-black" />
            
            {/* Subtle decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
            
            {/* Content */}
            <div className="relative text-white p-10 sm:p-14 md:p-20 lg:p-24 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto"
              >
                {/* Icon with animated background */}
                <div className="relative inline-flex items-center justify-center mb-8 sm:mb-10">
                  <div className="absolute inset-0 bg-white/5 rounded-full blur-xl animate-pulse" />
                  <div className="relative bg-white/5 backdrop-blur-sm p-6 sm:p-7 md:p-8 rounded-full border border-white/10">
                    <Instagram className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-5 sm:mb-6 leading-tight">
                  Únete a la <span className="font-bold">comunidad</span>
                </h2>
                
                {/* Hashtag */}
                <p className="text-sm sm:text-base md:text-lg tracking-[0.3em] uppercase text-gray-500 mb-10 sm:mb-12 md:mb-14">
                  #PassClothing
                </p>
                
                {/* Description */}
                <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-12 sm:mb-14 md:mb-16 max-w-2xl mx-auto leading-relaxed font-light">
                  Forma parte del movimiento streetwear boliviano. Comparte tu estilo y conecta con la comunidad.
                </p>
                
                {/* CTA Button */}
                <a
                  href="https://www.instagram.com/pass________________________?igsh=ZmpxaGs5cnFteGFz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 sm:gap-4 bg-white text-black px-10 sm:px-12 md:px-14 py-5 sm:py-6 font-semibold tracking-wide hover:bg-gray-100 transition-all text-base sm:text-lg md:text-xl rounded-full shadow-2xl hover:shadow-white/20 hover:scale-105"
                >
                  <Instagram className="w-6 h-6 sm:w-7 sm:h-7 group-hover:rotate-12 transition-transform" />
                  <span>Seguir en Instagram</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Location Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8 }}
          className="py-12 sm:py-16 md:py-20 mb-12 sm:mb-16 md:mb-20"
        >
{/*           <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div>
              <span className="text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase text-gray-500 mb-3 sm:mb-4 block">Visítanos</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-4 sm:mb-6">
                Encuentra nuestras <span className="font-bold">tiendas</span>
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex gap-3 sm:gap-4">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-gray-600" />
                  <div>
                    <h4 className="font-medium mb-1 text-sm sm:text-base">La Paz</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Zona Sur, Av. Principal</p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-gray-600" />
                  <div>
                    <h4 className="font-medium mb-1 text-sm sm:text-base">Cochabamba</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Centro Comercial, 2do Piso</p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-gray-600" />
                  <div>
                    <h4 className="font-medium mb-1 text-sm sm:text-base">Santa Cruz</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Equipetrol, Local 45</p>
                  </div>
                </div>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 mt-6 sm:mt-8 text-xs sm:text-sm tracking-[0.2em] uppercase hover:gap-4 transition-all"
              >
                Ver todas las ubicaciones
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>
            <div className="aspect-square bg-gray-100 overflow-hidden order-first md:order-last">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070"
                alt="Tienda Pass"
                loading="lazy"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div> */}
        </motion.section>
      </div>
    </div>
  );
}
