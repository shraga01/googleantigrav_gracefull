/**
 * Service Worker Registration for PWA & Clinical Push Notifications
 * Platform: daily-appreciation-app (Samsung Galaxy S26 & Android PWA)
 */

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null);
  }

  return window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('PWA ServiceWorker registered with scope:', registration.scope);
        return registration;
      })
      .catch((error) => {
        console.warn('PWA ServiceWorker registration failed:', error);
        return null;
      });
  }) as unknown as Promise<ServiceWorkerRegistration | null>;
}

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}
