export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const SUPABASE_URL = env.SUPABASE_URL;

    // Validación de entorno
    if (!SUPABASE_URL) {
      return new Response('Error de configuración en Cloudflare: SUPABASE_URL no definida', { status: 500 });
    }

    // SEGURIDAD: Solo permitir acceso a imágenes públicas de Supabase Storage
    // Bloquea explícitamente /rest/, /auth/ y cualquier otra ruta sensible
    if (!url.pathname.startsWith('/storage/v1/object/public/')) {
      return new Response('Acceso no autorizado: Solo se permiten imágenes públicas.', { status: 403 });
    }

    // Construir la URL destino agregando el path y query parameters (si existen)
    const targetUrl = new URL(url.pathname + url.search, SUPABASE_URL);
    
    // Configurar la petición limpia para la caché local de Edge
    const cacheKey = new Request(targetUrl.toString(), request);
    const cache = caches.default;

    try {
      // 1. Intentar servir desde EDGE CACHE
      let response = await cache.match(cacheKey);

      if (!response) {
        // 2. FETCH DATA DESDE SUPABASE = Si no está en cache (MISS)
        const supabaseRequest = new Request(targetUrl.toString(), {
          method: 'GET',
          headers: {
            // Pasar los headers de formato preferidos por el navegador (ej: webp/avif)
            'Accept': request.headers.get('Accept') || 'image/webp,*/*;q=0.8',
          }
        });
        
        response = await fetch(supabaseRequest);
        
        if (response.ok) {
          // Clonar respuesta de Supabase para poder modificar headers restrictivos
          response = new Response(response.body, response);
          
          // LA MAGIA DE CACHÉ
          // public: cacheable en cualquier parte (CDN, Browser)
          // max-age/s-maxage: 1 año guardado en navegador del usuario / Edge de Cloudflare
          // immutable: No requiere comprobación de validación al origen
          response.headers.set(
            'Cache-Control', 
            'public, max-age=31536000, s-maxage=31536000, immutable'
          );
          
          // Eliminar cookies para evitar leaks y problemas de caché en redes públicas
          response.headers.delete('Set-Cookie');
          response.headers.delete('Cache-Control'); // Remover el original para evitar duplicidad
          
          // Volver a setear tras el delete para asegurar
          response.headers.set('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
          
          // 3. GUARDAR EN EDGE CACHE PARA FUTUROS USUARIOS (Fire-and-forget)
          ctx.waitUntil(cache.put(cacheKey, response.clone()));
        }
      }

      // Devolver imagen
      return response;
    } catch (error) {
      // Manejo de errores globales
      console.error("Worker error:", error.message);
      return new Response('Error interno procesando la solicitud de imagen.', { status: 500 });
    }
  }
};
