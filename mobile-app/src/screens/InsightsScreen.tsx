import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { useWardrobeStore, useOutfitsStore } from '../store';
import { ClothingItem } from '../config/supabase';

const { width } = Dimensions.get('window');

const CATEGORY_LABELS: Record<string, string> = {
  tops: 'Горници',
  bottoms: 'Долници',
  dresses: 'Рокли',
  outerwear: 'Връхни',
  shoes: 'Обувки',
  accessories: 'Аксесоари',
};

const CATEGORY_COLORS: Record<string, string> = {
  tops: colors.categoryTops,
  bottoms: colors.categoryBottoms,
  dresses: colors.categoryDresses,
  outerwear: colors.categoryOuterwear,
  shoes: colors.categoryShoes,
  accessories: colors.categoryAccessories,
};

interface WardrobeStats {
  totalItems: number;
  totalValue: number;
  averageWears: number;
  mostWorn: ClothingItem | null;
  leastWorn: ClothingItem | null;
  neverWorn: ClothingItem[];
  favorites: number;
  categoryBreakdown: Record<string, number>;
  colorBreakdown: Record<string, number>;
  costPerWear: number;
  sustainability: {
    score: number;
    activeItems: number;
    dormantItems: number;
  };
}

export default function InsightsScreen({ navigation }: any) {
  const { items } = useWardrobeStore();
  const { outfits } = useOutfitsStore();

  // Calculate comprehensive statistics
  const stats: WardrobeStats = useMemo(() => {
    if (items.length === 0) {
      return {
        totalItems: 0,
        totalValue: 0,
        averageWears: 0,
        mostWorn: null,
        leastWorn: null,
        neverWorn: [],
        favorites: 0,
        categoryBreakdown: {},
        colorBreakdown: {},
        costPerWear: 0,
        sustainability: { score: 0, activeItems: 0, dormantItems: 0 },
      };
    }

    const totalValue = items.reduce((sum, i) => sum + (i.purchase_price || 0), 0);
    const totalWears = items.reduce((sum, i) => sum + i.times_worn, 0);
    const averageWears = totalWears / items.length;
    
    const sortedByWears = [...items].sort((a, b) => b.times_worn - a.times_worn);
    const mostWorn = sortedByWears[0];
    const wornItems = items.filter(i => i.times_worn > 0);
    const leastWorn = wornItems.length > 0 
      ? wornItems.sort((a, b) => a.times_worn - b.times_worn)[0] 
      : null;
    
    const neverWorn = items.filter(i => i.times_worn === 0);
    const favorites = items.filter(i => i.favorite).length;

    // Category breakdown
    const categoryBreakdown = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Color breakdown
    const colorBreakdown = items.reduce((acc, item) => {
      const color = item.color.toLowerCase();
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Cost per wear
    const itemsWithValue = items.filter(i => i.purchase_price && i.times_worn > 0);
    const costPerWear = itemsWithValue.length > 0
      ? itemsWithValue.reduce((sum, i) => sum + (i.purchase_price! / i.times_worn), 0) / itemsWithValue.length
      : 0;

    // Sustainability score (0-100)
    const activeItems = items.filter(i => i.times_worn >= 3).length;
    const dormantItems = items.filter(i => i.times_worn === 0).length;
    const sustainabilityScore = Math.round(
      ((activeItems / items.length) * 60) +
      ((1 - dormantItems / items.length) * 40)
    );

    return {
      totalItems: items.length,
      totalValue,
      averageWears,
      mostWorn,
      leastWorn,
      neverWorn,
      favorites,
      categoryBreakdown,
      colorBreakdown,
      costPerWear,
      sustainability: {
        score: sustainabilityScore,
        activeItems,
        dormantItems,
      },
    };
  }, [items]);

  // Get sustainability message
  const getSustainabilityMessage = (score: number): { text: string; icon: string; color: string } => {
    if (score >= 80) return { text: 'Отлично! Използваш гардероба си много добре!', icon: 'leaf', color: colors.success };
    if (score >= 60) return { text: 'Добре! Има място за подобрение.', icon: 'trending-up', color: colors.warning };
    if (score >= 40) return { text: 'Много дрехи не се носят. Опитай да ги комбинираш!', icon: 'alert-circle', color: colors.warning };
    return { text: 'Повечето дрехи стоят неизползвани. Време е за преосмисляне!', icon: 'warning', color: colors.error };
  };

  const sustainabilityInfo = getSustainabilityMessage(stats.sustainability.score);

  // Sort categories by count for bar chart
  const sortedCategories = Object.entries(stats.categoryBreakdown)
    .sort((a, b) => b[1] - a[1]);
  const maxCategoryCount = Math.max(...Object.values(stats.categoryBreakdown), 1);

  // Top colors
  const topColors = Object.entries(stats.colorBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Insights</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="analytics-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Няма данни за анализ</Text>
          <Text style={styles.emptyText}>
            Добави дрехи в гардероба си и започни да отбелязваш какво носиш, за да получиш персонализирани insights.
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddItem')}
          >
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={styles.addButtonText}>Добави дреха</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Insights</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Sustainability Score */}
        <View style={styles.sustainabilityCard}>
          <View style={styles.sustainabilityHeader}>
            <View style={styles.sustainabilityIcon}>
              <Ionicons name="leaf" size={24} color={colors.success} />
            </View>
            <Text style={styles.sustainabilityTitle}>Sustainability Score</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{stats.sustainability.score}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${stats.sustainability.score}%`,
                  backgroundColor: sustainabilityInfo.color,
                },
              ]}
            />
          </View>
          <View style={styles.sustainabilityMessage}>
            <Ionicons name={sustainabilityInfo.icon as any} size={18} color={sustainabilityInfo.color} />
            <Text style={styles.sustainabilityText}>{sustainabilityInfo.text}</Text>
          </View>
        </View>

        {/* Key Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="shirt-outline" size={24} color={colors.accent} />
            <Text style={styles.statValue}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>Дрехи</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="heart-outline" size={24} color={colors.error} />
            <Text style={styles.statValue}>{stats.favorites}</Text>
            <Text style={styles.statLabel}>Любими</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="layers-outline" size={24} color={colors.info} />
            <Text style={styles.statValue}>{outfits.length}</Text>
            <Text style={styles.statLabel}>Тоалети</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="repeat-outline" size={24} color={colors.success} />
            <Text style={styles.statValue}>{stats.averageWears.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg носене</Text>
          </View>
        </View>

        {/* Value Stats */}
        <View style={styles.valueCard}>
          <Text style={styles.sectionTitle}>💰 Стойност на гардероба</Text>
          <View style={styles.valueRow}>
            <View style={styles.valueItem}>
              <Text style={styles.valueLabel}>Обща стойност</Text>
              <Text style={styles.valueAmount}>{stats.totalValue.toFixed(0)} лв</Text>
            </View>
            <View style={styles.valueDivider} />
            <View style={styles.valueItem}>
              <Text style={styles.valueLabel}>Avg цена/носене</Text>
              <Text style={styles.valueAmount}>{stats.costPerWear.toFixed(2)} лв</Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>📊 По категории</Text>
          {sortedCategories.map(([category, count]) => (
            <View key={category} style={styles.barRow}>
              <Text style={styles.barLabel}>
                {CATEGORY_LABELS[category] || category}
              </Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${(count / maxCategoryCount) * 100}%`,
                      backgroundColor: CATEGORY_COLORS[category] || colors.accent,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{count}</Text>
            </View>
          ))}
        </View>

        {/* Top Colors */}
        <View style={styles.colorsCard}>
          <Text style={styles.sectionTitle}>🎨 Топ цветове</Text>
          <View style={styles.colorsGrid}>
            {topColors.map(([color, count], index) => (
              <View key={color} style={styles.colorItem}>
                <View style={[styles.colorDot, { backgroundColor: getColorHex(color) }]} />
                <Text style={styles.colorName}>{color}</Text>
                <Text style={styles.colorCount}>{count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Most/Least Worn */}
        <View style={styles.highlightsCard}>
          <Text style={styles.sectionTitle}>⭐ Highlights</Text>
          
          {stats.mostWorn && (
            <View style={styles.highlightItem}>
              <Ionicons name="trophy" size={20} color={colors.warning} />
              <View style={styles.highlightInfo}>
                <Text style={styles.highlightLabel}>Най-носена</Text>
                <Text style={styles.highlightName}>{stats.mostWorn.name}</Text>
                <Text style={styles.highlightMeta}>
                  Носена {stats.mostWorn.times_worn} пъти
                </Text>
              </View>
            </View>
          )}

          {stats.neverWorn.length > 0 && (
            <View style={styles.highlightItem}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <View style={styles.highlightInfo}>
                <Text style={styles.highlightLabel}>Неносени дрехи</Text>
                <Text style={styles.highlightName}>
                  {stats.neverWorn.length} артикула
                </Text>
                <Text style={styles.highlightMeta}>
                  Опитай да ги включиш в нови комбинации!
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>💡 Съвети</Text>
          <View style={styles.tipItem}>
            <Ionicons name="bulb" size={18} color={colors.warning} />
            <Text style={styles.tipText}>
              {stats.neverWorn.length > 3
                ? `Имаш ${stats.neverWorn.length} неносени дрехи. Опитай да създадеш тоалет с тях!`
                : stats.averageWears < 5
                ? 'Опитай да носиш дрехите си по-често за по-добра стойност.'
                : 'Страхотно! Използваш гардероба си ефективно!'}
            </Text>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to get color hex from name
function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    'черно': '#000000',
    'бяло': '#FFFFFF',
    'червено': '#E53935',
    'синьо': '#1E88E5',
    'зелено': '#43A047',
    'жълто': '#FDD835',
    'розово': '#EC407A',
    'лилаво': '#8E24AA',
    'оранжево': '#FB8C00',
    'кафяво': '#795548',
    'сиво': '#9E9E9E',
    'бежово': '#D7CCC8',
    'тъмносиньо': '#1A237E',
    'бордо': '#880E4F',
  };
  return colorMap[colorName] || colors.textMuted;
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  addButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  sustainabilityCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  sustainabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sustainabilityIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.success}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  sustainabilityTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scoreMax: {
    ...typography.body,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  sustainabilityMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sustainabilityText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2 - spacing.md / 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  valueCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueItem: {
    flex: 1,
    alignItems: 'center',
  },
  valueDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  valueLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  valueAmount: {
    ...typography.h2,
    color: colors.accent,
    marginTop: spacing.xs,
  },
  chartCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  barLabel: {
    width: 80,
    ...typography.caption,
    color: colors.textSecondary,
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  bar: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  barValue: {
    width: 30,
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: 'right',
    fontWeight: '600',
  },
  colorsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorName: {
    ...typography.caption,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  colorCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  highlightsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  highlightInfo: {
    flex: 1,
  },
  highlightLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  highlightName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  highlightMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tipsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: `${colors.warning}10`,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: `${colors.warning}30`,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
});
