import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Package, Calendar, MapPin, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';

interface SharedOrderItem {
  product: {
    name: string;
    price: number;
    image_url: string;
  };
  variant: {
    size: string;
  };
  quantity: number;
  availableStock: number;
}

interface SharedOrder {
  id: string;
  order_code: string;
  items: SharedOrderItem[];
  total: number;
  selected_city: string;
  selected_store: string;
  comments: string;
  created_at: string;
  expires_at: string;
  viewed_count: number;
}

export default function SharedOrderPage() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [order, setOrder] = useState<SharedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderCode) {
        setError('Código de pedido no válido');
        setLoading(false);
        return;
      }

      try {
        // Obtener pedido
        const { data, error: fetchError } = await supabase
          .from('shared_orders')
          .select('*')
          .eq('order_code', orderCode.toUpperCase())
          .single();

        if (fetchError || !data) {
          setError('Pedido no encontrado o expirado');
          setLoading(false);
          return;
        }

        // Verificar si está expirado
        const expiresAt = new Date(data.expires_at);
        if (expiresAt < new Date()) {
          setError('Este pedido ha expirado');
          setLoading(false);
          return;
        }

        // Incrementar contador de visualizaciones
        await supabase
          .from('shared_orders')
          .update({ viewed_count: (data.viewed_count || 0) + 1 })
          .eq('id', data.id);

        setOrder(data);
      } catch (err) {
        setError('Error al cargar el pedido');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-light mb-2">Pedido No Encontrado</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  const expiresAt = new Date(order.expires_at);
  const createdAt = new Date(order.created_at);
  const hoursUntilExpiry = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light tracking-wider mb-1">PEDIDO COMPARTIDO</h1>
              <p className="text-sm text-gray-500">Código: <span className="font-mono font-semibold">{order.order_code}</span></p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-600">Visto {order.viewed_count} {order.viewed_count === 1 ? 'vez' : 'veces'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Información de expiración */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Calendar className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">Este pedido expira en {hoursUntilExpiry} horas</p>
            <p className="text-xs text-amber-700 mt-1">
              Creado: {createdAt.toLocaleDateString('es-BO', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Productos */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="font-medium tracking-wide flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  PRODUCTOS ({order.items.length})
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-medium text-lg">{item.product.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Talla: <span className="font-medium text-black">{item.variant.size}</span></span>
                        <span>Cantidad: <span className="font-medium text-black">{item.quantity}</span></span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-gray-500">
                          Bs. {item.product.price.toFixed(2)} c/u
                        </span>
                        <span className="font-semibold text-lg">
                          Bs. {(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="space-y-4">
            {/* Total */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm text-gray-600 uppercase tracking-wider mb-4">Resumen</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">Bs. {order.total.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">TOTAL:</span>
                    <span className="text-2xl font-light">Bs. {order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de entrega */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm text-gray-600 uppercase tracking-wider mb-4">Detalles de Entrega</h3>
              <div className="space-y-3">
                {order.selected_city && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Ciudad</p>
                      <p className="font-medium">{order.selected_city}</p>
                    </div>
                  </div>
                )}
                {order.comments && (
                  <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                    <MessageSquare className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Comentarios</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.comments}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botón para volver */}
            <Link
              to="/"
              className="block w-full bg-black text-white text-center py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm tracking-wide"
            >
              Volver a la Tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
