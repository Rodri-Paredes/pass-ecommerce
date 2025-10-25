import { useState, useEffect } from 'react';
import type { ProductVariant, Stock, Branch } from '../../types';

interface SizeSelectorProps {
  variants: (ProductVariant & {
    stock?: (Stock & { branch?: Branch })[];
  })[];
  selectedSize: string | null;
  onSizeSelect: (variant: ProductVariant, totalStock: number) => void;
  selectedCity?: string;
}

export default function SizeSelector({
  variants,
  selectedSize,
  onSizeSelect,
  selectedCity,
}: SizeSelectorProps) {
  const [availableSizes, setAvailableSizes] = useState<
    Map<string, { variant: ProductVariant; stock: number }>
  >(new Map());

  useEffect(() => {
    const sizeMap = new Map();

    variants.forEach((variant) => {
      let totalStock = 0;

      if (variant.stock) {
        if (selectedCity) {
          // Filtramos por nombre de sucursal que contenga la ciudad
          totalStock = variant.stock
            .filter((s) => s.branch?.name?.toLowerCase().includes(selectedCity.toLowerCase()))
            .reduce((sum, s) => sum + s.quantity, 0);
        } else {
          totalStock = variant.stock.reduce((sum, s) => sum + s.quantity, 0);
        }
      }

      if (totalStock > 0) {
        sizeMap.set(variant.size, { variant, stock: totalStock });
      }
    });

    setAvailableSizes(sizeMap);
  }, [variants, selectedCity]);

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium tracking-wide">TALLA</label>
        {selectedCity && (
          <span className="text-xs text-gray-500">Stock en {selectedCity}</span>
        )}
      </div>

      <div className="grid grid-cols-6 gap-2">
        {allSizes.map((size) => {
          const sizeData = availableSizes.get(size);
          const isAvailable = !!sizeData;
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
    </div>
  );
}
