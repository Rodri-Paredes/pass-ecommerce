import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, Crown } from 'lucide-react';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { usePassCrewStore } from '../../store/passCrewStore';
import { CREW_MEMBERSHIP_LABELS, CREW_REQUEST_LABELS } from '../../lib/crewLabels';
import { fadeUp, staggerContainer } from '../../lib/motion';

export default function AccountPage() {
  const { customer, signOut } = useCustomerAuthStore();
  const { membership, activeRequest, isLoading, loadMyStatus } = usePassCrewStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (customer) {
      loadMyStatus(customer.id);
    }
  }, [customer, loadMyStatus]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen py-12 sm:py-20 bg-white">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto px-4 sm:px-6"
      >
        <motion.div variants={fadeUp}>
          <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-pass-black transition-colors mb-8">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio
          </Link>
        </motion.div>

        <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl font-black uppercase tracking-[-0.06em] text-black mb-10">
          Mi cuenta
        </motion.h1>

        <motion.div variants={fadeUp} className="border-y border-black/10 py-8 mb-8">
          <h2 className="text-xs tracking-[0.25em] uppercase text-gray-400 mb-4">Datos personales</h2>
          <div className="space-y-2 text-sm text-pass-black">
            <p><span className="font-medium">Nombre:</span> {customer?.full_name}</p>
            <p><span className="font-medium">Email:</span> {customer?.email}</p>
            {customer?.phone && <p><span className="font-medium">Teléfono:</span> {customer.phone}</p>}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="relative bg-black text-white p-8 mb-8 overflow-hidden">

          <div className="relative flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-champagne" />
            <h2 className="text-xs tracking-[0.3em] uppercase text-champagne">PASS CREW</h2>
          </div>

          {isLoading ? (
            <p className="relative text-sm text-white/40">Cargando...</p>
          ) : membership && membership.status === 'active' ? (
            <div className="relative space-y-2 text-sm">
              <p className="text-champagne font-medium">{CREW_MEMBERSHIP_LABELS[membership.status]}</p>
              <p className="text-white/70">Número de miembro: <span className="font-mono">{membership.member_number}</span></p>
              <p className="text-white/70">Vence: {new Date(membership.expires_at).toLocaleDateString('es-BO')}</p>
            </div>
          ) : activeRequest ? (
            <div className="relative space-y-3 text-sm">
              <p className="text-champagne font-medium">{CREW_REQUEST_LABELS[activeRequest.status]}</p>
              <Link to="/pass-crew/status" className="inline-block text-white/70 underline underline-offset-4 hover:text-white transition-colors">
                Ver estado de mi solicitud
              </Link>
            </div>
          ) : (
            <div className="relative space-y-4 text-sm">
              <p className="text-white/50">Aún no eres miembro PASS CREW.</p>
              <Link
                to="/pass-crew"
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-bold tracking-[0.15em] text-[10px] uppercase hover:bg-white/80 transition-colors"
              >
                <Crown className="w-3.5 h-3.5" />
                Conocer PASS CREW
              </Link>
            </div>
          )}
        </motion.div>

        <motion.button
          variants={fadeUp}
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-pass-black transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar sesión
        </motion.button>
      </motion.div>
    </div>
  );
}
