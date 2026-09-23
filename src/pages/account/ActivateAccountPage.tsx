import { useEffect, useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { useToastStore } from '../../store/toastStore';
import { supabase } from '../../lib/supabase';

export default function ActivateAccountPage() {
  const customer = useCustomerAuthStore((state) => state.customer);
  const signUp = useCustomerAuthStore((state) => state.signUp);
  const activate = useCustomerAuthStore((state) => state.activateCustomerAccount);
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();
  const [ci, setCi] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [hasAuthSession, setHasAuthSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasAuthSession(Boolean(data.session)));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const { data: currentAuth } = await supabase.auth.getSession();
      if (!currentAuth.session) {
        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
        await signUp(email, password, ci, phone);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          addToast('Revisa tu email y vuelve a esta página después de confirmarlo.', 'success');
          return;
        }
      }
      await activate(ci, phone);
      addToast('Tu cuenta quedó vinculada al perfil existente.', 'success');
      navigate('/account', { replace: true });
    } catch (error: unknown) {
      addToast(error instanceof Error ? error.message : 'No se pudo activar la cuenta', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Vincular cuenta" subtitle="Usa tu CI y teléfono registrados en tienda." footer={<p>¿Ya tienes cuenta? <Link to="/login" className="font-medium text-black underline">Iniciar sesión</Link></p>}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput id="ci" label="CI registrado en tienda" required value={ci} onChange={(event) => setCi(event.target.value)} placeholder="Tu número de carnet" />
        <AuthInput id="phone" label="Teléfono registrado en tienda" type="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="70707070" />
        {!hasAuthSession && <>
          <AuthInput id="email" label="Email verificado" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@email.com" />
          <AuthInput id="password" label="Contraseña nueva" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
          <p className="text-xs text-gray-500">Confirma tu email antes de vincular. Tu cuenta debe usar el mismo email del perfil de tienda si ya existe.</p>
        </>}
        {(customer || hasAuthSession) && <p className="text-xs text-gray-500">Sesión Auth activa. Ingresa el CI y teléfono registrados en tienda para completar la vinculación.</p>}
        <motion.button type="submit" disabled={busy} whileTap={{ scale: 0.98 }} className="w-full bg-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white disabled:bg-gray-300">
          {busy ? 'Activando…' : 'Activar mi cuenta'}
        </motion.button>
        <p className="text-center text-xs text-gray-500"><Link to="/login" className="underline">Volver a iniciar sesión</Link></p>
      </form>
    </AuthLayout>
  );
}
