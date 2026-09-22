import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { useToastStore } from '../../store/toastStore';
import { supabase } from '../../lib/supabase';

export default function ActivateAccountPage() {
  const customer = useCustomerAuthStore((state) => state.customer);
  const isAuthenticated = useCustomerAuthStore((state) => state.isAuthenticated);
  const signUp = useCustomerAuthStore((state) => state.signUp);
  const activate = useCustomerAuthStore((state) => state.activateCustomerAccount);
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (!isAuthenticated) {
        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
        await signUp(email, password, '', phone, false);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          addToast('Revisa tu email y vuelve a esta página después de confirmarlo.', 'success');
          return;
        }
      }
      const result = await activate(code.trim().toUpperCase(), phone);
      if (result.status === 'pending') {
        addToast('Tu solicitud quedó pendiente de aprobación por PASS.', 'success');
        navigate('/login', { replace: true });
        return;
      }
      addToast('Tu cuenta quedó vinculada al perfil existente.', 'success');
      navigate('/account', { replace: true });
    } catch (error: unknown) {
      addToast(error instanceof Error ? error.message : 'No se pudo activar la cuenta', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Activar cuenta" subtitle="Vincula tu cuenta web con tu perfil PASS existente.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput id="code" label="Código PASS" required value={code} onChange={(event) => setCode(event.target.value)} placeholder="PASS-000123" />
        <AuthInput id="phone" label="Teléfono registrado en tienda" type="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="70707070" />
        {!isAuthenticated && <>
          <AuthInput id="email" label="Email verificado" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@email.com" />
          <AuthInput id="password" label="Contraseña nueva" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
          <p className="text-xs text-gray-500">El email debe coincidir con el registrado en tu perfil de tienda. Si la confirmación por email está activa, confirma primero y vuelve a iniciar sesión.</p>
        </>}
        {customer && <p className="text-xs text-gray-500">Sesión activa como {customer.email}.</p>}
        <motion.button type="submit" disabled={busy} whileTap={{ scale: 0.98 }} className="w-full bg-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white disabled:bg-gray-300">
          {busy ? 'Activando…' : 'Activar mi cuenta'}
        </motion.button>
        <p className="text-center text-xs text-gray-500"><Link to="/login" className="underline">Volver a iniciar sesión</Link></p>
      </form>
    </AuthLayout>
  );
}
