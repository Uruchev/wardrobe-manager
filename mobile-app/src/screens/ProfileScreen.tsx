import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { useAuthStore, useWardrobeStore, useOutfitsStore } from '../store';

export default function ProfileScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { items } = useWardrobeStore();
  const { outfits } = useOutfitsStore();

  // Изчисления за статистики
  const totalItems = items.length;
  const totalOutfits = outfits.length;
  const totalWorn = items.reduce((sum, item) => sum + item.times_worn, 0);
  const totalValue = items.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
  const avgCostPerWear = totalWorn > 0 ? totalValue / totalWorn : 0;

  // Най-носени категории
  const categoryStats = [
    { name: 'Горници', count: items.filter((i) => i.category === 'tops').length },
    { name: 'Долници', count: items.filter((i) => i.category === 'bottoms').length },
    { name: 'Рокли', count: items.filter((i) => i.category === 'dresses').length },
    { name: 'Връхни', count: items.filter((i) => i.category === 'outerwear').length },
    { name: 'Обувки', count: items.filter((i) => i.category === 'shoes').length },
    { name: 'Аксесоари', count: items.filter((i) => i.category === 'accessories').length },
  ].sort((a, b) => b.count - a.count);

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Редактирай профила',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'stats-chart-outline',
      title: 'Детайлна статистика',
      onPress: () => navigation.navigate('Insights'),
    },
    {
      icon: 'calendar-outline',
      title: 'Календар',
      onPress: () => navigation.navigate('Calendar'),
    },
    {
      icon: 'download-outline',
      title: 'Експортирай данни',
      onPress: () => {/* Export data */},
    },
    {
      icon: 'cloud-outline',
      title: 'Синхронизация',
      onPress: () => navigation.navigate('Sync'),
    },
    {
      icon: 'notifications-outline',
      title: 'Известия',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      icon: 'color-palette-outline',
      title: 'Тема на приложението',
      onPress: () => navigation.navigate('Theme'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Помощ и поддръжка',
      onPress: () => navigation.navigate('Help'),
    },
    {
      icon: 'information-circle-outline',
      title: 'За приложението',
      onPress: () => navigation.navigate('About'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Профил</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={colors.textMuted} />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>
            {user?.display_name || 'Потребител'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Твоят гардероб</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalItems}</Text>
              <Text style={styles.statLabel}>Дрехи</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalOutfits}</Text>
              <Text style={styles.statLabel}>Аутфити</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalWorn}</Text>
              <Text style={styles.statLabel}>Носения</Text>
            </View>
          </View>
        </View>

        {/* Cost Per Wear */}
        <View style={styles.cpwCard}>
          <View style={styles.cpwHeader}>
            <Ionicons name="trending-down" size={24} color={colors.success} />
            <Text style={styles.cpwTitle}>Средна цена на носене</Text>
          </View>
          <Text style={styles.cpwValue}>
            {avgCostPerWear.toFixed(2)} лв.
          </Text>
          <Text style={styles.cpwSubtitle}>
            Колкото по-често носиш дрехите си, толкова по-ниска е цената!
          </Text>
        </View>

        {/* Category Breakdown */}
        <View style={styles.categoriesCard}>
          <Text style={styles.sectionTitle}>Разпределение по категории</Text>
          {categoryStats.map((cat, index) => (
            <View key={index} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <View style={styles.categoryBarContainer}>
                <View
                  style={[
                    styles.categoryBar,
                    {
                      width: `${(cat.count / Math.max(...categoryStats.map((c) => c.count), 1)) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.categoryCount}>{cat.count}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon as any} size={20} color={colors.accent} />
                </View>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            useAuthStore.getState().logout();
            // navigation.reset to login
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Излез от профила</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Fashion Advisor v1.0.0</Text>
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
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.card,
  },
  userName: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: typography.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  statsTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.accent,
  },
  statLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  cpwCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: `${colors.success}15`,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: `${colors.success}30`,
  },
  cpwHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cpwTitle: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  cpwValue: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  cpwSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  categoriesCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryName: {
    width: 80,
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  categoryBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  categoryBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.full,
  },
  categoryCount: {
    width: 30,
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  menuCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemTitle: {
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: `${colors.error}10`,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: typography.md,
    fontWeight: typography.medium,
    color: colors.error,
  },
  version: {
    fontSize: typography.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});
