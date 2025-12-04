import axios from 'axios';
import { API_URL, navigateTo } from './config';

// Demo data for when n8n is not available
const demoGarments = [
  { id: 'g1', name: 'Бяла риза', category: 'shirt', primaryColor: 'white', season: 'all_year', style: 'business_casual', imageUrl: null, status: 'active' },
  { id: 'g2', name: 'Сини дънки', category: 'pants', primaryColor: 'blue', season: 'all_year', style: 'casual', imageUrl: null, status: 'active' },
  { id: 'g3', name: 'Черно сако', category: 'jacket', primaryColor: 'black', season: 'fall', style: 'formal', imageUrl: null, status: 'active' },
  { id: 'g4', name: 'Бяла тениска', category: 'tshirt', primaryColor: 'white', season: 'summer', style: 'casual', imageUrl: null, status: 'active' },
  { id: 'g5', name: 'Черни панталони', category: 'pants', primaryColor: 'black', season: 'all_year', style: 'business', imageUrl: null, status: 'active' },
  { id: 'g6', name: 'Синя риза', category: 'shirt', primaryColor: 'blue', season: 'all_year', style: 'business_casual', imageUrl: null, status: 'active' },
  { id: 'g7', name: 'Бежово палто', category: 'coat', primaryColor: 'beige', season: 'winter', style: 'casual', imageUrl: null, status: 'active' },
  { id: 'g8', name: 'Сив пуловер', category: 'sweater', primaryColor: 'gray', season: 'fall', style: 'casual', imageUrl: null, status: 'active' },
];

const demoOutfits = [
  { 
    id: 'o1', 
    name: 'Бизнес среща', 
    occasion: 'business', 
    season: 'all_year',
    wearCount: 5,
    items: [
      { id: 'oi1', garmentId: 'g1', garment: demoGarments[0] },
      { id: 'oi2', garmentId: 'g5', garment: demoGarments[4] },
      { id: 'oi3', garmentId: 'g3', garment: demoGarments[2] },
    ]
  },
  { 
    id: 'o2', 
    name: 'Casual уикенд', 
    occasion: 'casual', 
    season: 'all_year',
    wearCount: 12,
    items: [
      { id: 'oi4', garmentId: 'g4', garment: demoGarments[3] },
      { id: 'oi5', garmentId: 'g2', garment: demoGarments[1] },
    ]
  },
];

// Get demo response based on URL
function getDemoResponse(url: string, method: string): any {
  if (url.includes('/garments') && method === 'get') {
    return { data: demoGarments, total: demoGarments.length };
  }
  if (url.includes('/outfits') && method === 'get') {
    return { data: demoOutfits, total: demoOutfits.length };
  }
  if (url.includes('/ai/chat')) {
    return { 
      message: '👋 Здравейте! Аз съм вашият AI стилист.\n\nВиждам, че имате чудесен гардероб! За бизнес среща препоръчвам:\n\n👔 **Бяла риза** + **Черни панталони** + **Черно сако**\n\nТова е класическа комбинация, която излъчва професионализъм.\n\nЗа casual уикенд:\n👕 **Бяла тениска** + **Сини дънки**\n\nПросто и стилно! Как мога да ви помогна още?',
      sessionId: 'demo_session'
    };
  }
  return null;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and provide demo fallback
api.interceptors.response.use(
  (response) => {
    // If response is empty, try to provide demo data
    if (!response.data || (typeof response.data === 'string' && response.data.trim() === '')) {
      const demoData = getDemoResponse(response.config.url || '', response.config.method || 'get');
      if (demoData) {
        console.log('Empty response, using demo data for:', response.config.url);
        response.data = demoData;
      }
    }
    return response;
  },
  async (error) => {
    console.error('API Error:', error.message, error.response?.status);
    
    // Try to provide demo data on error
    if (error.config) {
      const demoData = getDemoResponse(error.config.url || '', error.config.method || 'get');
      if (demoData) {
        console.log('API error, using demo data for:', error.config.url);
        return { data: demoData };
      }
    }
    
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigateTo('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
