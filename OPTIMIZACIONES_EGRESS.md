# Optimización de Supabase Cached Egress — PASS CLOTHING

## Problema
El proyecto excedía la cuota de **Cached Egress** de Supabase por:
- Imágenes sin comprimir cargadas directamente desde Supabase Storage
- Consultas con `SELECT *` trayendo columnas innecesarias
- Sin caché persistente: cada visita generaba nuevas consultas
- Sin Service Worker: assets re-descargados en cada visita

---

## Archivos creados

| Archivo | Descripción |
|---|---|
| `src/lib/cache.ts` | CacheManager con TTL via localStorage |
| `src/lib/imageOptimizer.ts` | Transformador de URLs de Supabase Storage |
| `public/sw.js` | Service Worker con 3 estrategias de caché |

---

## Optimizaciones implementadas

### 1. CacheManager con TTL (`src/lib/cache.ts`)
- Almacena datos en `localStorage` con clave prefijada `outsiders_`
- Cada entrada tiene `timestamp` + `ttl` configurables
- Expiración automática al leer
- Usado en: Home (drop → 1h), PassOffPage (productos → 30min)

### 2. Service Worker (`public/sw.js`)
Tres estrategias según el tipo de recurso:

| Recurso | Estrategia | Cache |
|---|---|---|
| Imágenes de Supabase Storage | Cache-first | `pass-images-v1` (máx 200 items) |
| Assets estáticos (JS, CSS, fonts) | Stale-while-revalidate | `pass-cache-v1` |
| API REST de Supabase | Network-first + fallback offline | `pass-cache-v1` |

- Registrado en producción desde `src/main.tsx`
- Solo intercepta URLs `http/https` (evita errores con extensiones de Chrome)
- FIFO eviction cuando la imagen cache supera 200 items

### 3. Optimización de imágenes (`src/lib/imageOptimizer.ts`)
Convierte URLs de Supabase Storage al endpoint de transformación:
```
/storage/v1/object/public/... 
→ /storage/v1/render/image/public/...?width=600&quality=75
```

Aplicado en:
- `LazyImage.tsx` — todas las cards de productos (600px, q75)
- `Home.tsx` — hero banner (1200px, q70), categorías (800px)
- `ProductPage.tsx` — imagen principal (800px), thumbnails (200px, q60)
- `PassOffPage.tsx` — grid de ofertas (400px)
- `DropDetailPage.tsx` — banner (1200px, q70)
- `DropCard.tsx` — cards de drops (600px)

### 4. LazyImage mejorado (`src/components/common/LazyImage.tsx`)
- `rootMargin: '200px'` — empieza a cargar 200px antes del viewport (antes: 50px)
- `decoding="async"` — no bloquea el hilo principal
- Placeholder transparente 1px en base64 (evita layout shift)
- Acepta props `width` y `quality` para control por componente

### 5. useCachedQuery mejorado (`src/hooks/useCachedQuery.ts`)
| Parámetro | Antes | Después |
|---|---|---|
| `cacheTime` default | 5 min | **10 min** |
| `staleTime` default | 0 | **2 min** |
| Persistencia | Solo memoria | **Memoria + localStorage** |
| Init desde cache | No (siempre loading) | **Sí (síncrono)** |

- ProductGrid: cacheTime 10min, staleTime 3min

### 6. Queries optimizadas (SELECT específico)
Reemplazado `SELECT *` con columnas específicas en:
- `branches` → `id, name, address, created_at`
- `drops` (standalone) → todos los campos menos los no usados
- `products_with_active_discount` → `product_id, percentage, discount_name, discount_source`

### 7. Headers de Vercel (`vercel.json`)
```
/sw.js                → Cache-Control: no-cache, must-revalidate
/:all*(jpg|png|webp…) → Cache-Control: public, max-age=31536000, immutable
/assets/*             → Cache-Control: public, max-age=31536000, immutable
```

### 8. Analytics de egress (`src/lib/analytics.ts`)
Función `logDataTransfer(endpoint, data)` que en modo desarrollo imprime:
```
📊 [egress] products|...: 45.23 KB
```
Solo activa en `dev`, silenciosa en producción.

---

## Resultado esperado

| Métrica | Antes | Después |
|---|---|---|
| Tamaño de imágenes | 1-5 MB por imagen | ~100-300 KB (−80%) |
| Consultas en visitas repetidas | 100% al servidor | ~10% (caché hit) |
| Carga en segunda visita | Re-descarga todo | Desde SW + localStorage |
| SELECT * en branches/drops | Todos los campos | Solo campos usados |

---

## Próximo paso recomendado (máximo impacto)
Migrar imágenes a **Cloudinary** (25 GB gratis/mes):
- Las imágenes dejan de consumir egress de Supabase completamente
- Las imágenes de Supabase Storage representan el **80-90% del egress total**
- Con Cloudinary: transformaciones automáticas de tamaño y formato WebP/AVIF
