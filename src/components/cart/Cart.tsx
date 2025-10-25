import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { CITIES } from '../../types';

const WHATSAPP_NUMBER = '59175767850';

export default function Cart() {
  const {
    items,
    selectedCity,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    setCity,
    getTotal,
  } = useCartStore();

  const generateWhatsAppMessage = () => {
    const productsText = items
      .map(
        (item) =>
          `• ${item.product.name} - Talla: ${item.variant.size} - Cantidad: ${item.quantity} - Bs. ${(item.product.price * item.quantity).toFixed(2)}`
      )
      .join('\n');

    const total = getTotal();

    return `¡Hola! 👋 Quiero realizar el siguiente pedido:

*PRODUCTOS:*
${productsText}

*TOTAL: Bs. ${total.toFixed(2)}*

*Ciudad de entrega:* ${selectedCity}

¿Podrían confirmarme la disponibilidad y opciones de pago? ¡Gracias! 🙌`;
  };

  const handleCheckout = () => {
    if (!selectedCity) {
      alert('Por favor selecciona una ciudad de entrega');
      return;
    }

    if (items.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    const message = encodeURIComponent(generateWhatsAppMessage());
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCart}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  <h2 className="text-lg font-semibold tracking-wide">
                    TU CARRITO ({items.length})
                  </h2>
                </div>
                <button
                  onClick={closeCart}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500">Tu carrito está vacío</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item.variant.id} className="flex gap-4">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover bg-gray-100"
                        />

                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium text-sm">{item.product.name}</h3>
                              <p className="text-xs text-gray-600">Talla: {item.variant.size}</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.variant.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(item.variant.id, Math.max(1, item.quantity - 1))
                                }
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.variant.id,
                                    Math.min(item.availableStock, item.quantity + 1)
                                  )
                                }
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="font-semibold text-sm">
                              Bs. {(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-gray-200 p-6 space-y-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Subtotal:</span>
                    <span>Bs. {getTotal().toFixed(2)}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 tracking-wide">
                      CIUDAD DE ENTREGA
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                    >
                      <option value="">Seleccionar ciudad</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={!selectedCity}
                    className="w-full bg-black text-white py-4 font-medium tracking-wide hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    FINALIZAR COMPRA
                  </button>

                  <p className="text-xs text-center text-gray-500">
                    Serás redirigido a WhatsApp para confirmar tu pedido
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
