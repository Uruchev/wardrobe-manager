import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { useWardrobeStore, useOutfitsStore } from '../store';

export default function HomeScreen({ navigation }: any) {
  const { items } = useWardrobeStore();
  const { outfits } = useOutfitsStore();

  // Статистики
  const totalItems = items.length;
  const totalOutfits = outfits.length;
  const favoriteItems = items.filter((item) => item.favorite).length;
  const totalWorn = items.reduce((sum, item) => sum + item.times_worn, 0);

  const quickActions = [
    {
      icon: 'add-circle',
      label: 'Добави дреха',
      color: colors.accent,
      onPress: () => navigation.navigate('AddItem'),
    },
    {
      icon: 'shirt',
      label: 'Създай аутфит',
      color: colors.categoryTops,
      onPress: () => navigation.navigate('Outfits'),
    },
    {
      icon: 'chatbubbles',
      label: 'AI Стилист',
      color: colors.gradientStart,
      onPress: () => navigation.navigate('AI'),
    },
    {
      icon: 'calendar',
      label: 'Календар',
      color: colors.categoryOuterwear,
      onPress: () => navigation.navigate('Calendar'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Добре дошъл! 👋</Text>
            <Text style={styles.subtitle}>Какво ще облечеш днес?</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={40} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* AI Suggestion Card */}
        <TouchableOpacity
          style={styles.aiCard}
          onPress={() => navigation.navigate('AI')}
        >
          <View style={styles.aiCardContent}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={28} color={colors.white} />
            </View>
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTitle}>Попитай AI Стилиста</Text>
              <Text style={styles.aiSubtitle}>
                "Какво да облека за среща днес?"
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.white} />
          </View>
        </TouchableOpacity>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.categoryTops }]}>
            <Ionicons name="shirt-outline" size={24} color={colors.white} />
            <Text style={styles.statNumber}>{totalItems}</Text>
            <Text style={styles.statLabel}>Дрехи</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.categoryBottoms }]}>
            <Ionicons name="layers-outline" size={24} color={colors.white} />
            <Text style={styles.statNumber}>{totalOutfits}</Text>
            <Text style={styles.statLabel}>Аутфити</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.categoryDresses }]}>
            <Ionicons name="heart-outline" size={24} color={colors.white} />
            <Text style={styles.statNumber}>{favoriteItems}</Text>
            <Text style={styles.statLabel}>Любими</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark-circle-outline" size={24} color={colors.white} />
            <Text style={styles.statNumber}>{totalWorn}</Text>
            <Text style={styles.statLabel}>Носени</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Бързи действия</Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickAction}
              onPress={action.onPress}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: action.color }]}
              >
                <Ionicons name={action.icon as any} size={24} color={colors.white} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recently Added */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Скоро добавени</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Wardrobe')}>
            <Text style={styles.seeAll}>Виж всички</Text>
          </TouchableOpacity>
        </View>
        
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="shirt-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>Все още нямаш добавени дрехи</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddItem')}
            >
              <Text style={styles.addButtonText}>Добави първата си дреха</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recentItems}
          >
            {items.slice(0, 5).map((item) => (
              <TouchableOpacity key={item.id} style={styles.recentItem}>
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.recentItemImage}
                />
                <Text style={styles.recentItemName} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Tip of the day */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={20} color={colors.warning} />
            <Text style={styles.tipTitle}>Съвет на деня</Text>
          </View>
          <Text style={styles.tipText}>
            Опитай да комбинираш дрехи, които не си носил скоро. 
            AI стилистът може да ти помогне!
          </Text>
        </View>
      </ScrollView>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  profileButton: {
    padding: spacing.xs,
  },
  aiCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    ...shadows.lg,
  },
  aiCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  aiTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.white,
  },
  aiSubtitle: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statNumber: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.white,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.white,
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  seeAll: {
    fontSize: typography.sm,
    color: colors.accent,
    fontWeight: typography.medium,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  quickActionLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  emptyText: {
    fontSize: typography.md,
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: typography.semibold,
  },
  recentItems: {
    paddingLeft: spacing.lg,
    marginBottom: spacing.xl,
  },
  recentItem: {
    marginRight: spacing.md,
    width: 100,
  },
  recentItemImage: {
    width: 100,
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: colors.border,
  },
  recentItemName: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  tipCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    ...shadows.sm,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipTitle: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  tipText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
