import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, MapPin } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <h1 className="text-4xl font-bold mb-8 tracking-tight">INFORMACIÓN DE ENVÍOS</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6" />
              <h2 className="text-2xl font-semibold">Tiempos de Entrega</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>La Paz:</strong> 1-2 días hábiles
              </p>
              <p>
                <strong>Cochabamba y Santa Cruz:</strong> 2-3 días hábiles
              </p>
              <p>
                <strong>Otras ciudades:</strong> 3-5 días hábiles
              </p>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-6 h-6" />
              <h2 className="text-2xl font-semibold">Costos de Envío</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>La Paz:</strong> Bs. 15
              </p>
              <p>
                <strong>Cochabamba y Santa Cruz:</strong> Bs. 25
              </p>
              <p>
                <strong>Otras ciudades:</strong> Bs. 30-40 (según destino)
              </p>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6" />
              <h2 className="text-2xl font-semibold">Cobertura</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Realizamos envíos a todas las ciudades principales de Bolivia:
            </p>
            <ul className="grid grid-cols-2 gap-2 text-gray-700">
              <li>• La Paz</li>
              <li>• Cochabamba</li>
              <li>• Santa Cruz</li>
              <li>• Tarija</li>
              <li>• Sucre</li>
              <li>• Potosí</li>
              <li>• Oruro</li>
              <li>• Trinidad</li>
            </ul>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold mb-4">Seguimiento de Pedido</h2>
            <p className="text-gray-700">
              Una vez confirmado tu pedido por WhatsApp, te enviaremos un código de seguimiento
              para que puedas rastrear tu paquete en tiempo real.
            </p>
          </section>

          <div className="bg-gray-50 p-6 rounded-lg mt-8">
            <p className="text-sm text-gray-600">
              <strong>Nota:</strong> Los tiempos de entrega pueden variar según la disponibilidad
              del producto y condiciones climáticas. Te mantendremos informado en cada paso del proceso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
