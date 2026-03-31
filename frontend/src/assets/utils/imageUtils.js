/**
 * Global utility for image URL normalization and Cloudinary optimization.
 * 
 * @param {string} url - The original image URL or path.
 * @param {number} [width] - Optional width for resizing.
 * @returns {string} - Optimized and normalized image URL.
 */
export const getOptimizedImage = (url, width) => {
  if (!url) return "https://via.placeholder.com/400x300?text=No+Image";

  // Handle Cloudinary URLs (Only our own or generic public ones)
  if (url.includes('cloudinary.com') && !url.includes('pplx-res.cloudinary.com')) {
    if (url.includes('/upload/')) {
      const parts = url.split('/upload/');
      let transformations = 'f_auto,q_auto';
      
      // Add width transformation if provided
      if (width) {
        transformations += `,w_${width},c_limit`;
      }
      
      return `${parts[0]}/upload/${transformations}/${parts[1]}`;
    }
    return url;
  }

  // Handle local legacy paths
  if (!url.startsWith('http')) {
    const fallbackBackendUrl = import.meta.env.MODE === 'development' 
      ? "http://localhost:5000" 
      : "https://stable-version-backend.onrender.com";
    const rawBackendUrl = import.meta.env.VITE_API_URL || fallbackBackendUrl;
    const backendUrl = rawBackendUrl.replace(/\/api$/, '');
    // Ensure no double slashes
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${backendUrl}${cleanPath}`;
  }

  return url;
};

/**
 * Lazy loading props for <img> tags.
 */
export const lazyImageProps = {
  loading: "lazy"
};
