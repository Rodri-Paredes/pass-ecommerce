#!/bin/bash

echo "🚀 Pre-Deploy Checklist para PASS CLOTHING"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# Check 1: Node modules installed
echo "✓ Verificando node_modules..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules instalados${NC}"
else
    echo -e "${RED}✗ node_modules no encontrados. Ejecuta: npm install${NC}"
    errors=$((errors+1))
fi

# Check 2: .env file exists
echo "✓ Verificando archivo .env..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Archivo .env encontrado${NC}"
    
    # Check for required variables
    if grep -q "VITE_SUPABASE_URL" .env && grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        echo -e "${GREEN}✓ Variables de entorno configuradas${NC}"
    else
        echo -e "${RED}✗ Faltan variables de entorno en .env${NC}"
        errors=$((errors+1))
    fi
else
    echo -e "${YELLOW}⚠ Archivo .env no encontrado (necesario para desarrollo local)${NC}"
    warnings=$((warnings+1))
fi

# Check 3: Build test
echo "✓ Probando build de producción..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Build exitoso${NC}"
    rm -rf dist
else
    echo -e "${RED}✗ Error en build. Ejecuta: npm run build${NC}"
    errors=$((errors+1))
fi

# Check 4: TypeScript check
echo "✓ Verificando TypeScript..."
if npm run typecheck > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Sin errores de TypeScript${NC}"
else
    echo -e "${YELLOW}⚠ Hay errores de TypeScript. Ejecuta: npm run typecheck${NC}"
    warnings=$((warnings+1))
fi

# Check 5: Important files
echo "✓ Verificando archivos importantes..."
files=("index.html" "package.json" "vite.config.ts" "vercel.json" "public/robots.txt")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file existe${NC}"
    else
        echo -e "${RED}✗ $file no encontrado${NC}"
        errors=$((errors+1))
    fi
done

echo ""
echo "=========================================="
echo "Resumen:"
echo -e "${RED}Errores: $errors${NC}"
echo -e "${YELLOW}Advertencias: $warnings${NC}"
echo ""

if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✓ ¡Todo listo para deploy!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. git add ."
    echo "2. git commit -m 'Ready for production'"
    echo "3. git push"
    echo "4. vercel --prod"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Hay errores que corregir antes de hacer deploy${NC}"
    exit 1
fi
