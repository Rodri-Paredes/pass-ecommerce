import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { useDiscountStore } from '../store/discountStore';
import type { ProductWithVariants, ProductVariant } from '../types';
import SizeSelector from '../components/product/SizeSelector';
import SizeGuideModal from '../components/product/SizeGuideModal';
import ProductCard from '../components/product/ProductCard';
import { DiscountBadge, DiscountPrice } from '../components/discounts/DiscountBadge';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductWithVariants | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [availableStock, setAvailableStock] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<ProductWithVariants[]>([]);

  const { addItem, openCart } = useCartStore();
  const { activeDiscountsMap, loadActiveDiscountsMap } = useDiscountStore();

  useEffect(() => {
    // Scroll to top when product page loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (id) {
      loadProduct();
      loadActiveDiscountsMap();
    }
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(
            id,
            size,
            stock(
              quantity,
              branch_id,
              branch:branches(name, address)
            )
          ),
          drop:drops(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);

      // Cargar productos recomendados
      loadRecommendedProducts(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendedProducts = async (currentProduct: ProductWithVariants) => {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(
            id,
            size,
            stock(
              quantity,
              branch_id,
              branch:branches(name, address)
            )
          ),
          drop:drops(*)
        `)
        .neq('id', currentProduct.id)
        .limit(4);

      // Priorizar productos de la misma categoría o del mismo drop
      if (currentProduct.drop_id) {
        const { data: dropProducts } = await query
          .eq('drop_id', currentProduct.drop_id);
        
        if (dropProducts && dropProducts.length >= 4) {
          setRecommendedProducts(dropProducts);
          return;
        }
      }

      // Si no hay suficientes del mismo drop, buscar de la misma categoría
      const { data: categoryProducts } = await query
        .eq('category', currentProduct.category);

      if (categoryProducts && categoryProducts.length > 0) {
        setRecommendedProducts(categoryProducts);
        return;
      }

      // Si no hay suficientes de la misma categoría, traer productos aleatorios
      const { data: randomProducts } = await query;
      setRecommendedProducts(randomProducts || []);
    } catch (error) {
      console.error('Error loading recommended products:', error);
    }
  };

  const handleSizeSelect = (variant: ProductVariant, stock: number) => {
    setSelectedVariant(variant);
    setAvailableStock(stock);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      alert('Por favor selecciona una talla');
      return;
    }

    addItem({
      product,
      variant: selectedVariant,
      quantity,
      availableStock,
    });

    openCart();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16">
        <p className="text-xl text-gray-500 mb-4">Producto no encontrado</p>
        <Link to="/shop" className="text-sm underline">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  // Combinar imagen principal con el array de imágenes adicionales
  const allImages = product.images && product.images.length > 0 
    ? [product.image_url, ...product.images]
    : [product.image_url];

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a la tienda
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden rounded-lg">
              <img
                src={allImages[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </button>
                </>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`aspect-square bg-gray-100 overflow-hidden border-2 transition-all rounded-md hover:opacity-75 ${
                      currentImage === index ? 'border-black' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {product.drop && (
              <div className="inline-block bg-black text-white px-3 py-1 text-xs font-medium tracking-wide">
                {product.drop.name}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold mb-2 tracking-tight">{product.name}</h1>
              {activeDiscountsMap.has(product.id) ? (
                <div className="flex items-center gap-3">
                  <DiscountBadge percentage={activeDiscountsMap.get(product.id)!.percentage} />
                  <DiscountPrice 
                    originalPrice={product.price} 
                    discountPercentage={activeDiscountsMap.get(product.id)!.percentage} 
                  />
                </div>
              ) : (
                <p className="text-xl font-semibold">Bs. {product.price.toFixed(2)}</p>
              )}
            </div>

            {product.description && (
              <div>
                <h3 className="text-sm font-medium tracking-wide mb-2">DESCRIPCIÓN</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              {product.variants && (
                <SizeSelector
                  variants={product.variants}
                  selectedSize={selectedVariant?.size || null}
                  onSizeSelect={handleSizeSelect}
                  productCategory={product.category}
                  onShowSizeGuide={() => setIsGuideOpen(true)}
                />
              )}
            </div>

            {selectedVariant && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 tracking-wide">CANTIDAD</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-gray-300 hover:border-black transition-colors"
                    >
                      -
                    </button>
                    <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                      className="w-10 h-10 border border-gray-300 hover:border-black transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-black text-white py-4 font-medium tracking-wide hover:bg-gray-800 transition-colors"
                >
                  AGREGAR AL CARRITO
                </button>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6 text-sm text-gray-600 space-y-2">
              <p>• Envíos a todo Bolivia</p>
              <p>• Pago contra entrega disponible</p>
              <p>• Consulta disponibilidad por WhatsApp</p>
            </div>
          </div>
        </div>

        {/* Productos Recomendados */}
        {recommendedProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-bold mb-8 tracking-tight">
              TAMBIÉN TE PUEDE GUSTAR
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((recommendedProduct, index) => (
                <ProductCard key={recommendedProduct.id} product={recommendedProduct} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        category={product?.category}
      />
    </div>
  );
}
