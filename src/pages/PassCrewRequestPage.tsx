import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload } from 'lucide-react';
import { usePassCrewStore } from '../store/passCrewStore';
import { useCustomerAuthStore } from '../store/customerAuthStore';
import { useToastStore } from '../store/toastStore';
import PaymentQRCard from '../components/pass-crew/PaymentQRCard';
import { fadeUp, staggerContainer } from '../lib/motion';

export default function PassCrewRequestPage() {
  const { customer } = useCustomerAuthStore();
  const {
    plan,
    settings,
    activeRequest,
    isLoading,
    loadLandingData,
    loadSettings,
    loadMyStatus,
    submitRequest,
    uploadReceiptForRequest,
  } = usePassCrewStore();
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadLandingData();
    loadSettings();
  }, [loadLandingData, loadSettings]);

  useEffect(() => {
    if (customer) {
      loadMyStatus(customer.id);
    }
  }, [customer, loadMyStatus]);

  const handleGenerateRequest = async () => {
    if (!customer) return;

    setIsSubmitting(true);
    try {
      await submitRequest(customer.id);
      addToast('Solicitud generada correctamente', 'success');
    } catch (error: any) {
      addToast(error.message || 'No se pudo generar la solicitud', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadReceipt = async () => {
    if (!customer || !activeRequest || !file) return;

    setIsUploading(true);
    try {
      await uploadReceiptForRequest(customer.id, activeRequest.id, file);
      addToast('Comprobante subido correctamente', 'success');
      navigate('/pass-crew/status');
    } catch (error: any) {
      addToast(error.message || 'No se pudo subir el comprobante', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto px-4 sm:px-6"
      >
        <motion.div variants={fadeUp}>
          <Link to="/pass-crew" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-pass-black transition-colors mb-8">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a PASS CREW
          </Link>
        </motion.div>

        <motion.h1 variants={fadeUp} className="font-display text-3xl sm:text-4xl tracking-tight text-pass-black mb-2">
          Unirme a PASS CREW
        </motion.h1>
        {plan && (
          <motion.p variants={fadeUp} className="text-sm text-gray-400 mb-8">
            Plan {plan.name} — Bs {plan.price.toFixed(2)} / {plan.duration_days} días
          </motion.p>
        )}

        {!activeRequest ? (
          <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm p-8 space-y-5">
            <p className="text-sm text-gray-500 leading-relaxed">
              Genera tu solicitud para obtener el código de pago QR y las instrucciones de transferencia.
            </p>
            <motion.button
              onClick={handleGenerateRequest}
              disabled={isSubmitting || isLoading || !customer}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-pass-black text-white py-3.5 rounded-full font-medium tracking-[0.2em] text-xs uppercase hover:bg-gray-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Generando...' : 'Generar solicitud'}
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-sm text-gray-600">
                Número de solicitud: <span className="font-mono font-semibold text-pass-black">{activeRequest.request_number}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Monto a pagar: <span className="font-semibold text-pass-black">Bs {activeRequest.amount.toFixed(2)}</span>
              </p>
            </motion.div>

            <motion.div variants={fadeUp}>
              <PaymentQRCard settings={settings} />
            </motion.div>

            <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="text-xs tracking-[0.25em] uppercase text-gray-400">Subir comprobante</h3>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-medium file:tracking-wider file:uppercase file:bg-pass-black file:text-white hover:file:bg-gray-900 file:cursor-pointer"
              />
              <motion.button
                onClick={handleUploadReceipt}
                disabled={!file || isUploading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full inline-flex items-center justify-center gap-2 bg-pass-black text-white py-3.5 rounded-full font-medium tracking-[0.2em] text-xs uppercase hover:bg-gray-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Upload className="w-3.5 h-3.5" />
                {isUploading ? 'Subiendo...' : 'Subir comprobante'}
              </motion.button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
