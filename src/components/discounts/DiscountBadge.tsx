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
  discountedPrice: number;
}

export const DiscountPrice: React.FC<DiscountPriceProps> = ({ 
  originalPrice, 
  discountedPrice 
}) => {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-gray-400 line-through">
        ${originalPrice.toFixed(2)}
      </span>
      <span className="text-xl font-bold text-red-600">
        ${discountedPrice.toFixed(2)}
      </span>
    </div>
  );
};
