import { optimizeImageUrl } from '../../lib/imageOptimizer';

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const valid = [...new Set(images.filter(Boolean))];
  const singleImage = valid.length === 1;

  return (
    <div className="-mx-4 min-w-0 sm:mx-0 md:mx-auto md:w-full md:max-w-[760px]">
      <div className={singleImage
        ? 'flex justify-center px-4 sm:px-0'
        : 'flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 scrollbar-hide sm:px-0 lg:grid lg:grid-cols-2 lg:gap-2 lg:overflow-visible'}
      >
        {valid.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className={`relative aspect-square shrink-0 overflow-hidden bg-[#f1f1f1] ${singleImage
              ? 'w-[72vw] max-w-[260px] sm:w-[52vw] sm:max-w-[360px] md:w-full md:max-w-[380px] lg:max-w-[440px]'
              : 'w-[72vw] max-w-[270px] snap-center sm:w-[50vw] sm:max-w-[340px] md:w-full md:max-w-[380px] lg:w-auto lg:max-w-none'}`}
          >
            <img
              src={optimizeImageUrl(image, { width: index === 0 ? 1200 : 800, quality: 82 })}
              alt={`${name} ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
              className="h-full w-full object-contain p-3 sm:p-5"
            />
          </div>
        ))}
      </div>
      {valid.length > 1 && <p className="mt-2 px-4 text-right text-[9px] uppercase tracking-[0.16em] text-black/40 sm:px-0 lg:hidden">Desliza para ver más →</p>}
    </div>
  );
}
