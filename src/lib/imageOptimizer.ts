/**
 * Reescribe las URLs de Supabase Storage para pasar por images.weserv.nl
 * — CDN gratuito y sin registro que cachea imágenes globalmente.
 * — Reduce el egress de Supabase a prácticamente 0.
 * — Ventaja adicional: redimensiona y comprime la imagen al tamaño real de display.
 */
export function optimizeImageUrl(
  src: string | undefined | null,
  opts: { width?: number; quality?: number } = {}
): string {
  if (!src) return '';

  const { width = 800, quality = 80 } = opts;

  // Solo proxear URLs de Supabase Storage (públicas)
  if (!src.includes('supabase.co/storage/v1/object/public/')) {
    return src;
  }

  // images.weserv.nl espera la URL sin el protocolo https://
  const urlSinProtocolo = src.replace(/^https?:\/\//, '');

  return `https://images.weserv.nl/?url=${encodeURIComponent(urlSinProtocolo)}&w=${width}&q=${quality}&output=webp&il`;
}

/**
 * Devuelve la URL original de Supabase a partir de una URL de weserv.nl.
 * Sirve como fallback si el CDN falla.
 */
export function getOriginalSupabaseUrl(cdnUrl: string): string {
  if (!cdnUrl) return '';
  if (!cdnUrl.includes('images.weserv.nl')) return cdnUrl;

  const params = new URL(cdnUrl).searchParams;
  const encoded = params.get('url');
  if (!encoded) return cdnUrl;

  return 'https://' + decodeURIComponent(encoded);
}
