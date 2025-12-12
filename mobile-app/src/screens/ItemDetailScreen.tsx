import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { wardrobeService } from '../services/wardrobeService';
import { ClothingItem } from '../config/supabase';

const CATEGORY_LABELS: Record<string, string> = {
  tops: 'Горница',
  bottoms: 'Долница',
  dresses: 'Рокля',
  outerwear: 'Връхна дреха',
  shoes: 'Обувки',
  accessories: 'Аксесоар',
};

const COLOR_LABELS: Record<string, string> = {
  black: 'Черно',
  white: 'Бяло',
  gray: 'Сиво',
  navy: 'Тъмно синьо',
  blue: 'Синьо',
  red: 'Червено',
  pink: 'Розово',
  green: 'Зелено',
  yellow: 'Жълто',
  orange: 'Оранжево',
  purple: 'Лилаво',
  brown: 'Кафяво',
  beige: 'Бежово',
  cream: 'Кремаво',
};

const SEASON_LABELS: Record<string, string> = {
  spring: '🌸 Пролет',
  summer: '☀️ Лято',
  fall: '🍂 Есен',
  winter: '❄️ Зима',
};

export default function ItemDetailScreen({ route, navigation }: any) {
  const { item } = route.params as { item: ClothingItem };
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(item.favorite);
  const [timesWorn, setTimesWorn] = useState(item.times_worn);

  const cpw = wardrobeService.calculateCPW({
    ...item,
    times_worn: timesWorn,
  });

  const handleToggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    await wardrobeService.toggleFavorite(item.id, !isFavorite);
  };

  const handleLogWear = async () => {
    setIsLoading(true);
    const result = await wardrobeService.logWear(item.id);
    setIsLoading(false);

    if (result.success) {
      setTimesWorn(prev => prev + 1);
      Alert.alert('Записано! 👗', 'Носенето е записано.');
    } else {
      Alert.alert('Грешка', result.error || 'Неуспешно записване');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Изтриване',
      'Сигурен ли си, че искаш да изтриеш тази дреха?',
      [
        { text: 'Отказ', style: 'cancel' },
        {
          text: 'Изтрий',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            const result = await wardrobeService.deleteItem(item.id);
            setIsLoading(false);

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? colors.accent : colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('EditItem', { item })}
          >
            <Ionicons name="create-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image_no_bg_url || item.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Main Info */}
        <View style={styles.mainInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag" size={16} color={colors.textMuted} />
              <Text style={styles.metaText}>
                {CATEGORY_LABELS[item.category]}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: getColorHex(item.color) },
                ]}
              />
              <Text style={styles.metaText}>
                {COLOR_LABELS[item.color] || item.color}
              </Text>
            </View>
          </View>
          {item.brand && (
            <Text style={styles.brand}>{item.brand}</Text>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={styles.statValue}>{timesWorn}</Text>
            <Text style={styles.statLabel}>Носения</Text>
          </View>
          
          {item.purchase_price && (
            <View style={styles.statCard}>
              <Ionicons name="cash" size={24} color={colors.warning} />
              <Text style={styles.statValue}>{item.purchase_price} лв.</Text>
              <Text style={styles.statLabel}>Цена</Text>
            </View>
          )}
          
          {cpw !== null && (
            <View style={styles.statCard}>
              <Ionicons name="trending-down" size={24} color={colors.accent} />
              <Text style={styles.statValue}>{cpw} лв.</Text>
              <Text style={styles.statLabel}>CPW</Text>
            </View>
          )}
        </View>

        {/* Log Wear Button */}
        <TouchableOpacity
          style={styles.wearButton}
          onPress={handleLogWear}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="shirt" size={20} color={colors.white} />
              <Text style={styles.wearButtonText}>Облякох я днес!</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Детайли</Text>

          {item.material && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Материал</Text>
              <Text style={styles.detailValue}>{item.material}</Text>
            </View>
          )}

          {item.seasons && item.seasons.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Сезони</Text>
              <Text style={styles.detailValue}>
                {item.seasons.map((s: string) => SEASON_LABELS[s] || s).join(', ')}
              </Text>
            </View>
          )}

          {item.occasions && item.occasions.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Повод</Text>
              <View style={styles.tagsContainer}>
                {item.occasions.map((occasion, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{occasion}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {item.purchase_date && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Дата на покупка</Text>
              <Text style={styles.detailValue}>
                {new Date(item.purchase_date).toLocaleDateString('bg-BG')}
              </Text>
            </View>
          )}

          {item.last_worn && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Последно носена</Text>
              <Text style={styles.detailValue}>
                {new Date(item.last_worn).toLocaleDateString('bg-BG')}
              </Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {item.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Бележки</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}

        {/* CPW Info */}
        {item.purchase_price && (
          <View style={styles.cpwCard}>
            <View style={styles.cpwHeader}>
              <Ionicons name="information-circle" size={20} color={colors.info} />
              <Text style={styles.cpwTitle}>Какво е Cost Per Wear?</Text>
            </View>
            <Text style={styles.cpwDescription}>
              Cost Per Wear (CPW) показва колко ти струва всяко носене на тази дреха. 
              Колкото повече я носиш, толкова по-ниска е цената!
            </Text>
            {cpw && (
              <Text style={styles.cpwFormula}>
                {item.purchase_price} лв. ÷ {timesWorn} носения = {cpw} лв./носене
              </Text>
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getColorHex(colorId: string): string {
  const colors: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    gray: '#808080',
    navy: '#000080',
    blue: '#0000FF',
    red: '#FF0000',
    pink: '#FFC0CB',
    green: '#008000',
    yellow: '#FFFF00',
    orange: '#FFA500',
    purple: '#800080',
    brown: '#8B4513',
    beige: '#F5F5DC',
    cream: '#FFFDD0',
  };
  return colors[colorId] || '#808080';
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  imageContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  image: {
    width: '100%',
    height: 350,
    backgroundColor: colors.card,
  },
  mainInfo: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  name: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.md,
    color: colors.textSecondary,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brand: {
    fontSize: typography.lg,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  statValue: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  wearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.success,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  wearButtonText: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.white,
  },
  detailsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: typography.md,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: typography.md,
    color: colors.textPrimary,
    fontWeight: typography.medium,
    flex: 2,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    flex: 2,
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
    fontWeight: typography.medium,
  },
  notesCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  notesText: {
    fontSize: typography.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  cpwCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: `${colors.info}10`,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: `${colors.info}30`,
  },
  cpwHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  cpwTitle: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  cpwDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  cpwFormula: {
    fontSize: typography.md,
    fontWeight: typography.medium,
    color: colors.info,
    textAlign: 'center',
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
