import { useState, useEffect } from 'react';
import type { ProductVariant, Stock, Branch } from '../../types';
import { SIZES, PANT_SIZES, NUMERIC_SIZE_CATEGORIES } from '../../types';
import { Ruler } from 'lucide-react';

interface SizeSelectorProps {
  variants: (ProductVariant & {
    stock?: (Stock & { branch?: Branch })[];
  })[];
  selectedSize: string | null;
  onSizeSelect: (variant: ProductVariant, totalStock: number) => void;
  selectedCity?: string;
  productCategory?: string;
  onShowSizeGuide?: () => void;
}

export default function SizeSelector({
  variants,
  selectedSize,
  onSizeSelect,
  selectedCity,
  productCategory,
  onShowSizeGuide,
}: SizeSelectorProps) {
  const [availableSizes, setAvailableSizes] = useState<
    Map<string, { variant: ProductVariant; stock: number }>
  >(new Map());

  // Determinar qué tallas mostrar según la categoría
  const isNumericSize = productCategory && 
    (NUMERIC_SIZE_CATEGORIES as readonly string[]).includes(productCategory);
  const allSizes = isNumericSize ? [...PANT_SIZES] : [...SIZES];

  useEffect(() => {
    const sizeMap = new Map();

    variants.forEach((variant) => {
      let totalStock = 0;

      if (variant.stock && variant.stock.length > 0) {
        if (selectedCity) {
          // Filtramos por nombre de sucursal que contenga la ciudad
          totalStock = variant.stock
            .filter((s) => s.branch?.name?.toLowerCase().includes(selectedCity.toLowerCase()))
            .reduce((sum, s) => sum + s.quantity, 0);
        } else {
          totalStock = variant.stock.reduce((sum, s) => sum + s.quantity, 0);
        }
      }

      // Incluir todas las variantes, incluso sin stock, para mostrarlas como no disponibles
      sizeMap.set(variant.size, { variant, stock: totalStock });
    });

    setAvailableSizes(sizeMap);
  }, [variants, selectedCity]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium tracking-wide">
          {isNumericSize ? 'TALLA (CINTURA)' : 'TALLA'}
        </label>
        <div className="flex items-center gap-3">
          {selectedCity && (
            <span className="text-xs text-gray-500">Stock en {selectedCity}</span>
          )}
          {onShowSizeGuide && (
            <button
              type="button"
              onClick={onShowSizeGuide}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Ruler className="w-3 h-3" />
              Ver guía
            </button>
          )}
        </div>
      </div>

      <div className={`grid gap-2 ${isNumericSize ? 'grid-cols-4' : 'grid-cols-6'}`}>
        {allSizes.map((size) => {
          const sizeData = availableSizes.get(size);
          const isAvailable = sizeData && sizeData.stock > 0;
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              onClick={() => {
                if (isAvailable && sizeData) {
                  onSizeSelect(sizeData.variant, sizeData.stock);
                }
              }}
              disabled={!isAvailable}
              className={`
                py-3 text-sm font-medium tracking-wide transition-all
                ${isSelected
                  ? 'bg-black text-white'
                  : isAvailable
                  ? 'bg-white border border-gray-300 hover:border-black'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                }
              `}
            >
              {size}
            </button>
          );
        })}
      </div>

      {selectedSize && availableSizes.get(selectedSize) && (
        <p className="text-sm text-gray-600">
          Stock disponible: {availableSizes.get(selectedSize)!.stock} unidades
        </p>
      )}

      {variants.length === 0 && (
        <p className="text-sm text-red-500">
          No hay variantes disponibles para este producto
        </p>
      )}
    </div>
  );
}
