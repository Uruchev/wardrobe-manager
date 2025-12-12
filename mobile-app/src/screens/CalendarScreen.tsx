import React, { useState, useMemo } from 'react';
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
import { useOutfitsStore, useWardrobeStore } from '../store';
import { Outfit } from '../config/supabase';

const { width } = Dimensions.get('window');
const DAY_WIDTH = (width - spacing.lg * 2 - spacing.xs * 6) / 7;

const MONTHS_BG = [
  'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
  'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
];

const WEEKDAYS_BG = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

interface PlannedOutfit {
  date: string; // YYYY-MM-DD
  outfitId: string;
  occasion?: string;
  notes?: string;
}

// Mock data for demo - would come from database
const MOCK_PLANNED: PlannedOutfit[] = [];

export default function CalendarScreen({ navigation }: any) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [plannedOutfits, setPlannedOutfits] = useState<PlannedOutfit[]>(MOCK_PLANNED);
  const { outfits } = useOutfitsStore();
  const { items } = useWardrobeStore();

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Adjust for Monday start (0 = Monday, 6 = Sunday)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    
    const daysInMonth = lastDay.getDate();
    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      currentWeek.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Fill last week with empty cells
    while (currentWeek.length > 0 && currentWeek.length < 7) {
      currentWeek.push(null);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return { year, month, weeks };
  }, [currentDate]);

  // Format date as YYYY-MM-DD
  const formatDate = (day: number): string => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  // Check if date has planned outfit
  const getPlannedOutfit = (day: number): PlannedOutfit | undefined => {
    const dateStr = formatDate(day);
    return plannedOutfits.find(p => p.date === dateStr);
  };

  // Check if date is today
  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Navigate months
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle day press
  const handleDayPress = (day: number) => {
    const dateStr = formatDate(day);
    setSelectedDate(dateStr);
  };

  // Plan outfit for selected date
  const handlePlanOutfit = (outfit: Outfit) => {
    if (!selectedDate) return;

    const newPlan: PlannedOutfit = {
      date: selectedDate,
      outfitId: outfit.id,
    };

    setPlannedOutfits(prev => {
      // Remove existing plan for this date
      const filtered = prev.filter(p => p.date !== selectedDate);
      return [...filtered, newPlan];
    });

    Alert.alert('Успех!', `Тоалетът "${outfit.name}" е планиран за ${selectedDate}`);
  };

  // Remove planned outfit
  const handleRemovePlan = () => {
    if (!selectedDate) return;
    setPlannedOutfits(prev => prev.filter(p => p.date !== selectedDate));
  };

  // Get outfit by ID
  const getOutfitById = (id: string): Outfit | undefined => {
    return outfits.find(o => o.id === id);
  };

  // Get first item image for outfit preview
  const getOutfitPreview = (outfit: Outfit): string | null => {
    if (outfit.items.length === 0) return null;
    const firstItem = items.find(i => i.id === outfit.items[0]);
    return firstItem?.image_no_bg_url || firstItem?.image_url || null;
  };

  // Render day cell
  const renderDay = (day: number | null, index: number) => {
    if (day === null) {
      return <View key={index} style={styles.dayCell} />;
    }

    const planned = getPlannedOutfit(day);
    const outfit = planned ? getOutfitById(planned.outfitId) : undefined;
    const preview = outfit ? getOutfitPreview(outfit) : null;
    const today = isToday(day);
    const isSelected = selectedDate === formatDate(day);

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          today && styles.todayCell,
          isSelected && styles.selectedCell,
        ]}
        onPress={() => handleDayPress(day)}
      >
        <Text
          style={[
            styles.dayText,
            today && styles.todayText,
            isSelected && styles.selectedText,
          ]}
        >
          {day}
        </Text>
        {preview && (
          <Image
            source={{ uri: preview }}
            style={styles.dayOutfitPreview}
            resizeMode="cover"
          />
        )}
        {planned && !preview && (
          <View style={styles.plannedDot} />
        )}
      </TouchableOpacity>
    );
  };

  // Get selected date info
  const selectedPlanned = selectedDate
    ? plannedOutfits.find(p => p.date === selectedDate)
    : undefined;
  const selectedOutfit = selectedPlanned
    ? getOutfitById(selectedPlanned.outfitId)
    : undefined;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Календар</Text>
        <TouchableOpacity onPress={goToToday}>
          <Text style={styles.todayButton}>Днес</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.monthButton} onPress={goToPrevMonth}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {MONTHS_BG[calendarData.month]} {calendarData.year}
          </Text>
          <TouchableOpacity style={styles.monthButton} onPress={goToNextMonth}>
            <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendar}>
          {/* Weekday Headers */}
          <View style={styles.weekdaysRow}>
            {WEEKDAYS_BG.map((day, index) => (
              <View key={index} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Days Grid */}
          {calendarData.weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((day, dayIndex) => renderDay(day, dayIndex))}
            </View>
          ))}
        </View>

        {/* Selected Date Details */}
        {selectedDate && (
          <View style={styles.selectedDetails}>
            <Text style={styles.selectedDateText}>
              {new Date(selectedDate).toLocaleDateString('bg-BG', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>

            {selectedOutfit ? (
              <View style={styles.plannedOutfitCard}>
                <View style={styles.plannedOutfitHeader}>
                  <Text style={styles.plannedLabel}>Планиран тоалет</Text>
                  <TouchableOpacity onPress={handleRemovePlan}>
                    <Ionicons name="close-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.outfitRow}
                  onPress={() => navigation.navigate('OutfitDetail', { outfit: selectedOutfit })}
                >
                  {getOutfitPreview(selectedOutfit) && (
                    <Image
                      source={{ uri: getOutfitPreview(selectedOutfit)! }}
                      style={styles.outfitImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.outfitInfo}>
                    <Text style={styles.outfitName}>{selectedOutfit.name}</Text>
                    <Text style={styles.outfitMeta}>
                      {selectedOutfit.items.length} дрехи
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.noOutfitCard}>
                <Text style={styles.noOutfitText}>Няма планиран тоалет</Text>
                <Text style={styles.noOutfitHint}>
                  Избери тоалет от списъка по-долу
                </Text>
              </View>
            )}

            {/* Outfit Selection */}
            {!selectedOutfit && outfits.length > 0 && (
              <View style={styles.outfitSelection}>
                <Text style={styles.sectionTitle}>Избери тоалет</Text>
                {outfits.slice(0, 5).map(outfit => (
                  <TouchableOpacity
                    key={outfit.id}
                    style={styles.selectableOutfit}
                    onPress={() => handlePlanOutfit(outfit)}
                  >
                    {getOutfitPreview(outfit) && (
                      <Image
                        source={{ uri: getOutfitPreview(outfit)! }}
                        style={styles.selectableImage}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.selectableInfo}>
                      <Text style={styles.selectableName}>{outfit.name}</Text>
                      <Text style={styles.selectableMeta}>
                        {outfit.items.length} дрехи • Носен {outfit.times_worn}x
                      </Text>
                    </View>
                    <View style={styles.selectButton}>
                      <Ionicons name="add-circle" size={28} color={colors.accent} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {outfits.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="layers-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>Нямаш създадени тоалети</Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => navigation.navigate('CreateOutfit')}
                >
                  <Text style={styles.createButtonText}>Създай тоалет</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
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
  todayButton: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  monthButton: {
    padding: spacing.sm,
  },
  monthTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  calendar: {
    paddingHorizontal: spacing.lg,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayCell: {
    width: DAY_WIDTH,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs / 2,
  },
  weekdayText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  dayCell: {
    width: DAY_WIDTH,
    height: DAY_WIDTH + 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.xs,
    marginHorizontal: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  selectedCell: {
    backgroundColor: colors.accent,
  },
  dayText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  todayText: {
    color: colors.accent,
    fontWeight: '700',
  },
  selectedText: {
    color: colors.white,
  },
  dayOutfitPreview: {
    width: DAY_WIDTH - 8,
    height: DAY_WIDTH - 20,
    borderRadius: borderRadius.xs,
    marginTop: 2,
  },
  plannedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginTop: 4,
  },
  selectedDetails: {
    padding: spacing.lg,
  },
  selectedDateText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textTransform: 'capitalize',
  },
  plannedOutfitCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  plannedOutfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  plannedLabel: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  outfitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outfitImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  outfitInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  outfitName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  outfitMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noOutfitCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  noOutfitText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  noOutfitHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  outfitSelection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  selectableOutfit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  selectableImage: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  selectableInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  selectableName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  selectableMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  selectButton: {
    padding: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  createButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  createButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});
