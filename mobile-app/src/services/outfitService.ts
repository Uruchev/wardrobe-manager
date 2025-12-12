import { supabase, Outfit, ClothingItem } from '../config/supabase';
import { useOutfitsStore, useWardrobeStore } from '../store';

interface ServiceResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface OutfitWithItems extends Outfit {
  clothing_items: ClothingItem[];
}

export const outfitService = {
  /**
   * Зареждане на всички тоалети на потребителя
   */
  async loadOutfits(): Promise<ServiceResponse<Outfit[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Не си влязъл в профила' };

      const { data, error } = await supabase
        .from('outfits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      useOutfitsStore.getState().setOutfits(data || []);
      return { success: true, data: data || [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Зареждане на тоалет с пълна информация за дрехите
   */
  async getOutfitWithItems(outfitId: string): Promise<ServiceResponse<OutfitWithItems>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Не си влязъл в профила' };

      // Get outfit
      const { data: outfit, error: outfitError } = await supabase
        .from('outfits')
        .select('*')
        .eq('id', outfitId)
        .eq('user_id', user.id)
        .single();

      if (outfitError) {
        return { success: false, error: outfitError.message };
      }

      // Get outfit items with clothing details
      const { data: outfitItems, error: itemsError } = await supabase
        .from('outfit_items')
        .select('clothing_item_id')
        .eq('outfit_id', outfitId);

      if (itemsError) {
        return { success: false, error: itemsError.message };
      }

      // Get full clothing item data
      const itemIds = outfitItems?.map(oi => oi.clothing_item_id) || [];
      let clothingItems: ClothingItem[] = [];

      if (itemIds.length > 0) {
        const { data: items, error: clothingError } = await supabase
          .from('clothing_items')
          .select('*')
          .in('id', itemIds);

        if (clothingError) {
          return { success: false, error: clothingError.message };
        }

        clothingItems = items || [];
      }

      return {
        success: true,
        data: {
          ...outfit,
          clothing_items: clothingItems,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Създаване на нов тоалет
   */
  async createOutfit(
    outfitData: {
      name: string;
      itemIds: string[];
      occasions?: string[];
      seasons?: ('spring' | 'summer' | 'fall' | 'winter')[];
      notes?: string;
    }
  ): Promise<ServiceResponse<Outfit>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Не си влязъл в профила' };

      // Create outfit
      const { data: outfit, error: outfitError } = await supabase
        .from('outfits')
        .insert({
          user_id: user.id,
          name: outfitData.name,
          items: outfitData.itemIds,
          occasions: outfitData.occasions || [],
          seasons: outfitData.seasons || [],
          notes: outfitData.notes,
          favorite: false,
          times_worn: 0,
        })
        .select()
        .single();

      if (outfitError) {
        return { success: false, error: outfitError.message };
      }

      // Create outfit_items relations
      const outfitItems = outfitData.itemIds.map((itemId, index) => ({
        outfit_id: outfit.id,
        clothing_item_id: itemId,
        position: index,
      }));

      const { error: relError } = await supabase
        .from('outfit_items')
        .insert(outfitItems);

      if (relError) {
        // Rollback outfit creation
        await supabase.from('outfits').delete().eq('id', outfit.id);
        return { success: false, error: relError.message };
      }

      useOutfitsStore.getState().addOutfit(outfit);
      return { success: true, data: outfit };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Актуализиране на тоалет
   */
  async updateOutfit(
    id: string,
    updates: Partial<Omit<Outfit, 'id' | 'user_id' | 'created_at'>>,
    newItemIds?: string[]
  ): Promise<ServiceResponse<Outfit>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Не си влязъл в профила' };

      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (newItemIds) {
        updateData.items = newItemIds;
      }

      const { data, error } = await supabase
        .from('outfits')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Update outfit_items if items changed
      if (newItemIds) {
        // Delete old relations
        await supabase.from('outfit_items').delete().eq('outfit_id', id);

        // Create new relations
        const outfitItems = newItemIds.map((itemId, index) => ({
          outfit_id: id,
          clothing_item_id: itemId,
          position: index,
        }));

        await supabase.from('outfit_items').insert(outfitItems);
      }

      useOutfitsStore.getState().updateOutfit(id, data);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Изтриване на тоалет
   */
  async deleteOutfit(id: string): Promise<ServiceResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Не си влязъл в профила' };

      // Delete outfit_items first
      await supabase.from('outfit_items').delete().eq('outfit_id', id);

      // Delete outfit
      const { error } = await supabase
        .from('outfits')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      useOutfitsStore.getState().removeOutfit(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Маркиране като любимо
   */
  async toggleFavorite(id: string, favorite: boolean): Promise<ServiceResponse<Outfit>> {
    return this.updateOutfit(id, { favorite });
  },

  /**
   * Записване на носене на тоалет
   */
  async logWear(outfitId: string): Promise<ServiceResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Не си влязъл в профила' };

      // Get outfit items
      const { data: outfit, error: outfitError } = await supabase
        .from('outfits')
        .select('items')
        .eq('id', outfitId)
        .single();

      if (outfitError) {
        return { success: false, error: outfitError.message };
      }

      const today = new Date().toISOString().split('T')[0];

      // Log wear for each item in the outfit
      for (const itemId of outfit.items) {
        await supabase
          .from('wear_log')
          .insert({
            user_id: user.id,
            clothing_item_id: itemId,
            outfit_id: outfitId,
            worn_date: today,
          });

        // Update item's times_worn and last_worn
        const { data: item } = await supabase
          .from('clothing_items')
          .select('times_worn')
          .eq('id', itemId)
          .single();

        await supabase
          .from('clothing_items')
          .update({
            times_worn: (item?.times_worn || 0) + 1,
            last_worn: today,
          })
          .eq('id', itemId);
      }

      // Update outfit's times_worn and last_worn
      const { data: outfitData } = await supabase
        .from('outfits')
        .select('times_worn')
        .eq('id', outfitId)
        .single();

      await supabase
        .from('outfits')
        .update({
          times_worn: (outfitData?.times_worn || 0) + 1,
          last_worn: today,
        })
        .eq('id', outfitId);

      // Refresh stores
      await this.loadOutfits();
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * AI препоръка за тоалети
   */
  async getAIRecommendations(params: {
    occasion?: string;
    weather?: string;
    mood?: string;
  }): Promise<ServiceResponse<Outfit[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Не си влязъл в профила' };

      // For now, return random outfits - AI logic will be added later
      const { data, error } = await supabase
        .from('outfits')
        .select('*')
        .eq('user_id', user.id)
        .limit(5);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Филтриране на тоалети по критерии
   */
  filterOutfits(
    outfits: Outfit[],
    filters: {
      occasion?: string;
      season?: string;
      favorite?: boolean;
    }
  ): Outfit[] {
    return outfits.filter(outfit => {
      if (filters.occasion && !outfit.occasions.includes(filters.occasion)) {
        return false;
      }
      if (filters.season && !outfit.seasons.includes(filters.season as any)) {
        return false;
      }
      if (filters.favorite !== undefined && outfit.favorite !== filters.favorite) {
        return false;
      }
      return true;
    });
  },
};
