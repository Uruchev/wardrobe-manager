import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { useWardrobeStore } from '../store';
import { ClothingItem } from '../config/supabase';
import { outfitService } from '../services/outfitService';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - spacing.lg * 3) / 3;

const CATEGORIES = [
  { id: 'tops', label: 'Горници', icon: 'shirt' },
  { id: 'bottoms', label: 'Долници', icon: 'cut' },
  { id: 'dresses', label: 'Рокли', icon: 'woman' },
  { id: 'outerwear', label: 'Връхни', icon: 'cloudy' },
  { id: 'shoes', label: 'Обувки', icon: 'footsteps' },
  { id: 'accessories', label: 'Аксесоари', icon: 'watch' },
];

const OCCASIONS = [
  { id: 'casual', label: 'Ежедневно', icon: 'home' },
  { id: 'work', label: 'Работа', icon: 'briefcase' },
  { id: 'formal', label: 'Официално', icon: 'diamond' },
  { id: 'sport', label: 'Спорт', icon: 'fitness' },
  { id: 'date', label: 'Среща', icon: 'heart' },
  { id: 'party', label: 'Парти', icon: 'musical-notes' },
];

const SEASONS = [
  { id: 'spring', label: 'Пролет', icon: 'flower' },
  { id: 'summer', label: 'Лято', icon: 'sunny' },
  { id: 'fall', label: 'Есен', icon: 'leaf' },
  { id: 'winter', label: 'Зима', icon: 'snow' },
];

export default function CreateOutfitScreen({ navigation }: any) {
  const { items } = useWardrobeStore();
  const [name, setName] = useState('');
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'items' | 'details'>('items');

  // Filter items by category
  const filteredItems = selectedCategory
    ? items.filter(item => item.category === selectedCategory)
    : items;

  // Toggle item selection
  const toggleItem = (item: ClothingItem) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  // Toggle occasion
  const toggleOccasion = (occasion: string) => {
    setSelectedOccasions(prev =>
      prev.includes(occasion)
        ? prev.filter(o => o !== occasion)
        : [...prev, occasion]
    );
  };

  // Toggle season
  const toggleSeason = (season: string) => {
    setSelectedSeasons(prev =>
      prev.includes(season)
        ? prev.filter(s => s !== season)
        : [...prev, season]
    );
  };

  // Generate outfit name suggestion
  const generateName = () => {
    const categories = [...new Set(selectedItems.map(i => i.category))];
    const mainItem = selectedItems[0];
    if (mainItem) {
      const categoryLabels: Record<string, string> = {
        tops: 'с горница',
        bottoms: 'с панталон',
        dresses: 'с рокля',
        outerwear: 'с яке',
        shoes: 'с обувки',
        accessories: 'с аксесоар',
      };
      return `Тоалет ${categoryLabels[mainItem.category] || ''} ${mainItem.color}`.trim();
    }
    return 'Нов тоалет';
  };

  // Save outfit
  const handleSave = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Грешка', 'Избери поне една дреха за тоалета');
      return;
    }

    const outfitName = name.trim() || generateName();
    setIsSubmitting(true);

    const result = await outfitService.createOutfit({
      name: outfitName,
      itemIds: selectedItems.map(i => i.id),
      occasions: selectedOccasions,
      seasons: selectedSeasons as ('spring' | 'summer' | 'fall' | 'winter')[],
      notes: notes.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      Alert.alert('Успех!', 'Тоалетът е създаден', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Грешка', result.error || 'Неуспешно създаване на тоалет');
    }
  };

  // Render item for selection
  const renderItem = ({ item }: { item: ClothingItem }) => {
    const isSelected = selectedItems.find(i => i.id === item.id);
    return (
      <TouchableOpacity
        style={[styles.itemCard, isSelected && styles.itemCardSelected]}
        onPress={() => toggleItem(item)}
      >
        <Image
          source={{ uri: item.image_no_bg_url || item.image_url }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark" size={16} color={colors.white} />
            </View>
          </View>
        )}
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render selected items preview
  const renderSelectedPreview = () => (
    <View style={styles.previewContainer}>
      <Text style={styles.previewTitle}>
        Избрани дрехи ({selectedItems.length})
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {selectedItems.map(item => (
          <View key={item.id} style={styles.previewItem}>
            <Image
              source={{ uri: item.image_no_bg_url || item.image_url }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => toggleItem(item)}
            >
              <Ionicons name="close" size={14} color={colors.white} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {step === 'items' ? 'Избери дрехи' : 'Детайли'}
        </Text>
        {step === 'items' ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              selectedItems.length === 0 && styles.nextButtonDisabled,
            ]}
            onPress={() => setStep('details')}
            disabled={selectedItems.length === 0}
          >
            <Text style={styles.nextButtonText}>Напред</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Записване...' : 'Запази'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {step === 'items' ? (
        <>
          {/* Selected preview */}
          {selectedItems.length > 0 && renderSelectedPreview()}

          {/* Category filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContainer}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategory && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Ionicons
                name="grid"
                size={16}
                color={!selectedCategory ? colors.white : colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  !selectedCategory && styles.categoryChipTextActive,
                ]}
              >
                Всички
              </Text>
            </TouchableOpacity>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={
                    selectedCategory === cat.id
                      ? colors.white
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat.id && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Items grid */}
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={styles.itemsGrid}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="shirt-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>Няма дрехи в тази категория</Text>
              </View>
            }
          />
        </>
      ) : (
        <ScrollView style={styles.detailsScroll} showsVerticalScrollIndicator={false}>
          {/* Selected items preview */}
          {renderSelectedPreview()}

          {/* Name input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Име на тоалета</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder={generateName()}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Occasions */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Повод</Text>
            <View style={styles.chipGrid}>
              {OCCASIONS.map(occasion => (
                <TouchableOpacity
                  key={occasion.id}
                  style={[
                    styles.occasionChip,
                    selectedOccasions.includes(occasion.id) && styles.occasionChipActive,
                  ]}
                  onPress={() => toggleOccasion(occasion.id)}
                >
                  <Ionicons
                    name={occasion.icon as any}
                    size={18}
                    color={
                      selectedOccasions.includes(occasion.id)
                        ? colors.white
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.occasionChipText,
                      selectedOccasions.includes(occasion.id) &&
                        styles.occasionChipTextActive,
                    ]}
                  >
                    {occasion.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Seasons */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Сезон</Text>
            <View style={styles.chipGrid}>
              {SEASONS.map(season => (
                <TouchableOpacity
                  key={season.id}
                  style={[
                    styles.seasonChip,
                    selectedSeasons.includes(season.id) && styles.seasonChipActive,
                  ]}
                  onPress={() => toggleSeason(season.id)}
                >
                  <Ionicons
                    name={season.icon as any}
                    size={18}
                    color={
                      selectedSeasons.includes(season.id)
                        ? colors.white
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.seasonChipText,
                      selectedSeasons.includes(season.id) && styles.seasonChipTextActive,
                    ]}
                  >
                    {season.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Бележки (по желание)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Добави бележки за този тоалет..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Back to items button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep('items')}
          >
            <Ionicons name="arrow-back" size={20} color={colors.accent} />
            <Text style={styles.backButtonText}>Промени избраните дрехи</Text>
          </TouchableOpacity>
        </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  nextButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  nextButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  nextButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  saveButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  previewContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  previewTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  previewItem: {
    marginRight: spacing.sm,
    position: 'relative',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    gap: spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  itemsGrid: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  itemCard: {
    width: ITEM_SIZE,
    marginRight: spacing.md,
    marginBottom: spacing.md,
  },
  itemCardSelected: {
    transform: [{ scale: 0.95 }],
  },
  itemImage: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(233, 69, 96, 0.3)',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  detailsScroll: {
    flex: 1,
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  occasionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  occasionChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  occasionChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  occasionChipTextActive: {
    color: colors.white,
  },
  seasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seasonChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  seasonChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  seasonChipTextActive: {
    color: colors.white,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  backButtonText: {
    ...typography.body,
    color: colors.accent,
  },
});
