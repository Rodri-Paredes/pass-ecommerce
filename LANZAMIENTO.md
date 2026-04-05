# 🚀 CHECKLIST DE LANZAMIENTO - passstreetwear.com

## ✅ COMPLETADO

- [x] Errores de TypeScript corregidos
- [x] URLs actualizadas a passstreetwear.com
- [x] Guía de tallas solo en Pantalones
- [x] Footer optimizado y compacto
- [x] Home page responsive y profesional
- [x] Sistema de WhatsApp multi-tienda
- [x] Infinite scroll en productos
- [x] SEO meta tags actualizados

---

## 🔴 CRÍTICO - HACER ANTES DE LANZAR

### 1. **Deployment y Hosting**

**Opción Recomendada: Vercel (GRATIS y fácil)**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar dominio personalizado en dashboard
# https://vercel.com/dashboard
```

**Pasos en Vercel:**
1. Conecta tu repositorio GitHub
2. Agrega variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Configura dominio: passstreetwear.com
4. SSL se configura automáticamente

**Alternativa: Netlify**
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod
```

### 2. **Configuración de Dominio (passstreetwear.com)**

En tu proveedor de dominio (GoDaddy, Namecheap, etc.):

**Para Vercel:**
```
Tipo: A
Nombre: @
Valor: 76.76.21.21

Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
```

**Para Netlify:**
```
Tipo: A
Nombre: @
Valor: 75.2.60.5

Tipo: CNAME
Nombre: www
Valor: [tu-sitio].netlify.app
```

### 3. **Variables de Entorno en Producción**

**IMPORTANTE:** No subir el archivo `.env` a Git

En Vercel/Netlify Dashboard → Settings → Environment Variables:
```
VITE_SUPABASE_URL=https://jbdiidhseumjqdfxyzop.supabase.co
VITE_SUPABASE_ANON_KEY=[tu_key_aquí]
```

### 4. **Base de Datos Supabase**

- [ ] Verificar que todas las tablas tienen RLS (Row Level Security) configurado
- [ ] Verificar políticas de seguridad para SELECT públicos
- [ ] Verificar que Storage buckets son públicos para imágenes
- [ ] Hacer backup de la base de datos

**Políticas SQL recomendadas:**
```sql
-- Permitir lectura pública de productos
CREATE POLICY "Allow public read products" ON products
  FOR SELECT USING (true);

-- Permitir lectura pública de drops
CREATE POLICY "Allow public read drops" ON drops
  FOR SELECT USING (true);

-- Permitir lectura pública de stock
CREATE POLICY "Allow public read stock" ON stock
  FOR SELECT USING (true);
```

### 5. **Analytics y Tracking**

**Google Analytics 4 (Recomendado)**

Agregar en `index.html` antes de `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Meta Pixel (Facebook/Instagram Ads)**
```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'TU_PIXEL_ID');
fbq('track', 'PageView');
</script>
```

---

## 🟡 IMPORTANTE - Hacer en las Primeras 24h

### 6. **SEO Post-Lanzamiento**

- [ ] Crear sitemap.xml
- [ ] Configurar Google Search Console
- [ ] Configurar Google Business Profile
- [ ] Enviar sitemap a Google
- [ ] Verificar indexación

**Crear sitemap.xml:**
```bash
npm install -D vite-plugin-sitemap
```

### 7. **Rendimiento**

- [ ] Test en PageSpeed Insights: https://pagespeed.web.dev/
- [ ] Test en GTmetrix: https://gtmetrix.com/
- [ ] Optimizar imágenes grandes (comprimir con TinyPNG)
- [ ] Verificar lazy loading de imágenes

**Objetivo:** 90+ en Performance

### 8. **Seguridad**

- [ ] Verificar HTTPS funciona correctamente
- [ ] Configurar headers de seguridad
- [ ] Test de seguridad en: https://securityheaders.com/

**Headers recomendados en `vercel.json`:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 9. **Testing Cross-Browser**

Probar en:
- [ ] Chrome (Desktop y Mobile)
- [ ] Safari (iOS)
- [ ] Firefox
- [ ] Edge
- [ ] Samsung Internet (Android)

### 10. **Redes Sociales**

- [ ] Actualizar bio de Instagram con el link: https://passstreetwear.com
- [ ] Actualizar bio de TikTok con el link
- [ ] Actualizar bio de Facebook
- [ ] Crear post de lanzamiento
- [ ] Probar compartir productos (Open Graph debe verse bien)

---

## 🟢 RECOMENDADO - Próximas Semanas

### 11. **Marketing Digital**

- [ ] Crear campaña de Instagram Ads
- [ ] Crear contenido para TikTok
- [ ] Configurar Facebook Shop
- [ ] Configurar Instagram Shopping
- [ ] Email marketing (Mailchimp o similar)

### 12. **Mejoras Futuras**

**Fase 2 (Próximo mes):**
- [ ] Sistema de cupones/descuentos
- [ ] Wishlist (lista de deseos)
- [ ] Reseñas de productos
- [ ] Newsletter signup
- [ ] Blog de moda urbana
- [ ] Programa de referidos

**Fase 3 (2-3 meses):**
- [ ] App móvil (React Native)
- [ ] Sistema de puntos/loyalty
- [ ] Chat en vivo (WhatsApp Business API)
- [ ] Pasarela de pago online (opcional)

### 13. **Monitoreo y Mantenimiento**

**Herramientas a configurar:**
- [ ] Uptime monitoring: https://uptimerobot.com/ (gratis)
- [ ] Error tracking: Sentry.io
- [ ] Analytics dashboard

**Monitoreo semanal:**
- Revisar Analytics
- Revisar errores en consola del navegador
- Verificar que todas las imágenes cargan
- Revisar stock y actualizar productos

---

## 📋 COMANDOS ÚTILES

### Build y Deploy Local
```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Type checking
npm run typecheck

# Lint
npm run lint
```

### Deploy con Vercel
```bash
# Primera vez
vercel

# Producción
vercel --prod
```

### Deploy con Netlify
```bash
# Build
npm run build

# Deploy draft
netlify deploy

# Deploy producción
netlify deploy --prod
```

---

## 🎯 MÉTRICAS DE ÉXITO

**Primera Semana:**
- [ ] 1000+ visitantes únicos
- [ ] 50+ pedidos por WhatsApp
- [ ] 100+ seguidores nuevos en Instagram

**Primer Mes:**
- [ ] 5000+ visitantes únicos
- [ ] 200+ pedidos
- [ ] 500+ seguidores nuevos

**KPIs a Monitorear:**
- Tasa de conversión (visitantes → pedidos)
- Bounce rate (< 50% es bueno)
- Tiempo en sitio (> 2 min es bueno)
- Páginas por sesión (> 3 es bueno)

---

## 🆘 SOPORTE Y CONTACTOS

**Hosting Issues:**
- Vercel: https://vercel.com/support
- Netlify: https://answers.netlify.com/

**Base de Datos:**
- Supabase: https://supabase.com/support

**Dominio:**
- Tu proveedor de dominio

---

## ✨ BONUS: Post-Lanzamiento

### Optimizaciones Adicionales

1. **PWA (Progressive Web App)**
```bash
npm install -D vite-plugin-pwa
```

2. **Lazy Loading de Componentes**
```typescript
const Shop = lazy(() => import('./pages/Shop'));
```

3. **Image Optimization**
- Usar WebP en lugar de JPEG
- Implementar responsive images
- CDN para imágenes (Cloudinary/ImageKit)

4. **Performance Monitoring**
- Web Vitals tracking
- Real User Monitoring (RUM)

---

## 🎉 ¡LISTO PARA LANZAR!

Una vez completados todos los ítems CRÍTICOS (🔴), estás listo para ir live.

**Último paso antes de lanzar:**
```bash
# 1. Build de producción
npm run build

# 2. Test local del build
npm run preview

# 3. Deploy a producción
vercel --prod
# o
netlify deploy --prod
```

**¡Felicidades por tu lanzamiento! 🚀**

---

## 📞 Checklist de Comunicación Post-Lanzamiento

- [ ] Enviar mensaje a base de clientes existentes
- [ ] Post en Instagram Stories
- [ ] Post en TikTok
- [ ] Post en Facebook
- [ ] Actualizar WhatsApp Status
- [ ] Email a lista de contactos

---

**Fecha de Lanzamiento Planeada:** _______________
**Fecha de Lanzamiento Real:** _______________

**Notas:**
