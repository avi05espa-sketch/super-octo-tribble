import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Inicializar la app solo una vez (evita reinicializaciones con HMR)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };

/**
 * Devuelve la instancia de Analytics sólo en cliente. Import dinámico para evitar SSR issues.
 */
export async function getAnalyticsInstance() {
  if (typeof window === "undefined") return null;
  if (!firebaseConfig.measurementId) return null;

  try {
    const analyticsModule = await import("firebase/analytics");
    return analyticsModule.getAnalytics(app);
  } catch (e) {
    console.warn("No se pudo inicializar Firebase Analytics:", e);
    return null;
  }
}

/**
 * Helper seguro para loguear eventos (no rompe en SSR).
 * Uso: await logEventSafe('notification_received', { method: 'button' })
 */
export async function logEventSafe(eventName: string, eventParams?: Record<string, any>) {
  const analytics = await getAnalyticsInstance();
  if (!analytics) return;
  try {
    const { logEvent } = await import("firebase/analytics");
    logEvent(analytics, eventName, eventParams);
  } catch (e) {
    console.warn("logEvent falló:", e);
  }
}
