/**
 * Utility to convert various Google Drive and Google User Content links 
 * into direct image links that can be used in <img> tags.
 */
export const getGoogleImageUrl = (url: string | undefined): string => {
  if (!url) return '';

  // 0. Handle local uploads
  if (url.includes('/uploads/')) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const host = isLocal ? 'http://localhost:8080' : 'https://api.mbgone.site';
    
    // If it's already a full URL, strip the host part or just ensure it points to the right one
    if (url.startsWith('http')) {
      const path = url.split('/uploads/')[1];
      return `${host}/uploads/${path}`;
    }
    
    // If it's a relative path with or without leading slash
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${host}${cleanUrl}`;
  }

  // 1. Handle modern googleusercontent link format
  if (url.includes('googleusercontent.com')) {
    // Ensure we use high resolution (s1200) and strip existing parameters
    return url.split('=')[0] + '=s1200';
  }

  // 2. Extract ID from various Google Drive formats
  // Patterns handled:
  // - drive.google.com/file/d/ID/view
  // - drive.google.com/file/d/ID/preview
  // - drive.google.com/open?id=ID
  // - drive.google.com/uc?id=ID
  // - drive.google.com/file/d/ID
  // - drive.google.com/a/domain.com/file/d/ID/...
  const driveIdMatch = 
    url.match(/[?&]id=([^&]+)/) || 
    url.match(/\/file\/d\/([^/?]+)/) ||  // Try /file/d/ first for higher precision
    url.match(/\/d\/([^/?]+)/);
  
  if (driveIdMatch && driveIdMatch[1]) {
    const id = driveIdMatch[1];
    // Convert to the direct content endpoint which is more reliable
    return `https://lh3.googleusercontent.com/d/${id}=s1200`;
  }

  // 3. Handle redirects or shortened links if possible
  // (Simplified: return as is if no match, browser might handle some)
  
  return url;
};

/**
 * Checks if a URL is likely a Google Drive image link.
 */
export const isGoogleDriveLink = (url: string): boolean => {
  return url.includes('drive.google.com') || url.includes('googleusercontent.com');
};
