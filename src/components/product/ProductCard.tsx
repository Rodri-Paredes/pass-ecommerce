import { useState, useMemo, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ProductWithVariants } from '../../types';
import LazyImage from '../common/LazyImage';
import { useBranchStore } from '../../store/branchStore';
import { useDiscountStore } from '../../store/discountStore';
import { DiscountBadge, DiscountPrice } from '../discounts/DiscountBadge';

interface ProductCardProps {
  product: ProductWithVariants;
  index: number;
}

// Memoizar ProductCard para evitar re-renders innecesarios
const ProductCard = memo(function ProductCard({ product, index }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { selectedBranch } = useBranchStore();
  const { activeDiscountsMap } = useDiscountStore();
  
  // Verificar si el producto tiene descuento
  const discountInfo = useMemo(() => {
    return activeDiscountsMap.get(product.id);
  }, [activeDiscountsMap, product.id]);

  // Calcular precio original si hay descuento
  const originalPrice = useMemo(() => {
    return product.price;
  }, [product.price]);
  
  // Memoizar cálculo de stock (operación costosa)
  const totalStock = useMemo(() => {
    if (selectedBranch) {
      // Stock solo de la sucursal seleccionada
      return product.variants?.reduce(
        (sum, variant) =>
          sum +
          (variant.stock?.reduce((stockSum, s) => 
            s.branch_id === selectedBranch ? stockSum + s.quantity : stockSum, 0) || 0),
        0
      ) || 0;
    }
    // Stock total de todas las sucursales
    return product.variants?.reduce(
      (sum, variant) =>
        sum +
        (variant.stock?.reduce((stockSum, s) => stockSum + s.quantity, 0) || 0),
      0
    ) || 0;
  }, [product.variants, selectedBranch]);

  // Obtener nombre de sucursal si está seleccionada
  const branchName = useMemo(() => {
    if (!selectedBranch || !product.variants) return null;
    for (const variant of product.variants) {
      if (variant.stock) {
        const branchStock = variant.stock.find(s => s.branch_id === selectedBranch && s.quantity > 0);
        if (branchStock?.branch) {
          return branchStock.branch.name;
        }
      }
    }
    return null;
  }, [product.variants, selectedBranch]);

  // Obtener abreviación de la sucursal
  const getBranchAbbreviation = (name: string): string => {
    const cityName = name.replace(/^Sucursal\s+/i, '').trim().toLowerCase();
    const abbreviations: { [key: string]: string } = {
      'cochabamba': 'CBBA',
      'tarija': 'TJA'
    };
    return abbreviations[cityName] || cityName.substring(0, 3).toUpperCase();
  };

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

          {discountInfo && (
            <div className="absolute top-3 right-3 z-10">
              <DiscountBadge percentage={discountInfo.percentage} />
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
          <div className="flex items-center gap-2">
            {discountInfo ? (
              <DiscountPrice 
                originalPrice={originalPrice} 
                discountPercentage={discountInfo.percentage} 
              />
            ) : (
              <p className="font-semibold">Bs. {product.price.toFixed(2)}</p>
            )}
            {branchName && (
              <span className="text-[10px] font-black tracking-wider text-white bg-gradient-to-r from-gray-900 to-black px-1.5 py-0.5 rounded">
                {getBranchAbbreviation(branchName)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

export default ProductCard;
