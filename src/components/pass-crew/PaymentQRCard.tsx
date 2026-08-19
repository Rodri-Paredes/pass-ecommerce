import { QrCode } from 'lucide-react';
import type { CrewSettings } from '../../types';

interface PaymentQRCardProps {
  settings: CrewSettings | null;
}

export default function PaymentQRCard({ settings }: PaymentQRCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-xs tracking-[0.25em] uppercase text-gray-400 mb-4">Paga con QR</h3>

      <div className="flex flex-col items-center">
        {settings?.payment_qr_url ? (
          <img
            src={settings.payment_qr_url}
            alt="QR de pago PASS CREW"
            className="w-56 h-56 object-contain border border-gray-100 rounded-xl"
          />
        ) : (
          <div className="w-56 h-56 flex flex-col items-center justify-center gap-2 border border-dashed border-gray-200 rounded-xl text-gray-300">
            <QrCode className="w-10 h-10" />
            <span className="text-xs">QR no disponible</span>
          </div>
        )}
      </div>

      {settings?.payment_instructions && (
        <p className="text-sm text-gray-500 mt-4 whitespace-pre-line leading-relaxed">
          {settings.payment_instructions}
        </p>
      )}
    </div>
  );
}
