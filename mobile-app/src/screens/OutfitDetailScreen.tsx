import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { Outfit, ClothingItem } from '../config/supabase';
import { outfitService, OutfitWithItems } from '../services/outfitService';

const { width } = Dimensions.get('window');

const OCCASION_LABELS: Record<string, string> = {
  casual: 'Ежедневно',
  work: 'Работа',
  formal: 'Официално',
  sport: 'Спорт',
  date: 'Среща',
  party: 'Парти',
};

const SEASON_LABELS: Record<string, string> = {
  spring: 'Пролет',
  summer: 'Лято',
  fall: 'Есен',
  winter: 'Зима',
};

export default function OutfitDetailScreen({ route, navigation }: any) {
  const { outfit: initialOutfit } = route.params;
  const [outfit, setOutfit] = useState<OutfitWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(initialOutfit.favorite);

  useEffect(() => {
    loadOutfitDetails();
  }, []);

  const loadOutfitDetails = async () => {
    const result = await outfitService.getOutfitWithItems(initialOutfit.id);
    if (result.success && result.data) {
      setOutfit(result.data);
      setIsFavorite(result.data.favorite);
    }
    setIsLoading(false);
  };

  const handleToggleFavorite = async () => {
    const newFavorite = !isFavorite;
    setIsFavorite(newFavorite);

    const result = await outfitService.toggleFavorite(initialOutfit.id, newFavorite);
    if (!result.success) {
      setIsFavorite(!newFavorite); // Revert on error
      Alert.alert('Грешка', result.error || 'Неуспешна промяна');
    }
  };

  const handleLogWear = async () => {
    Alert.alert(
      'Облечи тоалета',
      'Искаш ли да отбележиш, че носиш този тоалет днес?',
      [
        { text: 'Отказ', style: 'cancel' },
        {
          text: 'Да',
          onPress: async () => {
            const result = await outfitService.logWear(initialOutfit.id);
            if (result.success) {
              Alert.alert('Записано!', 'Тоалетът е отбелязан като носен днес');
              loadOutfitDetails();
            } else {
              Alert.alert('Грешка', result.error || 'Неуспешно записване');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Изтриване на тоалет',
      'Сигурен ли си, че искаш да изтриеш този тоалет?',
      [
        { text: 'Отказ', style: 'cancel' },
        {
          text: 'Изтрий',
          style: 'destructive',
          onPress: async () => {
            const result = await outfitService.deleteOutfit(initialOutfit.id);
            if (result.success) {
              navigation.goBack();
            } else {
              Alert.alert('Грешка', result.error || 'Неуспешно изтриване');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('EditOutfit', { outfit: outfit || initialOutfit });
  };

  const handleItemPress = (item: ClothingItem) => {
    navigation.navigate('ItemDetail', { item });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Зареждане...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayOutfit = outfit || initialOutfit;
  const clothingItems = outfit?.clothing_items || [];

  // Calculate total cost
  const totalCost = clothingItems.reduce(
    (sum, item) => sum + (item.purchase_price || 0),
    0
  );

  // Cost per wear
  const costPerWear =
    displayOutfit.times_worn > 0
      ? totalCost / displayOutfit.times_worn
      : totalCost;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleToggleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? colors.accent : colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Outfit Preview - Grid of items */}
        <View style={styles.previewSection}>
          <View style={styles.itemsGrid}>
            {clothingItems.length > 0 ? (
              clothingItems.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.gridItem,
                    index === 0 && clothingItems.length > 1 && styles.gridItemLarge,
                  ]}
                  onPress={() => handleItemPress(item)}
                >
                  <Image
                    source={{ uri: item.image_no_bg_url || item.image_url }}
                    style={styles.gridItemImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noItemsContainer}>
                <Ionicons name="shirt-outline" size={48} color={colors.textMuted} />
                <Text style={styles.noItemsText}>Няма дрехи в този тоалет</Text>
              </View>
            )}
          </View>
        </View>

        {/* Title and favorite */}
        <View style={styles.titleSection}>
          <Text style={styles.outfitName}>{displayOutfit.name}</Text>
          {isFavorite && (
            <View style={styles.favoriteTag}>
              <Ionicons name="heart" size={14} color={colors.accent} />
              <Text style={styles.favoriteTagText}>Любим</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{displayOutfit.times_worn}</Text>
            <Text style={styles.statLabel}>пъти носен</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{clothingItems.length}</Text>
            <Text style={styles.statLabel}>дрехи</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {costPerWear > 0 ? `${costPerWear.toFixed(0)} лв` : '-'}
            </Text>
            <Text style={styles.statLabel}>цена на носене</Text>
          </View>
        </View>

        {/* Last worn */}
        {displayOutfit.last_worn && (
          <View style={styles.infoCard}>
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.infoCardText}>
              Последно носен: {new Date(displayOutfit.last_worn).toLocaleDateString('bg-BG')}
            </Text>
          </View>
        )}

        {/* Occasions */}
        {displayOutfit.occasions && displayOutfit.occasions.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Повод</Text>
            <View style={styles.tagsRow}>
              {displayOutfit.occasions.map((occasion: string) => (
                <View key={occasion} style={styles.tag}>
                  <Text style={styles.tagText}>
                    {OCCASION_LABELS[occasion] || occasion}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Seasons */}
        {displayOutfit.seasons && displayOutfit.seasons.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Сезон</Text>
            <View style={styles.tagsRow}>
              {displayOutfit.seasons.map((season: string) => (
                <View key={season} style={[styles.tag, styles.seasonTag]}>
                  <Text style={[styles.tagText, styles.seasonTagText]}>
                    {SEASON_LABELS[season] || season}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Items list */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Дрехи в тоалета</Text>
          {clothingItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemRow}
              onPress={() => handleItemPress(item)}
            >
              <Image
                source={{ uri: item.image_no_bg_url || item.image_url }}
                style={styles.itemRowImage}
                resizeMode="cover"
              />
              <View style={styles.itemRowInfo}>
                <Text style={styles.itemRowName}>{item.name}</Text>
                <Text style={styles.itemRowMeta}>
                  {item.brand ? `${item.brand} • ` : ''}
                  {item.color}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        {displayOutfit.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Бележки</Text>
            <Text style={styles.notesText}>{displayOutfit.notes}</Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Wear button */}
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.wearButton} onPress={handleLogWear}>
          <Ionicons name="checkmark-circle" size={24} color={colors.white} />
          <Text style={styles.wearButtonText}>Облечи днес</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  previewSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 200,
  },
  gridItem: {
    width: (width - spacing.lg * 2 - spacing.md * 2 - spacing.sm) / 2 - spacing.sm,
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  gridItemLarge: {
    width: '100%',
    aspectRatio: 1.5,
  },
  gridItemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background,
  },
  noItemsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  noItemsText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  outfitName: {
    ...typography.h1,
    color: colors.textPrimary,
    flex: 1,
  },
  favoriteTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  favoriteTagText: {
    ...typography.caption,
    color: colors.accent,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  infoCardText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  detailSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagText: {
    ...typography.caption,
    color: colors.white,
  },
  seasonTag: {
    backgroundColor: colors.primary,
  },
  seasonTagText: {
    color: colors.white,
  },
  itemsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemRowImage: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  itemRowInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemRowName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  itemRowMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  notesSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  notesText: {
    ...typography.body,
    color: colors.textSecondary,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  wearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  wearButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});
