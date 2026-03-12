/**
 * Build an optimised Supabase Storage URL with image transformation params.
 * Falls through for non-Supabase URLs.
 *
 * Supabase Storage supports: width, height, quality, format (origin | webp)
 * Docs: https://supabase.com/docs/guides/storage/serving/image-transformations
 */
export function optimizeImageUrl(
  src: string | undefined | null,
  opts: { width?: number; quality?: number } = {}
): string {
  if (!src) return '';
  if (!src.includes('supabase.co/storage')) return src;

  const { width = 600, quality = 75 } = opts;

  // Avoid appending params twice
  if (src.includes('width=') || src.includes('quality=')) return src;

  // Use the /render/image/public endpoint for on-the-fly transforms
  // Original: …/storage/v1/object/public/<bucket>/<path>
  // Render:   …/storage/v1/render/image/public/<bucket>/<path>?width=…&quality=…
  const renderUrl = src.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );

  const separator = renderUrl.includes('?') ? '&' : '?';
  return `${renderUrl}${separator}width=${width}&quality=${quality}`;
}
