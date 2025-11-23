import { useState, useMemo, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ProductWithVariants } from '../../types';
import LazyImage from '../common/LazyImage';

interface ProductCardProps {
  product: ProductWithVariants;
  index: number;
}

// Memoizar ProductCard para evitar re-renders innecesarios
const ProductCard = memo(function ProductCard({ product, index }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Memoizar cálculo de stock (operación costosa)
  const totalStock = useMemo(() => 
    product.variants?.reduce(
      (sum, variant) =>
        sum +
        (variant.stock?.reduce((stockSum, s) => stockSum + s.quantity, 0) || 0),
      0
    ) || 0,
    [product.variants]
  );

  // Memoizar handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/product/${product.id}`}>
        <div
          className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            initial={false}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full h-full"
          >
            <LazyImage
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {product.drop && (
            <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 text-xs font-medium tracking-wide">
              {product.drop.name}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium tracking-wide group-hover:opacity-70 transition-opacity">
              {product.name}
            </h3>
            {totalStock === 0 && (
              <span className="text-red-600 font-bold text-xs tracking-wide">SOLD OUT</span>
            )}
          </div>
          <p className="text-sm text-gray-600">{product.category}</p>
          <p className="font-semibold">Bs. {product.price.toFixed(2)}</p>
        </div>
      </Link>
    </motion.div>
  );
});

export default ProductCard;
