import type { ProductWithVariants } from '../types';

export type ProductPreferenceSignal = Pick<ProductWithVariants, 'id' | 'name' | 'category' | 'price' | 'color' | 'fit' | 'product_style'>;

interface RecommendationPreferences {
  favoriteProducts: ProductPreferenceSignal[];
  recentlyViewedProducts: ProductPreferenceSignal[];
  favoriteProductIds: string[];
}

const COLOR_FAMILIES = [
  ['negro', 'black', 'carbon', 'grafito'],
  ['blanco', 'white', 'crema', 'cream', 'off white', 'hueso', 'ivory'],
  ['azul', 'blue', 'navy', 'marino', 'celeste', 'denim'],
  ['rojo', 'red', 'vino', 'wine', 'burgundy', 'bordo', 'granate'],
  ['verde', 'green', 'oliva', 'olive', 'militar'],
  ['gris', 'gray', 'grey', 'plomo', 'silver'],
  ['beige', 'arena', 'sand', 'camel', 'khaki', 'caqui'],
  ['morado', 'purple', 'lila', 'violet', 'lavanda'],
  ['rosado', 'rosa', 'pink', 'fucsia'],
  ['amarillo', 'yellow', 'mostaza', 'mustard'],
  ['naranja', 'orange'],
  ['cafe', 'brown', 'marron', 'chocolate'],
];

const STYLE_SIGNALS: [string, string[]][] = [
  ['basic', ['basic', 'blank', 'essential']],
  ['acid', ['acid', 'washed', 'wash']],
  ['sport', ['retro', 'team', 'total 90', 'blockcore', 'football', 'jersey']],
  ['ringer', ['ringer']],
  ['longsleeve', ['longsleeve', 'long sleeve', 'doble manga']],
  ['cropped', ['cropped', 'tank top', 'sleeveless']],
];

const GENERIC_NAME_WORDS = new Set([
  'polera', 'polo', 'tee', 'shirt', 'pass', 'negro', 'black', 'blanco', 'white', 'azul', 'blue',
  'navy', 'rosa', 'pink', 'rojo', 'red', 'verde', 'green', 'gris', 'gray', 'grey', 'brown', 'cafe',
  'boxy', 'regular', 'slim', 'oversize', 'oversized', 'over', 'super', 'the', 'and',
]);

function normalize(value?: string | null) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeFit(value?: string | null) {
  const fit = normalize(value).replace(/\bfit\b/g, '').trim();
  if (['oversize', 'oversized', 'over size'].includes(fit)) return 'oversize';
  if (['regular', 'clasico', 'classic'].includes(fit)) return 'regular';
  if (['slim', 'entallado'].includes(fit)) return 'slim';
  if (['boxy', 'cuadrado'].includes(fit)) return 'boxy';
  return fit;
}

function rawColorFamily(value?: string | null) {
  const color = normalize(value);
  if (!color) return '';
  const familyIndex = COLOR_FAMILIES.findIndex((family) => family.some((name) => color.includes(name)));
  return familyIndex >= 0 ? String(familyIndex) : color;
}

function productFit(product: ProductPreferenceSignal) {
  const explicitFit = normalizeFit(product.fit);
  if (explicitFit) return explicitFit;
  const name = normalize(product.name);
  if (/\bboxy\b/.test(name)) return 'boxy';
  if (/\b(oversize|oversized|over)\b/.test(name)) return 'oversize';
  if (/\bregular\b/.test(name)) return 'regular';
  if (/\bslim\b/.test(name)) return 'slim';
  if (/\b(cropped|crop)\b/.test(name)) return 'cropped';
  return '';
}

function productColor(product: ProductPreferenceSignal) {
  const explicitColor = rawColorFamily(product.color);
  if (explicitColor && explicitColor !== 'otro') return explicitColor;
  return rawColorFamily(product.name);
}

function productStyles(product: ProductPreferenceSignal) {
  const text = normalize(`${product.product_style || ''} ${product.name}`);
  const styles = new Set<string>();
  const explicitStyle = normalize(product.product_style);
  if (explicitStyle) styles.add(explicitStyle);
  STYLE_SIGNALS.forEach(([style, names]) => {
    if (names.some((name) => text.includes(name))) styles.add(style);
  });
  return [...styles];
}

function productKeywords(product: ProductPreferenceSignal) {
  return [...new Set(normalize(product.name).split(' ').filter((word) => word.length > 3 && !GENERIC_NAME_WORDS.has(word)))];
}

function countMatches(values: string[], value: string) {
  if (!value) return 0;
  return values.filter((item) => item === value).length;
}

function countShared(left: string[], right: string[]) {
  const rightValues = new Set(right);
  return left.filter((value) => rightValues.has(value)).length;
}

function priceAffinity(referencePrice: number, candidatePrice: number) {
  if (!referencePrice || !candidatePrice) return 0;
  const difference = Math.abs(referencePrice - candidatePrice) / referencePrice;
  if (difference <= 0.08) return 4;
  if (difference <= 0.2) return 2.5;
  if (difference <= 0.35) return 1;
  return 0;
}

function hasStock(product: ProductWithVariants) {
  return product.variants?.some((variant) => variant.stock?.some((stock) => stock.quantity > 0)) ?? false;
}

export function rankProductRecommendations(
  currentProduct: ProductWithVariants,
  candidates: ProductWithVariants[],
  preferences: RecommendationPreferences,
  limit = 4,
) {
  const favoriteFits = preferences.favoriteProducts.map(productFit).filter(Boolean);
  const favoriteStyles = preferences.favoriteProducts.flatMap(productStyles);
  const favoriteColors = preferences.favoriteProducts.map(productColor).filter(Boolean);
  const recentFits = preferences.recentlyViewedProducts.map(productFit).filter(Boolean);
  const recentStyles = preferences.recentlyViewedProducts.flatMap(productStyles);
  const recentColors = preferences.recentlyViewedProducts.map(productColor).filter(Boolean);
  const favoriteIds = new Set(preferences.favoriteProductIds);
  const currentFit = productFit(currentProduct);
  const currentStyles = productStyles(currentProduct);
  const currentColor = productColor(currentProduct);
  const currentKeywords = productKeywords(currentProduct);
  const currentName = normalize(currentProduct.name);

  return candidates
    .filter((candidate) => candidate.id !== currentProduct.id && !(normalize(candidate.name) === currentName && productColor(candidate) === currentColor))
    .map((candidate) => {
      const candidateFit = productFit(candidate);
      const candidateStyles = productStyles(candidate);
      const candidateColor = productColor(candidate);
      const candidateKeywords = productKeywords(candidate);
      let score = 0;

      if (currentFit && candidateFit === currentFit) score += 14;
      score += Math.min(countShared(currentStyles, candidateStyles), 2) * 5;
      if (currentColor && candidateColor === currentColor) score += 6;
      score += Math.min(countShared(currentKeywords, candidateKeywords), 3) * 3;
      score += priceAffinity(currentProduct.price, candidate.price);
      if (currentProduct.drop_id && candidate.drop_id === currentProduct.drop_id) score += 2;

      score += Math.min(countMatches(favoriteFits, candidateFit), 3) * 4;
      score += Math.min(candidateStyles.reduce((total, style) => total + countMatches(favoriteStyles, style), 0), 3) * 3;
      score += Math.min(countMatches(favoriteColors, candidateColor), 3) * 2;
      score += Math.min(countMatches(recentFits, candidateFit), 3) * 2.5;
      score += Math.min(candidateStyles.reduce((total, style) => total + countMatches(recentStyles, style), 0), 3) * 1.5;
      score += Math.min(countMatches(recentColors, candidateColor), 3);
      if (hasStock(candidate)) score += 2;
      if (favoriteIds.has(candidate.id)) score -= 1;

      return { candidate, score, createdAt: Date.parse(candidate.created_at) || 0 };
    })
    .sort((a, b) => b.score - a.score || b.createdAt - a.createdAt || a.candidate.name.localeCompare(b.candidate.name))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
