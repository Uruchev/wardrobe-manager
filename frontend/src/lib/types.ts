import { GarmentCategory, Season, GarmentStyle, GarmentStatus, Occasion, GarmentColor } from './constants';

// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  age: number | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  height: number | null;
  weight: number | null;
  sizeTop: string | null;
  sizeBottom: string | null;
  sizeShoes: string | null;
  stylePreferences: GarmentStyle[] | null;
  location: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Garment types
export interface Garment {
  id: string;
  userId: string;
  name: string | null;
  category: string;
  subcategory: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  season: string;
  style: string | null;
  brand: string | null;
  size: string | null;
  imageUrl: string | null;
  thumbnailUrl?: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Outfit Item
export interface OutfitItem {
  id: string;
  outfitId: string;
  garmentId: string;
  position: number;
  garment?: Garment;
}

// Outfit types
export interface Outfit {
  id: string;
  userId: string;
  name: string;
  occasion: string | null;
  season: string | null;
  notes: string | null;
  items?: OutfitItem[];
  createdAt: string;
  updatedAt: string;
  wearCount: number;
  lastWornAt?: string | null;
}

// AI types
export interface OutfitSuggestion {
  id: string;
  garments: Garment[];
  explanation: string;
  occasionFit: 'perfect' | 'good' | 'acceptable';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: OutfitSuggestion[];
  createdAt: string;
}

export interface ChatSession {
  id: string;
  type: string;
  messages: ChatMessage[];
  createdAt: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
