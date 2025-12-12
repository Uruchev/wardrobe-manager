import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase конфигурация
const SUPABASE_URL = 'https://yusvrqkmybxntqnsxhcy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1c3ZycWtteWJ4bnRxbnN4aGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MTU0ODUsImV4cCI6MjA4MTA5MTQ4NX0.D9l9fpU7mF_ebehE13GHsTJ6RYqcivwwmztmZF_ne0I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface ClothingItem {
  id: string;
  user_id: string;
  name: string;
  category: 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories';
  subcategory?: string;
  color: string;
  secondary_color?: string;
  brand?: string;
  material?: string;
  seasons: ('spring' | 'summer' | 'fall' | 'winter')[];
  occasions: string[];
  purchase_price?: number;
  purchase_date?: string;
  image_url: string;
  image_no_bg_url?: string;
  times_worn: number;
  last_worn?: string;
  favorite: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  name: string;
  items: string[]; // ClothingItem IDs
  preview_image_url?: string;
  occasions: string[];
  seasons: ('spring' | 'summer' | 'fall' | 'winter')[];
  favorite: boolean;
  times_worn: number;
  last_worn?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  preferences: {
    style_tags: string[];
    favorite_colors: string[];
    sizes: Record<string, string>;
  };
  created_at: string;
  updated_at: string;
}
