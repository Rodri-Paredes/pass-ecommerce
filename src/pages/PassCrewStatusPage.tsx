import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown } from 'lucide-react';
import { usePassCrewStore } from '../store/passCrewStore';
import { useCustomerAuthStore } from '../store/customerAuthStore';
import { CREW_MEMBERSHIP_LABELS } from '../lib/crewLabels';
import RequestStatusBadge from '../components/pass-crew/RequestStatusBadge';
import { fadeUp, staggerContainer } from '../lib/motion';

export default function PassCrewStatusPage() {
  const { customer } = useCustomerAuthStore();
  const { membership, requests, isLoading, loadMyStatus } = usePassCrewStore();

  useEffect(() => {
    if (customer) {
      loadMyStatus(customer.id);
    }
  }, [customer, loadMyStatus]);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto px-4 sm:px-6"
      >
        <motion.div variants={fadeUp}>
          <Link to="/account" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-pass-black transition-colors mb-8">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a mi cuenta
          </Link>
        </motion.div>

        <motion.h1 variants={fadeUp} className="font-display text-3xl sm:text-4xl tracking-tight text-pass-black mb-8">
          Estado de PASS CREW
        </motion.h1>

        {membership && membership.status === 'active' && (
          <motion.div variants={fadeUp} className="relative bg-pass-black text-white rounded-2xl shadow-sm p-8 mb-6 overflow-hidden border border-champagne/20">
            <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-champagne/10 blur-[80px] pointer-events-none" />
            <div className="relative flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-champagne" />
              <h2 className="text-xs tracking-[0.3em] uppercase text-champagne">{CREW_MEMBERSHIP_LABELS[membership.status]}</h2>
            </div>
            <div className="relative space-y-1 text-sm text-white/70">
              <p>Número de miembro: <span className="font-mono">{membership.member_number}</span></p>
              <p>Vence: {new Date(membership.expires_at).toLocaleDateString('es-BO')}</p>
            </div>
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xs tracking-[0.25em] uppercase text-gray-400 mb-4">Mis solicitudes</h2>

          {isLoading ? (
            <p className="text-sm text-gray-400">Cargando...</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-gray-400">Aún no tienes solicitudes.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-4 border border-gray-100 rounded-xl p-4"
                >
                  <div>
                    <p className="text-sm font-medium font-mono text-pass-black">{request.request_number}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(request.created_at).toLocaleDateString('es-BO')} — Bs {request.amount.toFixed(2)}
                    </p>
                    {request.status === 'rejected' && request.rejection_reason && (
                      <p className="text-xs text-red-500 mt-1">{request.rejection_reason}</p>
                    )}
                  </div>
                  <RequestStatusBadge status={request.status} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {(!membership || membership.status !== 'active') && (
          <motion.div variants={fadeUp} className="mt-6 text-center">
            <Link
              to="/pass-crew/join"
              className="inline-flex items-center gap-2 bg-pass-black text-white px-8 py-3.5 rounded-full font-medium tracking-[0.2em] text-xs uppercase hover:bg-gray-900 transition-colors"
            >
              Generar nueva solicitud
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
