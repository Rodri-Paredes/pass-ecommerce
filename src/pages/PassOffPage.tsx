import React from 'react';
import { TrendingDown, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDiscountedProducts } from '../hooks/useDiscountedProducts';
import { DiscountPrice, DiscountBadge } from '../components/discounts/DiscountBadge';

const PassOffPage: React.FC = () => {
  const { discountedProducts, count, isLoading } = useDiscountedProducts();

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando ofertas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header simple */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900">
            PASS OFF
          </h1>
          <p className="text-gray-600 mt-2">
            {count} productos con descuento
          </p>
        </div>

        {/* Grid de Productos */}
        {discountedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto px-4">
              <p className="text-xl text-gray-600 mb-2">
                No hay productos en oferta
              </p>
              <p className="text-sm text-gray-500">
                Agrega descuentos en Supabase para que aparezcan aquí
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {discountedProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-red-500"
              >
                {/* Badge de descuento */}
                <div className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    <DiscountBadge percentage={product.discount.percentage} />
                  </div>

                  {/* Imagen */}
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 md:p-4">
                  <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{product.category}</p>

                  {/* Precio */}
                  <DiscountPrice
                    originalPrice={product.originalPrice}
                    discountedPrice={product.finalPrice}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PassOffPage;
