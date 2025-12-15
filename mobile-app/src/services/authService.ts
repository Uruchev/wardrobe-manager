import { supabase } from '../config/supabase';
import { useAuthStore } from '../store';

// Типове
interface AuthResponse {
  success: boolean;
  error?: string;
}

interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

interface SignInData {
  email: string;
  password: string;
}

// Auth Service
export const authService = {
  /**
   * Регистрация на нов потребител
   */
  async signUp({ email, password, displayName }: SignUpData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { success: false, error: translateError(error.message) };
      }

      if (data.user) {
        // Създаваме профил в user_profiles таблицата
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: data.user.id,
            email: email,
            display_name: displayName || email.split('@')[0],
            preferences: {
              style_tags: [],
              favorite_colors: [],
              sizes: {}
            }
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        // Зареждаме профила
        await this.loadUserProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: 'Неуспешна регистрация' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Вход с email и парола
   */
  async signIn({ email, password }: SignInData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: translateError(error.message) };
      }

      if (data.user) {
        // Зареди профила
        await this.loadUserProfile(data.user.id);
        return { success: true };
      }

      return { success: false, error: 'Неуспешен вход' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Изход
   */
  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      useAuthStore.getState().logout();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Забравена парола
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'fashionadvisor://reset-password',
      });

      if (error) {
        return { success: false, error: translateError(error.message) };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Зареждане на потребителски профил
   */
  async loadUserProfile(userId: string): Promise<void> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (profile) {
        useAuthStore.getState().setUser(profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  },

  /**
   * Проверка на текущата сесия
   */
  async checkSession(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking session:', error);
      return false;
    }
  },

  /**
   * Обновяване на профил
   */
  async updateProfile(updates: {
    display_name?: string;
    avatar_url?: string;
    preferences?: any;
  }): Promise<AuthResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Не си влязъл в профила' };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Презареди профила
      await this.loadUserProfile(user.id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

/**
 * Превод на Supabase грешки на български
 */
function translateError(error: string): string {
  const translations: Record<string, string> = {
    'Invalid login credentials': 'Невалиден email или парола',
    'Email not confirmed': 'Моля, потвърди email адреса си',
    'User already registered': 'Вече има регистриран потребител с този email',
    'Password should be at least 6 characters': 'Паролата трябва да е поне 6 символа',
    'Unable to validate email address: invalid format': 'Невалиден email формат',
    'Email rate limit exceeded': 'Твърде много опити. Опитай по-късно.',
    'For security purposes, you can only request this once every 60 seconds': 
      'От съображения за сигурност можеш да поискаш това само веднъж на 60 секунди',
  };

  return translations[error] || error;
}

export default authService;
