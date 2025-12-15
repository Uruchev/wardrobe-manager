import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { useWardrobeStore } from '../store';
import { wardrobeService } from '../services/wardrobeService';
import { ClothingItem } from '../config/supabase';

const CATEGORIES = [
  { id: null, label: 'Всички', icon: 'grid' },
  { id: 'tops', label: 'Горници', icon: 'shirt' },
  { id: 'bottoms', label: 'Долници', icon: 'cut' },
  { id: 'dresses', label: 'Рокли', icon: 'woman' },
  { id: 'outerwear', label: 'Връхни', icon: 'cloudy' },
  { id: 'shoes', label: 'Обувки', icon: 'footsteps' },
  { id: 'accessories', label: 'Аксесоари', icon: 'watch' },
];

export default function WardrobeScreen({ navigation }: any) {
  const { items, isLoading, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, setLoading } =
    useWardrobeStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Зареждане на дрехите при влизане в екрана
  useEffect(() => {
    loadWardrobe();
  }, []);

  const loadWardrobe = async () => {
    setLoading(true);
    const result = await wardrobeService.loadItems();
    if (!result.success) {
      console.error('Failed to load wardrobe:', result.error);
    }
    setLoading(false);
  };

  // Филтриране на дрехи
  const filteredItems = items.filter((item) => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Групиране по категория за list view
  const groupedItems = CATEGORIES.filter((c) => c.id !== null).map((category) => ({
    ...category,
    items: items.filter((item) => item.category === category.id),
  }));

  const renderItem = ({ item }: { item: ClothingItem }) => (
    <TouchableOpacity
      style={viewMode === 'grid' ? styles.gridItem : styles.listItem}
      onPress={() => navigation.navigate('ItemDetail', { item })}
    >
      <Image
        source={{ uri: item.image_no_bg_url || item.image_url }}
        style={viewMode === 'grid' ? styles.gridImage : styles.listImage}
        resizeMode="cover"
      />
      {viewMode === 'list' && (
        <View style={styles.listItemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemMeta}>
            {item.brand ? `${item.brand} • ` : ''}
            {item.color}
          </Text>
          <View style={styles.itemStats}>
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            <Text style={styles.itemStatsText}>Носена {item.times_worn}x</Text>
          </View>
        </View>
      )}
      {item.favorite && (
        <View style={styles.favoriteIcon}>
          <Ionicons name="heart" size={16} color={colors.accent} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Моят гардероб</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list' : 'grid'}
              size={22}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddItem')}
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Търси дрехи..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Filter */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={CATEGORIES}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.label}
          renderItem={({ item: category }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={
                  selectedCategory === category.id
                    ? colors.white
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.categoryLabel,
                  selectedCategory === category.id && styles.categoryLabelActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Items Grid/List */}
      {isLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.emptySubtitle}>Зареждане на гардероба...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="shirt-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'Няма намерени резултати' : 'Гардеробът е празен'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? 'Опитай с друга ключова дума'
              : 'Добави първата си дреха, за да започнеш'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddItem')}
            >
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={styles.emptyButtonText}>Добави дреха</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          numColumns={viewMode === 'grid' ? 3 : 1}
          key={viewMode}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.itemsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    height: 44,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  categoriesContainer: {
    paddingLeft: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    gap: spacing.xs,
    ...shadows.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  categoryLabelActive: {
    color: colors.white,
    fontWeight: typography.medium,
  },
  itemsList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  gridItem: {
    flex: 1,
    margin: spacing.xs,
    aspectRatio: 0.75,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    overflow: 'hidden',
    ...shadows.sm,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  listImage: {
    width: 80,
    height: 100,
    borderRadius: borderRadius.sm,
  },
  listItemInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  itemMeta: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  itemStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  itemStatsText: {
    fontSize: typography.xs,
    color: colors.success,
  },
  favoriteIcon: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: typography.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
    ...shadows.md,
  },
  emptyButtonText: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.white,
  },
});
