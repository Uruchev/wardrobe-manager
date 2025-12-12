import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { useOutfitsStore } from '../store';
import { Outfit } from '../config/supabase';

export default function OutfitsScreen({ navigation }: any) {
  const { outfits } = useOutfitsStore();

  const renderOutfit = ({ item }: { item: Outfit }) => (
    <TouchableOpacity
      style={styles.outfitCard}
      onPress={() => navigation.navigate('OutfitDetail', { outfit: item })}
    >
      {item.preview_image_url ? (
        <Image
          source={{ uri: item.preview_image_url }}
          style={styles.outfitImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.outfitPlaceholder}>
          <Ionicons name="images" size={32} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.outfitInfo}>
        <Text style={styles.outfitName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.outfitMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="shirt-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{item.items.length} артикула</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
            <Text style={styles.metaText}>Носен {item.times_worn}x</Text>
          </View>
        </View>
        {item.occasions.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.occasions.slice(0, 2).map((occasion, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{occasion}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
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
        <Text style={styles.title}>Моите аутфити</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateOutfit')}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.actionsContainer}
      >
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.gradientStart }]}
          onPress={() => navigation.navigate('CreateOutfit')}
        >
          <Ionicons name="create" size={24} color={colors.white} />
          <Text style={styles.actionTitle}>Създай нов</Text>
          <Text style={styles.actionSubtitle}>Ръчно избери дрехи</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.accent }]}
          onPress={() => navigation.navigate('AI')}
        >
          <Ionicons name="sparkles" size={24} color={colors.white} />
          <Text style={styles.actionTitle}>AI Предложение</Text>
          <Text style={styles.actionSubtitle}>Получи идеи</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.categoryBottoms }]}
          onPress={() => {/* Random outfit */}}
        >
          <Ionicons name="shuffle" size={24} color={colors.white} />
          <Text style={styles.actionTitle}>Случаен</Text>
          <Text style={styles.actionSubtitle}>Изненадай се!</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Outfits List */}
      {outfits.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="layers-outline" size={64} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Все още нямаш аутфити</Text>
          <Text style={styles.emptySubtitle}>
            Създай първия си аутфит като комбинираш дрехи от гардероба
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('CreateOutfit')}
          >
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={styles.emptyButtonText}>Създай аутфит</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Всички аутфити ({outfits.length})
            </Text>
            <TouchableOpacity>
              <Ionicons name="filter" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={outfits}
            numColumns={2}
            keyExtractor={(item) => item.id}
            renderItem={renderOutfit}
            contentContainerStyle={styles.outfitsList}
            showsVerticalScrollIndicator={false}
          />
        </>
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
  createButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionCard: {
    width: 140,
    padding: spacing.md,
    marginRight: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  actionTitle: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.white,
    marginTop: spacing.sm,
  },
  actionSubtitle: {
    fontSize: typography.xs,
    color: colors.white,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  outfitsList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  outfitCard: {
    flex: 1,
    margin: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  outfitImage: {
    width: '100%',
    height: 180,
  },
  outfitPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outfitInfo: {
    padding: spacing.md,
  },
  outfitName: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  outfitMeta: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: `${colors.accent}20`,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: typography.xs,
    color: colors.accent,
  },
  favoriteIcon: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
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
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
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
