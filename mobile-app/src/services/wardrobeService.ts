import { supabase, ClothingItem } from '../config/supabase';
import { useWardrobeStore } from '../store';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { Platform } from 'react-native';

interface ServiceResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export const wardrobeService = {
  /**
   * Зареждане на всички дрехи на потребителя
   */
  async loadItems(): Promise<ServiceResponse<ClothingItem[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Не си влязъл в профила' };

      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      useWardrobeStore.getState().setItems(data || []);
      return { success: true, data: data || [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Качване на изображение в Supabase Storage
   */
  async uploadImage(uri: string, itemId: string): Promise<ServiceResponse<string>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Не си влязъл в профила' };

      let fileData: ArrayBuffer;
      let ext = 'jpg';
      let contentType = 'image/jpeg';

      if (Platform.OS === 'web') {
        // Web: fetch the blob URL and convert to ArrayBuffer
        const response = await fetch(uri);
        const blob = await response.blob();
        fileData = await blob.arrayBuffer();
        
        // Determine content type from blob
        if (blob.type.includes('png')) {
          ext = 'png';
          contentType = 'image/png';
        }
      } else {
        // Native: use expo-file-system
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });
        fileData = decode(base64);
        
        // Determine file extension from URI
        ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
        contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
      }

      const filePath = `${user.id}/${itemId}.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('clothing-images')
        .upload(filePath, fileData, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        return { success: false, error: uploadError.message };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('clothing-images')
        .getPublicUrl(filePath);

      return { success: true, data: publicUrl };
    } catch (error: any) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Добавяне на нова дреха
   */
  async addItem(item: Omit<ClothingItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<ClothingItem>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('addItem: User not authenticated');
        return { success: false, error: 'Не си влязъл в профила' };
      }

      console.log('addItem: Inserting item for user:', user.id);
      console.log('addItem: Item data:', item);

      const { data, error } = await supabase
        .from('clothing_items')
        .insert({
          ...item,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('addItem: Supabase error:', error);
        return { success: false, error: error.message };
      }

      console.log('addItem: Success! Item added:', data);
      useWardrobeStore.getState().addItem(data);
      return { success: true, data };
    } catch (error: any) {
      console.error('addItem: Exception:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Обновяване на дреха
   */
  async updateItem(id: string, updates: Partial<ClothingItem>): Promise<ServiceResponse<ClothingItem>> {
    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      useWardrobeStore.getState().updateItem(id, data);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Изтриване на дреха (архивиране)
   */
  async deleteItem(id: string): Promise<ServiceResponse> {
    try {
      const { error } = await supabase
        .from('clothing_items')
        .update({ archived: true })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      useWardrobeStore.getState().removeItem(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Маркиране като любимо
   */
  async toggleFavorite(id: string, favorite: boolean): Promise<ServiceResponse<ClothingItem>> {
    return this.updateItem(id, { favorite });
  },

  /**
   * Записване на носене
   */
  async logWear(itemId: string): Promise<ServiceResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Не си влязъл в профила' };

      // Add to wear log
      const { error: logError } = await supabase
        .from('wear_log')
        .insert({
          user_id: user.id,
          clothing_item_id: itemId,
          worn_date: new Date().toISOString().split('T')[0],
        });

      if (logError) {
        return { success: false, error: logError.message };
      }

      // Update item's times_worn and last_worn
      const store = useWardrobeStore.getState();
      const item = store.items.find(i => i.id === itemId);
      if (item) {
        await this.updateItem(itemId, {
          times_worn: item.times_worn + 1,
          last_worn: new Date().toISOString().split('T')[0],
        });
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Изчисляване на Cost Per Wear
   */
  calculateCPW(item: ClothingItem): number | null {
    if (!item.purchase_price || item.times_worn === 0) {
      return null;
    }
    return Math.round((item.purchase_price / item.times_worn) * 100) / 100;
  },

  /**
   * Филтриране по категория
   */
  getItemsByCategory(category: string): ClothingItem[] {
    const { items } = useWardrobeStore.getState();
    return items.filter(item => item.category === category);
  },

  /**
   * Получаване на статистики
   */
  getStats() {
    const { items } = useWardrobeStore.getState();
    
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
    const totalWorn = items.reduce((sum, item) => sum + item.times_worn, 0);
    const favorites = items.filter(item => item.favorite).length;
    const avgCPW = totalWorn > 0 ? totalValue / totalWorn : 0;

    const categoryBreakdown = {
      tops: items.filter(i => i.category === 'tops').length,
      bottoms: items.filter(i => i.category === 'bottoms').length,
      dresses: items.filter(i => i.category === 'dresses').length,
      outerwear: items.filter(i => i.category === 'outerwear').length,
      shoes: items.filter(i => i.category === 'shoes').length,
      accessories: items.filter(i => i.category === 'accessories').length,
    };

    // Least worn items (potential "forgotten" clothes)
    const leastWorn = [...items]
      .sort((a, b) => a.times_worn - b.times_worn)
      .slice(0, 5);

    return {
      totalItems,
      totalValue,
      totalWorn,
      favorites,
      avgCPW,
      categoryBreakdown,
      leastWorn,
    };
  },
};

export default wardrobeService;
