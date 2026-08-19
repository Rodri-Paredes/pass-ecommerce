import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { useToastStore } from '../../store/toastStore';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signUp = useCustomerAuthStore((s) => s.signUp);
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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
      await signUp(email, password, fullName, phone || undefined);
      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      addToast(error.message || 'No se pudo crear la cuenta', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Tu lugar en la comunidad te espera."
      footer={
        <p>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-pass-black font-medium hover:underline">
            Iniciar sesión
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          id="fullName"
          label="Nombre completo"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Tu nombre completo"
        />

        <AuthInput
          id="email"
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
        />

        <AuthInput
          id="phone"
          label="Teléfono (opcional)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+591 XXXXXXXX"
        />

        <AuthInput
          id="password"
          label="Contraseña"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <AuthInput
          id="confirmPassword"
          label="Confirmar contraseña"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
        />

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-pass-black text-white py-3.5 rounded-full font-medium tracking-[0.2em] text-xs uppercase hover:bg-gray-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </motion.button>
      </form>
    </AuthLayout>
  );
}
