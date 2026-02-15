import { Elysia } from 'elysia';

/**
 * Security headers plugin (Helmet-like functionality for Elysia)
 * Adds security-related HTTP headers to protect against common vulnerabilities
 */
export const security = () =>
  new Elysia({ name: 'security' }).onAfterHandle({ as: 'global' }, ({ set }) => {
    // Prevent clickjacking attacks
    set.headers['X-Frame-Options'] = 'SAMEORIGIN';

    // Prevent MIME type sniffing
    set.headers['X-Content-Type-Options'] = 'nosniff';

    // Enable XSS protection (legacy browsers)
    set.headers['X-XSS-Protection'] = '1; mode=block';

    // Referrer policy
    set.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

    // Content Security Policy for API (strict)
    set.headers['Content-Security-Policy'] = "default-src 'none'; frame-ancestors 'none'";

    // Permissions Policy (formerly Feature Policy)
    set.headers['Permissions-Policy'] =
      'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()';

    // Remove X-Powered-By header to avoid fingerprinting
    delete set.headers['X-Powered-By'];
  });
