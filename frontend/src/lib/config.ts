// App configuration
// Base path for GitHub Pages deployment
export const BASE_PATH = '/wardrobe-manager';

// API URL for n8n backend
export const API_URL = 'https://n8n.simeontsvetanovn8nworkflows.site/webhook';

// Helper to get full path with basePath
export function getPath(path: string): string {
  // In browser, check if we're on GitHub Pages
  if (typeof window !== 'undefined') {
    const isGitHubPages = window.location.hostname.includes('github.io');
    if (isGitHubPages) {
      return `${BASE_PATH}${path}`;
    }
  }
  return path;
}

// Navigate to path with proper basePath handling
export function navigateTo(path: string): void {
  if (typeof window !== 'undefined') {
    window.location.href = getPath(path);
  }
}
