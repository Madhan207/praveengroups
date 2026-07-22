/**
 * Helper utility to build proper URLs for media files (images, attachments, screenshots).
 * Resolves relative media paths dynamically using VITE_MEDIA_URL or environment defaults.
 */
export const getMediaUrl = (path) => {
  if (!path) return '';
  if (typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  const baseUrl = import.meta.env.VITE_MEDIA_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
};
