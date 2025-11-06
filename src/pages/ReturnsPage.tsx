import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export default function ReturnsPage() {
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

        <h1 className="text-4xl font-bold mb-8 tracking-tight">POLÍTICA DE DEVOLUCIONES</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-6 h-6" />
              <h2 className="text-2xl font-semibold">Cambios y Devoluciones</h2>
            </div>
            <p className="text-gray-700 mb-4">
              En PASS CLOTHING queremos que estés 100% satisfecho con tu compra. Aceptamos cambios
              y devoluciones bajo las siguientes condiciones:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Tienes hasta 7 días después de recibir tu pedido</li>
              <li>• La prenda debe estar sin usar, con etiquetas originales</li>
              <li>• Debe conservar su empaque original</li>
              <li>• No debe tener signos de uso, lavado o alteraciones</li>
            </ul>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold mb-4">Proceso de Devolución</h2>
            <ol className="space-y-3 text-gray-700">
              <li>
                <strong>1. Contáctanos:</strong> Escríbenos por WhatsApp al 591 75767850
                indicando el motivo de la devolución
              </li>
              <li>
                <strong>2. Confirmación:</strong> Te enviaremos las instrucciones para el envío
              </li>
              <li>
                <strong>3. Envío:</strong> Empaca bien el producto y envíalo a nuestra dirección
              </li>
              <li>
                <strong>4. Inspección:</strong> Revisaremos el producto (1-2 días hábiles)
              </li>
              <li>
                <strong>5. Reembolso:</strong> Procesaremos tu reembolso o cambio
              </li>
            </ol>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold mb-4">Productos con Defecto</h2>
            <p className="text-gray-700">
              Si recibiste un producto defectuoso o incorrecto, contactanos inmediatamente.
              Cubriremos los costos de envío y procesaremos el cambio o reembolso sin costo
              adicional para ti.
            </p>
          </section>

          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h2 className="text-2xl font-semibold">Excepciones</h2>
            </div>
            <p className="text-gray-700 mb-2">
              No aceptamos devoluciones en los siguientes casos:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Productos en oferta o rebaja (excepto defectos de fábrica)</li>
              <li>• Accesorios personales (gorras usadas, etc.)</li>
              <li>• Productos de edición limitada de drops finalizados</li>
            </ul>
          </section>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-8">
            <p className="text-sm text-blue-900">
              <strong>¿Necesitas ayuda?</strong> Estamos aquí para ayudarte. Contáctanos por
              WhatsApp al 591 60279699 
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
