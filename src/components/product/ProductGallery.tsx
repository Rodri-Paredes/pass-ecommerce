import { optimizeImageUrl } from '../../lib/imageOptimizer';

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const valid = [...new Set(images.filter(Boolean))];
  return <div className="-mx-4 sm:mx-0"><div className="flex snap-x snap-mandatory gap-px overflow-x-auto scrollbar-hide lg:grid lg:grid-cols-2 lg:overflow-visible">{valid.map((image, index) => <div key={`${image}-${index}`} className={`relative aspect-[3/4] w-[88vw] shrink-0 snap-center overflow-hidden bg-[#f1f1f1] sm:w-[70vw] lg:w-auto ${index === 0 && valid.length % 2 === 1 ? 'lg:col-span-2 lg:aspect-[4/5]' : ''}`}><img src={optimizeImageUrl(image, { width: index === 0 ? 1200 : 800, quality: 82 })} alt={`${name} ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} className="h-full w-full object-cover" /></div>)}</div>{valid.length > 1 && <p className="mt-2 px-4 text-right text-[9px] uppercase tracking-[0.16em] text-black/40 lg:hidden">Desliza para ver más →</p>}</div>;
}
