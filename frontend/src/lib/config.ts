// App configuration

// Base path for GitHub Pages deployment
export const BASE_PATH = '/wardrobe-manager';

// API URL for n8n backend
export const API_URL = 'https://n8n.simeontsvetanovn8nworkflows.site/webhook';

// Helper to get full path with basePath
export function getPath(path: string): string {
  // Normalize path - remove trailing slashes
  const normalizedPath = path.replace(/\/+$/, '') || '/';
  
  // In browser, check if we're on GitHub Pages
  if (typeof window !== 'undefined') {
    const isGitHubPages = window.location.hostname.includes('github.io');
    if (isGitHubPages) {
      return `${BASE_PATH}${normalizedPath}`;
    }
  }
  return normalizedPath;
}

// Navigate to path with proper basePath handling
export function navigateTo(path: string): void {
  if (typeof window !== 'undefined') {
    const fullPath = getPath(path);
    console.log('Navigating to:', fullPath);
    window.location.href = fullPath;
  }
}
