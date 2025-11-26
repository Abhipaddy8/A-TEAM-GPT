/**
 * Centralized UTM parameter utilities
 * Provides reusable functions for capturing, storing, and managing UTM parameters
 * across the application for consistent tracking and GHL integration
 */

export interface UTMParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

/**
 * Get UTM parameters from URL query string
 * @returns UTM parameters found in current URL
 */
export function getUtmFromUrl(): UTMParams {
  const searchParams = new URLSearchParams(window.location.search);
  const params: UTMParams = {};

  if (searchParams.has('utm_source')) params.utmSource = searchParams.get('utm_source')!;
  if (searchParams.has('utm_medium')) params.utmMedium = searchParams.get('utm_medium')!;
  if (searchParams.has('utm_campaign')) params.utmCampaign = searchParams.get('utm_campaign')!;

  return params;
}

/**
 * Read UTM parameters from sessionStorage
 * @returns Stored UTM parameters or empty object if none found
 */
export function getStoredUtm(): UTMParams {
  try {
    const stored = sessionStorage.getItem('utm_params');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error('[UTM] Failed to read stored params:', e);
    return {};
  }
}

/**
 * Store UTM parameters in sessionStorage
 * @param params - UTM parameters to store
 */
export function storeUtm(params: UTMParams): void {
  try {
    if (Object.keys(params).length > 0) {
      sessionStorage.setItem('utm_params', JSON.stringify(params));
      console.log('[UTM] Stored params:', params);
    }
  } catch (e) {
    console.error('[UTM] Failed to store params:', e);
  }
}

/**
 * Capture and store UTM parameters (URL takes priority over stored)
 * @returns Merged UTM parameters
 */
export function captureUtm(): UTMParams {
  const storedParams = getStoredUtm();
  const urlParams = getUtmFromUrl();

  // Merge: URL params override stored params
  const mergedParams = { ...storedParams, ...urlParams };

  // Store merged params
  storeUtm(mergedParams);

  console.log('[UTM] Captured UTM params:', mergedParams);

  return mergedParams;
}

/**
 * Clean UTM parameters from URL (for cleaner sharing/appearance)
 * Uses history.replaceState to update browser URL without reload
 */
export function cleanUtmFromUrl(): void {
  const searchParams = new URLSearchParams(window.location.search);

  if (searchParams.has('utm_source') || searchParams.has('utm_medium') || searchParams.has('utm_campaign')) {
    searchParams.delete('utm_source');
    searchParams.delete('utm_medium');
    searchParams.delete('utm_campaign');

    const newUrl = window.location.pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
    window.history.replaceState({}, '', newUrl);
    console.log('[UTM] Cleaned URL');
  }
}

/**
 * Clear stored UTM parameters from sessionStorage
 */
export function clearStoredUtm(): void {
  try {
    sessionStorage.removeItem('utm_params');
    console.log('[UTM] Cleared stored params');
  } catch (e) {
    console.error('[UTM] Failed to clear stored params:', e);
  }
}

/**
 * Check if UTM parameters exist
 * @returns true if any UTM parameters are found
 */
export function hasUtmParams(): boolean {
  const params = getStoredUtm();
  return Object.keys(params).length > 0;
}
