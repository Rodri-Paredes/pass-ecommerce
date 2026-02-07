import React from 'react';

interface DiscountBadgeProps {
  percentage: number;
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({ percentage }) => {
  return (
    <div className="inline-flex items-center justify-center bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
      -{percentage}%
    </div>
  );
};

interface DiscountPriceProps {
  originalPrice: number;
  discountPercentage: number;
}

export const DiscountPrice: React.FC<DiscountPriceProps> = ({ 
  originalPrice, 
  discountPercentage
}) => {
  const discountedPrice = originalPrice * (1 - discountPercentage / 100);
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-base text-gray-400 line-through">
        Bs. {originalPrice.toFixed(2)}
      </span>
      <span className="text-xl font-bold text-red-600">
        Bs. {discountedPrice.toFixed(2)}
      </span>
    </div>
  );
};
