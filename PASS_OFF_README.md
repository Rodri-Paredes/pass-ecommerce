# 🔥 Funcionalidad PASS OFF - Productos con Descuento

## ✅ Implementación Completada

Se ha implementado exitosamente la funcionalidad "PASS OFF" para mostrar productos con descuento activo en el e-commerce de PASS Streetwear.

---

## 📋 Archivos Creados

### 1. **Migración de Base de Datos**
- `supabase/migrations/20260207_create_product_discounts.sql`
  - Tabla `product_discounts` para gestionar descuentos
  - Tabla `discount_products` para relación producto-descuento
  - Tabla `discount_drops` para descuentos por drop completo
  - Funciones SQL para obtener productos con descuento activo
  - Políticas RLS para seguridad

### 2. **Tipos TypeScript**
- Actualizados en `src/types/index.ts`:
  - `Discount`: Interface para descuentos
  - `DiscountProduct` y `DiscountDrop`: Relaciones
  - `ProductWithDiscount`: Producto con información de descuento calculada

### 3. **Store (Zustand)**
- `src/store/discountStore.ts`
  - Gestiona descuentos activos
  - `activeDiscountsMap`: Map con productos y sus descuentos
  - Carga automática de descuentos directos y por drop
  - Prioridad: descuentos directos sobre descuentos por drop

### 4. **Hook Personalizado**
- `src/hooks/useDiscountedProducts.ts`
  - Combina productos con descuentos activos
  - Calcula precios finales y ahorros
  - Retorna productos ordenados por mayor descuento

### 5. **Componentes UI**
- `src/components/ui/Card.tsx`: Card genérico reutilizable
- `src/components/ui/Input.tsx`: Input estilizado
- `src/components/discounts/DiscountBadge.tsx`:
  - `DiscountBadge`: Badge rojo con porcentaje
  - `DiscountPrice`: Muestra precio original tachado y precio final

### 6. **Página Pass Off**
- `src/pages/PassOffPage.tsx`
  - Header con gradiente rojo/naranja
  - Stats cards: productos, ahorro total, mayor descuento
  - Filtros: búsqueda por nombre/categoría
  - Ordenamiento: por descuento, precio o nombre
  - Grid responsive de productos
  - Estado vacío personalizado

### 7. **Navegación**
- Actualizado `src/components/layout/Header.tsx`:
  - Link "PASS OFF 🔥" en navbar desktop
  - Badge contador animado con número de productos en oferta
  - Link destacado en menú móvil
  - Íconos y animaciones
- Actualizado `src/App.tsx`:
  - Ruta `/pass-off` agregada

### 8. **Estilos**
- Actualizados en `src/index.css`:
  - Animación `slideDown` para dropdowns
  - Soporte para badges animados

---

## 🚀 Pasos para Activar la Funcionalidad

### ✅ Paso 0: Sistema de Descuentos (Ya Existe)

**IMPORTANTE**: El sistema de descuentos YA ESTÁ IMPLEMENTADO en tu base de datos con las siguientes tablas:
- ✅ `discounts` - Tabla principal de descuentos
- ✅ `discount_products` - Relación producto-descuento
- ✅ `discount_drops` - Relación drop-descuento
- ✅ Vista `products_with_active_discount`

**NO necesitas ejecutar ninguna migración SQL adicional.** El código TypeScript ya está adaptado para usar tu esquema existente.

---

### Paso 1: Verificar Tablas (Opcional)

Si quieres verificar que todo está correcto, ejecuta en Supabase SQL Editor:

```sql
-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('discounts', 'discount_products', 'discount_drops');

-- Ver estructura de discounts
\d discounts
```

### Paso 2: Crear Descuentos de Prueba

Para probar la funcionalidad, crea algunos descuentos usando tu esquema existente:

```sql
-- 1. Crear un descuento
INSERT INTO discounts (name, percentage, start_date, end_date, is_active)
VALUES (
  'Flash Sale Verano 🔥', 
  30, 
  NOW(), 
  NOW() + INTERVAL '7 days', 
  true
);

-- 2. Obtener el ID del descuento recién creado
SELECT id, name FROM discounts ORDER BY created_at DESC LIMIT 1;

-- 3. Opción A: Asociar productos individuales al descuento
-- (Reemplaza 'discount-id-aqui' y 'product-id-aqui' con IDs reales)
INSERT INTO discount_products (discount_id, product_id)
VALUES 
  ('discount-id-aqui', 'product-id-aqui'),
  ('discount-id-aqui', 'otro-product-id-aqui');
3: Instalar Dependencias

El proyecto ya usa `zustand`, verifica que todo esté instalado:

```bash
npm install
# o
yarn install
```

### Paso 4completo paso a paso:**

```sql
-- Paso 1: Obtener un producto para aplicar descuento
SELECT id, name, price FROM products LIMIT 3;

-- Paso 2: Crear descuento del 25%
INSERT INTO discounts (name, percentage, start_date, end_date, is_active)
VALUES ('Descuento PASS OFF', 25, NOW(), NOW() + INTERVAL '30 days', true)
RETURNING id;

-- Paso 3: Asociar productos (usa el ID del descuento del paso anterior)
INSERT INTO discount_products (discount_id, product_id)
VALUES ('id-del-descuento', 'id-del-producto');

-- Paso 4: Ver el resultado
SELECT 
  product_name,
  original_price,
  percentage,
  discounted_price,
  discount_source
FROM products_with_active_discount;
```

### Paso 4: Instalar Dependencias (si es necesario)

El proyecto ya usa `zustand`, pero verifica que esté instalado:

```bash
npm install
# o
yarn install
```

### Paso 5: Iniciar la Aplicación

```bash
npm run dev
# o
yarn dev
```

### Paso 5: Probar la Funcionalidad

1. Navega a **http://localhost:5173/pass-off**
2. Deberías ver la página "PASS OFF" con:
   - Header con gradiente
   - Stats cards con contador y ahorro total
   - Grid de productos con descuento
   - Filtros de búsqueda y ordenamiento

3. En el **Header** principal:
   - Verás el link "PASS OFF" con ícono 🔥
   - Badge rojo con el número de productos en oferta
   - Link también visible en menú móvil

---

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Descuentos
- Descuentos por **producto individual**
- Descuentos por **drop completo** (todos los productos del drop)
- Prioridad de descuentos (directo > por drop)
- Validación de fechas (inicio/fin)
- Estado activo/inactivo

### ✅ Vista Pass Off
- Grid responsive de productos con descuento
- Badge de porcentaje destacado
- Precio original tachado + precio final
- Ahorro calculado por producto
- Nombre de la campaña de descuento

### ✅ Estadísticas
- **Productos en Oferta**: Contador total
- **Ahorro Total Disponible**: Suma de todos los ahorros
- **Mayor Descuento**: Porcentaje máximo disponible

### ✅ Filtros y Búsqueda
- Búsqueda por nombre o categoría
- Ordenamiento por:
  - Mayor descuento (default)
  - Menor precio
  - Nombre A-Z

### ✅ Navegación
- Link destacado en navbar con badge animado
- Ruta `/pass-off` funcional
- Responsive (desktop y móvil)

---

## 🎨 Personalización

### Cambiar Colores

En `PassOffPage.tsx`, busca:
```tsx
bg-gradient-to-r from-red-600 via-orange-600 to-red-600
```

Cámbialo a tus colores de marca.

### Ajustar Badge del Header

En `Header.tsx`, línea del badge:
```tsx
<span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
  {discountCount}
</span>
```

### Modificar Grid de Productos

En `PassOffPage.tsx`, el grid usa:
```tsx
grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
```

Ajusta según tu diseño.

---

## 📊 Estructura de Base de Datos (Ya Existe)

Tu base de datos ya tiene estas tablas:

### Tabla: `discounts`
```sql
- id: UUID PRIMARY KEY
- name: TEXT (nombre de la campaña)
- percentage: NUMERIC(5,2) (0-100)
- start_date: TIMESTAMPTZ
- end_date: TIMESTAMPTZ
- is_active: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Tabla: `discount_products`
```sql
- id: UUID PRIMARY KEY
- discount_id: UUID (FK a discounts)
- product_id: UUID (FK a products)
- created_at: TIMESTAMPTZ
- UNIQUE(discount_id, product_id)
```

### Tabla: `discount_drops`
```sql
- id: UUID PRIMARY KEY
- discount_id: UUID (FK a discounts)
- drop_id: UUID (FK a drops)
- created_at: TIMESTAMPTZ
- UNIQUE(discount_id, drop_id)
```

### Vista: `products_with_active_discount`
Vista que combina automáticamente productos con sus descuentos activos (directos o por drop).

**Ventajas de tu esquema:**
- ✅ Previene solapamiento de descuentos (triggers)
- ✅ Actualiza `updated_at` automáticamente
- ✅ Validación de fechas (end_date > start_date)
- ✅ Vista optimizada para consultas
- ✅ RLS policies para seguridad

---

## 🔧 Troubleshooting

### El contador muestra 0
- Verifica que existan descuentos activos en la base de datos
- Verifica que las fechas de inicio/fin sean válidas
- Verifica que `is_active = true`

### Los productos no aparecen
- Verifica que los productos estén asociados en `discount_products` o que su drop esté en `discount_drops`
- Revisa la consola del navegador por errores

### Error al cargar descuentos
- Verifica que la migración SQL se haya aplicado correctamente
- Verifica las políticas RLS en Supabase
- Verifica la conexión a Supabase

---

## 🎉 ¡Listo!

La funcionalidad "PASS OFF" está completamente implementada y lista para usar. Los vendedores ahora pueden ver rápidamente todos los productos en oferta con precios destacados y ahorros calculados automáticamente.

**Características destacadas:**
- ✅ Gestión flexible de descuentos (por producto o drop)
- ✅ Cálculo automático de precios finales
- ✅ UI atractiva con gradientes y badges
- ✅ Filtros y búsqueda
- ✅ Responsive en todos los dispositivos
- ✅ Integración completa con el sistema existente

---

## 📞 Soporte

Si tienes alguna duda o problema, verifica:
1. Que la migración SQL se haya ejecutado correctamente
2. Que los descuentos tengan fechas válidas y estén activos
3. Que los productos estén correctamente asociados
4. La consola del navegador para errores de JavaScript
