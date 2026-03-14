/**
 * URL base de la API.
 * - Local: usa HTTP (define VITE_API_URL en .env.local si necesitas otro valor)
 * - Producción (Netlify): debe usar HTTPS para evitar errores de "Contenido Mixto".
 *   Configura VITE_API_URL en Netlify → Site settings → Environment variables
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://healthymind10.runasp.net';
