export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // DEFINIR ENV VARIABLES EN CLOUDFLARE DASHBOARD:
    // SUPABASE_URL: https://[PROJECT_ID].supabase.co
    const SUPABASE_URL = env.SUPABASE_URL || 'https://tu_proyecto.supabase.co';
    
    // 1. SEGURIDAD: Solo permitimos el acceso a imágenes públicas del bucket
    // Bloqueamos acceso a auth, rest y llamadas a la BD
    if (!url.pathname.startsWith('/storage/v1/object/public/')) {
      return new Response('Acceso no autorizado: Solo se permiten imágenes públicas.', { status: 403 });
    }

    // 2. CONSTRUIR URL DESTINO
    // Reconstruimos la URL hacia Supabase manteniendo la ruta y parámetros (query strings)
    const targetUrl = new URL(url.pathname + url.search, SUPABASE_URL);
    
    // Extraemos la request y preparamos una Request limpia para la caché local del edge
    // Omitimos headers del cliente que puedan impedir la caché correcta
    const cacheKey = new Request(targetUrl.toString(), request);
    const cache = caches.default;

    // 3. RECUPERAR DE CACHÉ EDGE
    let response = await cache.match(cacheKey);

    if (!response) {
      // 4. SI NO ESTÁ EN CACHÉ = FETCH DATA DESDE SUPABASE
      // Forzamos un GET puro hacia Supabase
      const supabaseRequest = new Request(targetUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': request.headers.get('Accept') || 'image/webp,*/*;q=0.8',
        }
      });
      
      response = await fetch(supabaseRequest);
      
      if (response.ok) {
        // Clonamos la respuesta de Supabase para poder modificar sus headers
        response = new Response(response.body, response);
        
        // --- LA MAGIA: HEADERS DE CACHÉ AGRESIVOS ---
        // 'public': cacheable en cualquier parte (CDN, Browser)
        // 'max-age=31536000': 1 año guardado en el navegador del cliente
        // 's-maxage=31536000': 1 año guardado en los Edge Nodes de Cloudflare
        // 'immutable': no volverá a verificar cambios de ese asset
        response.headers.set(
          'Cache-Control', 
          'public, max-age=31536000, s-maxage=31536000, immutable'
        );
        
        // Prevenir envío de cookies u origen local que afecten la inmutabilidad de la caché
        response.headers.delete('Set-Cookie');
        response.headers.delete('Cache-Control'); // Remove possible duplicate Supabase header
        
        // Volvemos a setear para seguridad
        response.headers.set('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
        
        // 5. GUARDAR LA RESPUESTA EN CACHÉ (No bloquea el envío al cliente)
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }
    }

    // Devolver la imagen al cliente
    return response;
  }
};