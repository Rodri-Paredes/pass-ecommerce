# 🎨 PASS CLOTHING - E-Commerce Platform

Tienda online de ropa urbana premium en Bolivia. Plataforma moderna construida con React, TypeScript, TailwindCSS y Supabase.

![PASS CLOTHING](https://firebasestorage.googleapis.com/v0/b/texnoexpert-a1b93.appspot.com/o/passweb%2Fpasscrisis2.jpg?alt=media&token=9d67a8b4-093f-43d5-a75a-1ad7cc4468b8)

## 🚀 Características Principales

### ✨ Funcionalidades
- 🛍️ **Catálogo de Productos** completo con categorías
- 🔍 **Búsqueda** avanzada de productos
- 🎯 **Filtros** por precio y ordenamiento
- 🖼️ **Galería de imágenes** con navegación
- 🛒 **Carrito de compras** persistente
- 📱 **Diseño responsive** para todos los dispositivos
- 🎬 **Animaciones suaves** con Framer Motion
- 🚚 **Integración con WhatsApp** para pedidos
- 📊 **Sistema de Drops** (colecciones limitadas)
- 📈 **SEO optimizado** con meta tags

### 📄 Páginas Implementadas
- Inicio
- Tienda (con filtros y búsqueda)
- Producto (con galería)
- Drops (colecciones)
- Envíos
- Devoluciones
- Guía de Tallas
- Contacto

## 🛠️ Tecnologías

- **Frontend Framework**: React 18.3.1
- **Lenguaje**: TypeScript 5.5.3
- **Routing**: React Router DOM 7.9.4
- **Gestión de Estado**: Zustand 5.0.8
- **Estilos**: TailwindCSS 3.4.1
- **Animaciones**: Framer Motion 12.23.24
- **Base de Datos**: Supabase
- **Icons**: Lucide React 0.344.0
- **Build Tool**: Vite 5.4.2

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ y npm
- Cuenta de Supabase

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/Rodri-Paredes/pass-ecommerce.git
cd pass-ecommerce
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita `.env` y agrega tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anon
```

4. **Configurar Supabase**

Ejecuta la migración en tu proyecto de Supabase:
```sql
-- Usa el archivo: supabase/migrations/20251025034404_create_pass_clothing_schema.sql
```

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
project/
├── src/
│   ├── components/
│   │   ├── cart/           # Carrito de compras
│   │   ├── common/         # Componentes reutilizables
│   │   ├── drops/          # Componentes de drops
│   │   ├── layout/         # Header, Footer, SearchBar
│   │   └── product/        # ProductCard, ProductGrid, Filters
│   ├── lib/
│   │   └── supabase.ts     # Cliente de Supabase
│   ├── pages/              # Páginas de la aplicación
│   ├── store/
│   │   └── cartStore.ts    # Estado global del carrito
│   ├── types/
│   │   └── index.ts        # Tipos TypeScript
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Punto de entrada
│   └── index.css           # Estilos globales
├── supabase/
│   └── migrations/         # Migraciones de BD
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales

- **branches**: Sucursales/tiendas físicas
- **drops**: Colecciones limitadas
- **products**: Catálogo de productos
- **product_variants**: Variantes de talla (XS-XXL)
- **stock**: Inventario por variante y sucursal
- **drop_products**: Relación entre drops y productos

Ver detalles completos en: `supabase/migrations/20251025034404_create_pass_clothing_schema.sql`

## 🎨 Categorías de Productos

- Hoodies
- Camisas
- Pantalones
- Shorts
- Accesorios
- Poleras
- Gorras
- Tops
- TrackSuit Basic

## 📱 Flujo de Compra

1. Usuario navega por productos o busca específicamente
2. Selecciona talla y cantidad
3. Agrega al carrito
4. Selecciona ciudad de entrega
5. Finaliza compra (redirige a WhatsApp con resumen)
6. Confirmación y pago se manejan vía WhatsApp

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Verificar tipos
npm run typecheck

# Linter
npm run lint
```

## 🔧 Configuración Adicional

### WhatsApp Business
El número de WhatsApp está configurado en:
```typescript
// src/components/cart/Cart.tsx
const WHATSAPP_NUMBER = '59175767850';
```

### Imágenes
Las imágenes se pueden almacenar en:
- Firebase Storage (actual)
- Supabase Storage
- CDN externo

## 📝 Mejoras Recientes

Ver `MEJORAS.md` para lista completa de mejoras implementadas.

### Highlights:
- ✅ Búsqueda funcional de productos
- ✅ Galería de imágenes múltiples
- ✅ Filtros avanzados (precio, ordenamiento)
- ✅ Páginas de información completas
- ✅ SEO optimizado
- ✅ Animaciones mejoradas
- ✅ UX del carrito optimizada
- ✅ Lazy loading de imágenes

## 🔐 Seguridad

- RLS (Row Level Security) habilitado en todas las tablas
- Acceso de solo lectura para usuarios anónimos
- Escritura solo vía funciones autorizadas
- Variables de entorno para credenciales

## 🌐 Deploy

### Opción 1: Vercel
```bash
npm install -g vercel
vercel
```

### Opción 2: Netlify
```bash
npm run build
# Sube la carpeta 'dist' a Netlify
```

### Opción 3: Hosting tradicional
```bash
npm run build
# Sube la carpeta 'dist' a tu servidor
```

## 📞 Soporte

Para problemas o preguntas:
- 📧 Email: info@passclothing.com
- 📱 WhatsApp: +591 75767850

## 📄 Licencia

Este proyecto es propiedad de PASS CLOTHING.

## 👥 Contribuir

Si deseas contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

**Hecho con ❤️ para PASS CLOTHING** 🇧🇴
