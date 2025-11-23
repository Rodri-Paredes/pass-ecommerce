import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ProductWithVariants } from '../../types';

interface ProductCardProps {
  product: ProductWithVariants;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  // No hay segunda imagen en la base de datos actual
  const secondImage = null;
  const totalStock = product.variants?.reduce(
    (sum, variant) =>
      sum +
      (variant.stock?.reduce((stockSum, s) => stockSum + s.quantity, 0) || 0),
    0
  ) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link to={`/product/${product.id}`}>
        <div
          className="relative aspect-[3/4] bg-gray-50 overflow-hidden mb-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.img
            src={isHovered && secondImage ? secondImage : product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            initial={false}
            animate={{ 
              scale: isHovered ? 1.08 : 1,
              filter: isHovered ? 'brightness(0.95)' : 'brightness(1)'
            }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />

          {product.drop && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm text-white px-4 py-2 text-xs font-semibold tracking-[0.15em] uppercase"
            >
              {product.drop.name}
            </motion.div>
          )}

          {totalStock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-lg tracking-[0.2em] uppercase">Agotado</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-base tracking-tight group-hover:tracking-wide transition-all duration-300">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">{product.category}</p>
            <p className="font-bold text-lg">Bs. {product.price.toFixed(0)}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
