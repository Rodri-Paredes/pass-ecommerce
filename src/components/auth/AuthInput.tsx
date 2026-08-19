import { InputHTMLAttributes, useState } from 'react';
import { motion } from 'framer-motion';
import { easeOut } from '../../lib/motion';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function AuthInput({ label, id, className = '', ...props }: AuthInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-[11px] tracking-[0.25em] uppercase text-gray-400 mb-2">
        {label}
      </label>
      <input
        id={id}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-transparent border-b border-gray-200 py-2.5 text-sm text-pass-black placeholder:text-gray-300 focus:outline-none transition-colors ${className}`}
        {...props}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-px bg-pass-black"
        initial={{ width: '0%' }}
        animate={{ width: focused ? '100%' : '0%' }}
        transition={{ duration: 0.35, ease: easeOut }}
      />
    </div>
  );
}
