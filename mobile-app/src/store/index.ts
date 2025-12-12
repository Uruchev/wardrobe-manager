import { create } from 'zustand';
import { ClothingItem, Outfit, UserProfile } from '../config/supabase';

// Auth Store
interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

// Wardrobe Store
interface WardrobeState {
  items: ClothingItem[];
  isLoading: boolean;
  selectedCategory: string | null;
  searchQuery: string;
  setItems: (items: ClothingItem[]) => void;
  addItem: (item: ClothingItem) => void;
  updateItem: (id: string, updates: Partial<ClothingItem>) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useWardrobeStore = create<WardrobeState>((set) => ({
  items: [],
  isLoading: false,
  selectedCategory: null,
  searchQuery: '',
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

// Outfits Store
interface OutfitsState {
  outfits: Outfit[];
  isLoading: boolean;
  currentOutfit: {
    items: ClothingItem[];
    name: string;
  };
  setOutfits: (outfits: Outfit[]) => void;
  addOutfit: (outfit: Outfit) => void;
  updateOutfit: (id: string, updates: Partial<Outfit>) => void;
  removeOutfit: (id: string) => void;
  setLoading: (loading: boolean) => void;
  addToCurrentOutfit: (item: ClothingItem) => void;
  removeFromCurrentOutfit: (itemId: string) => void;
  clearCurrentOutfit: () => void;
  setCurrentOutfitName: (name: string) => void;
}

export const useOutfitsStore = create<OutfitsState>((set) => ({
  outfits: [],
  isLoading: false,
  currentOutfit: {
    items: [],
    name: '',
  },
  setOutfits: (outfits) => set({ outfits }),
  addOutfit: (outfit) => set((state) => ({ outfits: [...state.outfits, outfit] })),
  updateOutfit: (id, updates) =>
    set((state) => ({
      outfits: state.outfits.map((outfit) =>
        outfit.id === id ? { ...outfit, ...updates } : outfit
      ),
    })),
  removeOutfit: (id) =>
    set((state) => ({
      outfits: state.outfits.filter((outfit) => outfit.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  addToCurrentOutfit: (item) =>
    set((state) => ({
      currentOutfit: {
        ...state.currentOutfit,
        items: [...state.currentOutfit.items, item],
      },
    })),
  removeFromCurrentOutfit: (itemId) =>
    set((state) => ({
      currentOutfit: {
        ...state.currentOutfit,
        items: state.currentOutfit.items.filter((item) => item.id !== itemId),
      },
    })),
  clearCurrentOutfit: () =>
    set({
      currentOutfit: { items: [], name: '' },
    }),
  setCurrentOutfitName: (name) =>
    set((state) => ({
      currentOutfit: { ...state.currentOutfit, name },
    })),
}));

// AI Chat Store
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: ClothingItem[] | Outfit[];
}

interface AIChatState {
  messages: Message[];
  isLoading: boolean;
  isListening: boolean; // За voice input
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setListening: (listening: boolean) => void;
  clearMessages: () => void;
}

export const useAIChatStore = create<AIChatState>((set) => ({
  messages: [],
  isLoading: false,
  isListening: false,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (isLoading) => set({ isLoading }),
  setListening: (isListening) => set({ isListening }),
  clearMessages: () => set({ messages: [] }),
}));

// Alias for aiService compatibility
export const useAIStore = useAIChatStore;
