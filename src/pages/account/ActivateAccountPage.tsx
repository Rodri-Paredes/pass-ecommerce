import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { useToastStore } from '../../store/toastStore';

export default function ActivateAccountPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [ci, setCi] = useState('');
  const [busy, setBusy] = useState(false);
  const completeProfile = useCustomerAuthStore((state) => state.completeProfile);
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await completeProfile(fullName, phone, ci);
      addToast('Tu perfil ya está listo.', 'success');
      navigate('/account', { replace: true });
    } catch (error: unknown) {
      addToast(error instanceof Error ? error.message : 'No se pudo completar tu perfil', 'error');
    } finally {
      setBusy(false);
    }
  };

  return <AuthLayout title="Completa tu perfil" subtitle="Solo necesitamos estos datos para activar tu cuenta PASS." footer={<p>¿Prefieres usar otra cuenta? <Link to="/login" className="font-medium text-black underline">Iniciar sesión</Link></p>}>
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthInput id="full-name" label="Nombre completo" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Tu nombre" />
      <AuthInput id="phone" label="Teléfono" type="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="70707070" />
      <AuthInput id="ci" label="CI (opcional)" value={ci} onChange={(event) => setCi(event.target.value)} placeholder="1234567 LP" />
      <motion.button type="submit" disabled={busy} whileTap={{ scale: 0.98 }} className="w-full bg-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white disabled:bg-gray-300">{busy ? 'Guardando…' : 'Completar mi perfil'}</motion.button>
    </form>
  </AuthLayout>;
}
