import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Detects if the current device is a mobile device based on the user agent.
 * This is a common and reliable way to check for mobile devices in a web app.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;
  
  // Basic but reliable mobile detection
  return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
}

/**
 * Detects if the app is running inside an in-app browser (like Gmail, Instagram, etc.)
 * which often block authentication redirects.
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  const ua = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;
  
  // Common in-app browser signatures
  return (
    (ua.indexOf('FBAN') > -1) || // Facebook app
    (ua.indexOf('FBAV') > -1) || // Facebook app
    (ua.indexOf('Instagram') > -1) || // Instagram
    (ua.indexOf('Twitter') > -1) || // Twitter
    (ua.indexOf('GSA') > -1) || // Google Search App
    (ua.indexOf('Gmail') > -1) || // Gmail
    (/Pixel/i.test(ua) && /Build/i.test(ua) && /wv/i.test(ua)) || // Android WebView
    (/Version\/[\d\.]+.*Safari/i.test(ua) === false && /iPhone|iPad|iPod/i.test(ua) && /AppleWebKit/i.test(ua)) // Generic iOS WebView
  );
}
