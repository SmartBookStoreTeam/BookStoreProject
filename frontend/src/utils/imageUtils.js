
/**
 * Helper to get proper image source URL
 * Handles full URLs, blob objects (previews), and relative paths from backend
 */
export const getImageSrc = (img) => {
  if (!img) return null;
  
  // If it's already a full URL (Google auth, S3, external) or data URI
  if (typeof img === "string" && (img.startsWith("http") || img.startsWith("data:"))) {
    return img;
  }
  
  // If it's a file object or blob (from user uploads before save)
  if (img instanceof File || img instanceof Blob) {
    return URL.createObjectURL(img);
  }

  // Handle object structure from API/State
  if (typeof img === "object") {
    return img.base64 || img.preview || img.url || null;
  }

  // Relative path from backend
  if (typeof img === "string") {
    // In production, VITE_API_URL should be set (e.g. https://api.mysite.com/api)
    // We strip the /api suffix to get the base URL for uploads
    const apiUrl = import.meta.env.VITE_API_URL;
    const baseUrl = apiUrl.replace(/\/api\/?$/, ""); 
    
    // Ensure we don't have double slashes if img starts with /
    const cleanImgPath = img.startsWith("/") ? img.slice(1) : img;
    
    return `${baseUrl}/uploads/${cleanImgPath}`;
  }
  
  return img;
};
