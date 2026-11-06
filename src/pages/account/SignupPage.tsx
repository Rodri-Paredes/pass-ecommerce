import { useState, FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { useToastStore } from '../../store/toastStore';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ci, setCi] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signUp = useCustomerAuthStore((s) => s.signUp);
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/account';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      addToast('Las contraseñas no coinciden', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { requiresEmailConfirmation } = await signUp(email, password, fullName, phone, ci);
      if (requiresEmailConfirmation) {
        addToast('Cuenta creada. Revisa tu email y luego inicia sesión.', 'success');
        navigate('/login', { replace: true });
        return;
      }
      addToast('Tu cuenta está lista. Bienvenido a PASS.', 'success');
      navigate(redirectTo, { replace: true });
    } catch (error: unknown) {
      addToast(error instanceof Error ? error.message : 'No se pudo crear la cuenta', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return <AuthLayout title="Crear cuenta" subtitle="Crea tu acceso a PASS y forma parte del Crew." footer={<p>¿Ya tienes cuenta? <Link to="/login" className="font-medium text-pass-black hover:underline">Iniciar sesión</Link></p>}>
    <form onSubmit={handleSubmit} className="space-y-6">
      <AuthInput id="full-name" label="Nombre completo" type="text" required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Tu nombre" />
      <AuthInput id="email" label="Email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@email.com" />
      <AuthInput id="phone" label="Teléfono" type="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="70707070" />
      <AuthInput id="ci" label="CI (opcional)" type="text" value={ci} onChange={(event) => setCi(event.target.value)} placeholder="1234567 LP" />
      <AuthInput id="password" label="Contraseña" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
      <AuthInput id="confirm-password" label="Confirmar contraseña" type="password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="••••••••" />
      <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300">{isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}</motion.button>
    </form>
  </AuthLayout>;
}
