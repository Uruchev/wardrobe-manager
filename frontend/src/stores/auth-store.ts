import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  gender?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  
  login: (user, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, isAuthenticated: true });
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    set({ user: null, isAuthenticated: false });
  },
  
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');
      
      if (userStr && token) {
        try {
          const user = JSON.parse(userStr);
          set({ user, isAuthenticated: true, isHydrated: true });
          return;
        } catch (e) {
          // Invalid user data
        }
      }
    }
    set({ isHydrated: true });
  },
}));
