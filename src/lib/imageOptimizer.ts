/**
 * Reescribe las URLs de Supabase Storage para utilizar nuestro CDN de Cloudflare
 * Esto reduce a cero el consumo de Egress (transferencia).
 * Si no es una URL de Supabase, la devuelve intacta.
 */
export function optimizeImageUrl(
  src: string | undefined | null,
  opts: { width?: number; quality?: number } = {}
): string {
  if (!src) return '';
  
  // SOLUCIÓN TEMPORAL: Retornar directo de Supabase para arreglar el Error 500
  return src;
  
  // Debes de habilitar y configurar estas env vars en Vercel y local
  // Ejemplo: VITE_SUPABASE_CDN_URL="https://cdn.passtreetwear.com"
  const CDN_DOMAIN = import.meta.env.VITE_SUPABASE_CDN_URL || 'https://cdn.tu-dominio.com';
  
  // Capturamos el dominio base de Supabase configurado en el proyecto
  const SUPABASE_PROJECT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://[PROJECT_ID].supabase.co';
  
  // Revisa si es una imagen del bucket público de Supabase
  if (src.includes(SUPABASE_PROJECT_URL) && src.includes('/storage/v1/object/public/')) {
    
    // Opcional: Versionado por hash. Esto fuerza a la cache a limpiar imagenes actualizadas 
    // pero con el mismo nombre y ruta.
    // Si tu bd o storage agrega algo unico puedes obviarlo.
    const urlConCdn = src.replace(SUPABASE_PROJECT_URL, CDN_DOMAIN);
    
    // Si tu app no versiona assets, quítale el cache_bust
    // const unbust = new URL(urlConCdn);
    // unbust.searchParams.set('v', '1');
    // return unbust.toString();

    // Retorna la URL reescrita hacia Cloudflare Worker Edge
    return urlConCdn;
  }

  // Si usamos un proxy de ERP u otras cosas no publicas, vuele la original
  return src;
}

/**
 * Función auxiliar para recuperar la URL directa original hacia Supabase.
 * Sirve como fallback en tu UI (LazyImage) si es que falla la petición al CDN Cloudflare.
 */
export function getOriginalSupabaseUrl(cdnUrl: string): string {
  if (!cdnUrl) return '';
  
  const CDN_DOMAIN = import.meta.env.VITE_SUPABASE_CDN_URL || 'https://cdn.tu-dominio.com';
  const SUPABASE_PROJECT_URL = import.meta.env.VITE_SUPABASE_URL || 'https://[PROJECT_ID].supabase.co';
  
  if (cdnUrl.includes(CDN_DOMAIN)) {
    return cdnUrl.replace(CDN_DOMAIN, SUPABASE_PROJECT_URL);
  }
  
  return cdnUrl;
}
