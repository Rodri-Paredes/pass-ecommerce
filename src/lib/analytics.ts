// Minimal analytics helper for Google Analytics (gtag.js)
// Usage:
//  - Set VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX in your .env for production
//  - This file provides `pageview(path)` and `event(name, params)` helpers

// Default fallback uses the Measurement ID you provided. You can override via Vite env VITE_GA_MEASUREMENT_ID.
export const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string) || 'G-TP0YCEZJ36';

export function pageview(path: string) {
  try {
    if (typeof window === 'undefined') return;
    const w = window as any;
    if (!w.gtag) return;
    w.gtag('event', 'page_view', { page_path: path, send_to: GA_MEASUREMENT_ID });
  } catch (e) {
    // swallow errors to avoid breaking the app
    // console.debug('gtag pageview error', e);
  }
}

export function event(name: string, params?: Record<string, any>) {
  try {
    if (typeof window === 'undefined') return;
    const w = window as any;
    if (!w.gtag) return;
    w.gtag('event', name, { ...params, send_to: GA_MEASUREMENT_ID });
  } catch (e) {
    // console.debug('gtag event error', e);
  }
}

export default { pageview, event };
