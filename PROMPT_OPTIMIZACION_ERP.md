# 🎯 Prompt para Optimización del ERP - PASS Clothing

## 📋 Contexto del Sistema Actual

Tenemos un e-commerce de ropa (PASS Clothing) que consume datos de un ERP a través de Supabase. Actualmente enfrentamos:

- ❌ Demasiadas llamadas API por cada request del frontend
- ❌ Imágenes pesadas sin optimización
- ❌ Queries N+1 al cargar productos con variantes y stock
- ❌ Sin índices optimizados en tablas críticas
- ❌ Sin vistas materializadas para queries frecuentes
- ❌ Sin CDN para imágenes

---

## 🚀 Prompt para el Equipo del ERP

**Asunto:** Optimizaciones Backend Requeridas para Mejora de Performance Web

**Para:** Equipo de Desarrollo ERP / Base de Datos

---

### 1. OPTIMIZACIÓN DE IMÁGENES (CRÍTICO)

**Problema actual:**
Las imágenes se almacenan en alta resolución (~2-5 MB cada una) y se sirven directamente al frontend sin procesamiento.

**Solución requerida:**
```
Implementar sistema de imágenes multi-resolución:

1. Al subir imagen al ERP, generar automáticamente 4 versiones:
   - thumbnail:  200x200px,  ~20 KB  (para grids/listados)
   - small:      400x400px,  ~50 KB  (para cards en mobile)
   - medium:     800x800px,  ~150 KB (para detalles de producto)
   - large:      1600x1600px, ~400 KB (para zoom/fullscreen)

2. Formato: Convertir a WebP (mejor compresión) con fallback JPG
   
3. Estructura en Supabase Storage:
   /products/{product_id}/thumbnail.webp
   /products/{product_id}/small.webp
   /products/{product_id}/medium.webp
   /products/{product_id}/large.webp
   /products/{product_id}/original.jpg (backup)

4. Campo en tabla products:
   ALTER TABLE products ADD COLUMN image_urls JSONB DEFAULT '{
     "thumbnail": "https://...",
     "small": "https://...",
     "medium": "https://...",
     "large": "https://...",
     "original": "https://..."
   }'::jsonb;

5. API: Al consultar productos, devolver solo thumbnail/small por defecto
   Endpoint separado para imágenes grandes bajo demanda
```

**Impacto esperado:** -85% en peso de imágenes, -70% en tiempo de carga

---

### 2. OPTIMIZACIÓN DE QUERIES (CRÍTICO)

**Problema actual:**
Query N+1: Para cargar 12 productos hacemos 1 + 12 + 24 queries (productos + variantes + stock)

**Solución requerida:**
```sql
-- Crear vista materializada que pre-calcula stock total
CREATE MATERIALIZED VIEW products_with_stock AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.category,
  p.image_url,
  p.created_at,
  COALESCE(SUM(s.quantity), 0) as total_stock,
  json_agg(
    json_build_object(
      'size', v.size,
      'stock', COALESCE(SUM(s.quantity), 0),
      'branches', json_agg(
        json_build_object(
          'city', s.city,
          'quantity', s.quantity
        )
      )
    )
  ) as variants_summary
FROM products p
LEFT JOIN variants v ON v.product_id = p.id
LEFT JOIN stock s ON s.variant_id = v.id
GROUP BY p.id, p.name, p.description, p.category, p.image_url, p.created_at;

-- Refrescar cada 5 minutos (o en tiempo real con triggers)
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('refresh-products-stock', '*/5 * * * *', 
  'REFRESH MATERIALIZED VIEW CONCURRENTLY products_with_stock'
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_products_stock_category ON products_with_stock(category);
CREATE INDEX idx_products_stock_created ON products_with_stock(created_at DESC);
CREATE INDEX idx_products_stock_total ON products_with_stock(total_stock) 
  WHERE total_stock > 0;
```

**Endpoint API mejorado:**
```sql
-- En lugar de hacer 37 queries, hacer 1 query:
SELECT * FROM products_with_stock 
WHERE category = 'Hoodies' 
  AND total_stock > 0
ORDER BY created_at DESC
LIMIT 12;
```

**Impacto esperado:** -97% queries (de 37 a 1), respuesta 10x más rápida

---

### 3. ÍNDICES DE BASE DE DATOS (ALTO IMPACTO)

**Problema actual:**
Queries lentas en búsquedas, filtros y ordenamiento.

**Solución requerida:**
```sql
-- Productos
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_desc ON products(created_at DESC);
CREATE INDEX idx_products_name_gin ON products USING gin(to_tsvector('spanish', name));
CREATE INDEX idx_products_active ON products(status) WHERE status = 'ACTIVO';

-- Variantes
CREATE INDEX idx_variants_product ON variants(product_id);
CREATE INDEX idx_variants_size ON variants(size);
CREATE INDEX idx_variants_composite ON variants(product_id, size);

-- Stock
CREATE INDEX idx_stock_variant ON stock(variant_id);
CREATE INDEX idx_stock_city ON stock(city);
CREATE INDEX idx_stock_quantity ON stock(quantity) WHERE quantity > 0;
CREATE INDEX idx_stock_composite ON stock(variant_id, city);

-- Drops
CREATE INDEX idx_drops_status ON drops(status) WHERE status = 'ACTIVO';
CREATE INDEX idx_drops_date ON drops(release_date DESC);

-- Órdenes (si existen)
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(created_at DESC);
CREATE INDEX idx_orders_composite ON orders(user_id, status, created_at DESC);
```

**Verificar índices existentes:**
```sql
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Impacto esperado:** Queries 5-10x más rápidas en filtros/búsquedas

---

### 4. CACHÉ EN EL ERP (MEDIO IMPACTO)

**Problema actual:**
Cada request del frontend golpea la base de datos directamente.

**Solución requerida:**
```
Implementar Redis como capa de caché:

1. Cachear queries frecuentes:
   - Lista de productos por categoría: TTL 5 minutos
   - Detalles de producto: TTL 10 minutos
   - Stock por sucursal: TTL 2 minutos
   - Drops activos: TTL 15 minutos

2. Invalidación inteligente:
   - Al crear/editar producto → invalidar cache de esa categoría
   - Al actualizar stock → invalidar cache de ese producto
   - Al cambiar status de drop → invalidar cache de drops

3. Estructura de keys:
   products:category:{category}:page:{page}
   product:detail:{product_id}
   product:stock:{product_id}
   drops:active
   
4. Ejemplo implementación (Node.js):
   const redis = require('redis');
   const client = redis.createClient();
   
   async function getProducts(category) {
     const cacheKey = `products:category:${category}`;
     const cached = await client.get(cacheKey);
     
     if (cached) return JSON.parse(cached);
     
     const data = await db.query('SELECT * FROM products WHERE category = $1', [category]);
     await client.setEx(cacheKey, 300, JSON.stringify(data)); // 5 min
     
     return data;
   }
```

**Impacto esperado:** -80% carga en base de datos, respuestas instantáneas

---

### 5. API OPTIMIZADA (ALTO IMPACTO)

**Problema actual:**
Frontend hace múltiples requests para obtener datos relacionados.

**Solución requerida:**
```
Crear endpoints agregados que devuelvan todo lo necesario en 1 request:

1. GET /api/products/catalog
   Query params: ?category=Hoodies&page=1&limit=12&sort=newest
   
   Response:
   {
     "products": [
       {
         "id": "...",
         "name": "Hoodie Básico",
         "price": 250,
         "image_urls": {
           "thumbnail": "https://...",
           "small": "https://..."
         },
         "total_stock": 45,
         "available_sizes": ["S", "M", "L", "XL"],
         "is_new": true,
         "drop": {
           "id": "...",
           "name": "Summer 2025"
         }
       }
     ],
     "pagination": {
       "total": 120,
       "page": 1,
       "pages": 10
     },
     "filters": {
       "categories": ["Hoodies", "Pantalones", "Poleras"],
       "sizes": ["XS", "S", "M", "L", "XL"],
       "price_range": { "min": 150, "max": 450 }
     }
   }

2. GET /api/products/:id/full
   Devuelve producto + todas las variantes + stock por sucursal + drop asociado
   
3. GET /api/drops/active
   Devuelve drops activos con productos incluidos (eager loading)

4. Implementar paginación cursor-based (más eficiente):
   GET /api/products?cursor=eyJpZCI6...&limit=12
   
   En lugar de:
   GET /api/products?page=5&limit=12  ← Ineficiente en páginas altas
```

**Impacto esperado:** -90% requests del frontend, UX más fluida

---

### 6. CDN PARA ASSETS (CRÍTICO)

**Problema actual:**
Imágenes se sirven directamente desde Supabase Storage (lento, caro).

**Solución requerida:**
```
Configurar Cloudflare CDN o Cloudinary:

Opción A - Cloudflare (gratis):
1. Proxy de Supabase Storage a través de Cloudflare
2. Cache automático de imágenes
3. Compresión automática
4. WebP/AVIF automático según browser

Opción B - Cloudinary (mejor, pero pago):
1. Migrar imágenes a Cloudinary
2. URLs transformables on-the-fly:
   https://res.cloudinary.com/passstreetwear/image/upload/
     w_400,h_400,c_fill,f_auto,q_auto/
     product-abc123.jpg
   
3. Transformaciones automáticas:
   - f_auto: Formato automático (WebP si soportado)
   - q_auto: Calidad automática según red
   - w_400: Resize on-demand
   
4. Caché global en +200 ubicaciones

Configuración Supabase + Cloudflare:
1. En panel de Supabase: Settings → Storage → Enable CDN
2. Configurar CNAME: cdn.passstreetwear.com → supabase-cdn.com
3. Cache-Control headers: max-age=31536000 (1 año)
```

**Impacto esperado:** -70% tiempo de carga de imágenes, menor costo

---

### 7. MONITOREO Y LOGS (RECOMENDADO)

**Problema actual:**
No sabemos qué queries son lentas ni cuántas veces se ejecutan.

**Solución requerida:**
```sql
-- Activar logging de queries lentas en PostgreSQL
ALTER SYSTEM SET log_min_duration_statement = 100; -- 100ms
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d ';
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- Ver queries más lentas
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;

-- Instalar extensión para estadísticas
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

**Herramientas recomendadas:**
- **Supabase Dashboard:** Ver queries lentas en "Database" → "Query Performance"
- **pgAnalyze:** Servicio externo para análisis profundo
- **DataDog/NewRelic:** APM para monitoreo en tiempo real

---

### 8. COMPRESIÓN DE RESPUESTAS (BAJO ESFUERZO, ALTO IMPACTO)

**Problema actual:**
Respuestas JSON grandes sin comprimir.

**Solución requerida:**
```javascript
// En servidor Node.js/Express
const compression = require('compression');
app.use(compression({
  level: 6, // Balance entre compresión y CPU
  threshold: 1024, // Solo comprimir > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Configurar headers
res.setHeader('Content-Encoding', 'gzip');
res.setHeader('Vary', 'Accept-Encoding');
```

**Impacto esperado:** -70% tamaño de respuestas JSON

---

### 9. RATE LIMITING (SEGURIDAD + PERFORMANCE)

**Problema actual:**
Sin protección contra abuso de API.

**Solución requerida:**
```javascript
const rateLimit = require('express-rate-limit');

// Rate limit general
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: 'Demasiadas peticiones, intenta de nuevo en 15 minutos'
});

// Rate limit para búsquedas (más restrictivo)
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 20, // 20 búsquedas por minuto
});

app.use('/api/', apiLimiter);
app.use('/api/products/search', searchLimiter);
```

---

### 10. PAGINACIÓN CURSOR-BASED (RECOMENDADO)

**Problema actual:**
`OFFSET` es ineficiente en páginas altas (página 100 = skip 1200 rows).

**Solución requerida:**
```sql
-- Mal (OFFSET - lento en páginas altas):
SELECT * FROM products 
WHERE category = 'Hoodies'
ORDER BY created_at DESC
LIMIT 12 OFFSET 120;  -- Página 10: Lee 132 rows, devuelve 12

-- Bien (Cursor - siempre rápido):
SELECT * FROM products 
WHERE category = 'Hoodies'
  AND created_at < '2025-11-01T00:00:00Z'  -- Cursor de la página anterior
ORDER BY created_at DESC
LIMIT 12;  -- Lee solo 12 rows

-- API endpoint:
GET /api/products?category=Hoodies&cursor=2025-11-01T00:00:00Z&limit=12

Response:
{
  "products": [...],
  "next_cursor": "2025-10-15T10:30:00Z",
  "has_more": true
}
```

---

## 📊 PRIORIZACIÓN (Esfuerzo vs Impacto)

### 🔴 CRÍTICO - Implementar Primero (Semana 1)
1. ✅ Vista materializada `products_with_stock` → -97% queries
2. ✅ Índices en tablas principales → 5-10x más rápido
3. ✅ CDN para imágenes (Cloudflare) → -70% tiempo carga

**Impacto:** -80% en tiempo de respuesta API

### 🟡 IMPORTANTE - Implementar Después (Semana 2)
4. ✅ Sistema multi-resolución de imágenes → -85% peso
5. ✅ Endpoints agregados optimizados → -90% requests frontend
6. ✅ Compresión Gzip en respuestas → -70% tamaño payloads

**Impacto:** -60% en tiempo de carga total

### 🟢 RECOMENDADO - Implementar Luego (Semana 3-4)
7. ✅ Redis para caché → -80% carga DB
8. ✅ Paginación cursor-based → Mejor en listados largos
9. ✅ Rate limiting → Protección y estabilidad
10. ✅ Monitoreo con pg_stat_statements → Visibilidad

**Impacto:** +20% mejora adicional + mejor observabilidad

---

## 🧪 TESTING DE OPTIMIZACIONES

### Benchmark Actual (Antes)
```bash
# Query de productos con variantes y stock
Time: 450ms (promedio)
Queries ejecutadas: 37
Tamaño respuesta: 850 KB

# Query con imagen original
Time: 2.3s (carga completa)
Imagen: 3.5 MB
```

### Benchmark Esperado (Después)
```bash
# Con vista materializada + índices
Time: 45ms (-90%)
Queries ejecutadas: 1 (-97%)
Tamaño respuesta (gzip): 120 KB (-86%)

# Con CDN + multi-resolución
Time: 350ms (-85%)
Imagen (thumbnail): 20 KB (-99%)
```

### Cómo Medir
```sql
-- Ver tiempo de query actual
EXPLAIN ANALYZE
SELECT * FROM products 
WHERE category = 'Hoodies'
LIMIT 12;

-- Comparar con vista materializada
EXPLAIN ANALYZE
SELECT * FROM products_with_stock
WHERE category = 'Hoodies'
LIMIT 12;
```

---

## 📝 CHECKLIST DE ENTREGA

Antes de considerar completa la optimización:

- [ ] Vista materializada `products_with_stock` creada y programada
- [ ] 15+ índices creados en tablas críticas
- [ ] Sistema multi-resolución de imágenes implementado
- [ ] CDN configurado (Cloudflare o Cloudinary)
- [ ] Endpoints agregados `/catalog`, `/products/:id/full`
- [ ] Compresión Gzip activada en API
- [ ] Redis configurado para caché (opcional pero recomendado)
- [ ] Rate limiting implementado
- [ ] Monitoreo de queries lentas activo
- [ ] Documentación de nuevos endpoints
- [ ] Testing de performance antes/después

---

## 🎯 MÉTRICAS DE ÉXITO

### KPIs a Medir
```
Query Response Time:     450ms → 45ms  (✅ -90%)
Database Load:           100% → 20%    (✅ -80%)
API Response Size:       850KB → 120KB (✅ -86%)
Image Load Time:         2.3s → 350ms  (✅ -85%)
Requests per Page Load:  37 → 3        (✅ -92%)
```

### Objetivo Final
```
✅ Lighthouse Performance:  78 → 95+
✅ LCP (Largest Contentful Paint): 2.8s → <1.2s
✅ Costo Supabase: $200/mes → $50/mes (-75%)
✅ Tasa de conversión: +20-30% (páginas rápidas)
```

---

## 📞 CONTACTO Y SEGUIMIENTO

**Requester:** Equipo Frontend PASS Clothing  
**Fecha límite:** 2 semanas (prioridades críticas)  
**Reunión de seguimiento:** Cada viernes para revisar progreso  

**Preguntas técnicas:**
- Slack: #backend-optimization
- Email: dev@passstreetwear.com

---

## 🔗 REFERENCIAS ÚTILES

- [Supabase Performance Best Practices](https://supabase.com/docs/guides/platform/performance)
- [PostgreSQL Indexing Strategies](https://www.postgresql.org/docs/current/indexes.html)
- [Redis Caching Patterns](https://redis.io/docs/manual/patterns/)
- [Cloudinary Image Optimization](https://cloudinary.com/documentation/image_optimization)
- [Database View Materialization](https://www.postgresql.org/docs/current/sql-creatematerializedview.html)

---

**¿Dudas sobre alguna optimización?** Disponible para reunión técnica para explicar implementación detallada.
