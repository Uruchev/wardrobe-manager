import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { wardrobeService } from '../services/wardrobeService';

const CATEGORIES = [
  { id: 'tops', label: 'Горници', icon: 'shirt', color: colors.categoryTops },
  { id: 'bottoms', label: 'Долници', icon: 'cut', color: colors.categoryBottoms },
  { id: 'dresses', label: 'Рокли', icon: 'woman', color: colors.categoryDresses },
  { id: 'outerwear', label: 'Връхни', icon: 'cloudy', color: colors.categoryOuterwear },
  { id: 'shoes', label: 'Обувки', icon: 'footsteps', color: colors.categoryShoes },
  { id: 'accessories', label: 'Аксесоари', icon: 'watch', color: colors.categoryAccessories },
];

const COLORS = [
  { id: 'black', label: 'Черно', hex: '#000000' },
  { id: 'white', label: 'Бяло', hex: '#FFFFFF' },
  { id: 'gray', label: 'Сиво', hex: '#808080' },
  { id: 'navy', label: 'Тъмно синьо', hex: '#000080' },
  { id: 'blue', label: 'Синьо', hex: '#0000FF' },
  { id: 'red', label: 'Червено', hex: '#FF0000' },
  { id: 'pink', label: 'Розово', hex: '#FFC0CB' },
  { id: 'green', label: 'Зелено', hex: '#008000' },
  { id: 'yellow', label: 'Жълто', hex: '#FFFF00' },
  { id: 'orange', label: 'Оранжево', hex: '#FFA500' },
  { id: 'purple', label: 'Лилаво', hex: '#800080' },
  { id: 'brown', label: 'Кафяво', hex: '#8B4513' },
  { id: 'beige', label: 'Бежово', hex: '#F5F5DC' },
  { id: 'cream', label: 'Кремаво', hex: '#FFFDD0' },
];

const SEASONS = [
  { id: 'spring', label: 'Пролет', icon: '🌸' },
  { id: 'summer', label: 'Лято', icon: '☀️' },
  { id: 'fall', label: 'Есен', icon: '🍂' },
  { id: 'winter', label: 'Зима', icon: '❄️' },
];

const OCCASIONS = [
  'Ежедневно',
  'Работа',
  'Официално',
  'Спорт',
  'Парти',
  'Дата',
  'Плаж',
  'Пътуване',
];

export default function AddItemScreen({ navigation }: any) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [brand, setBrand] = useState('');
  const [material, setMaterial] = useState('');
  const [price, setPrice] = useState('');
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Image, 2: Details

  const pickImage = async (useCamera: boolean) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Нужно е разрешение',
        `Моля, разреши достъп до ${useCamera ? 'камерата' : 'галерията'} в настройките.`
      );
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [3, 4],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [3, 4],
          quality: 0.8,
        });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setStep(2);
    }
  };

  const toggleSeason = (seasonId: string) => {
    setSelectedSeasons(prev =>
      prev.includes(seasonId)
        ? prev.filter(s => s !== seasonId)
        : [...prev, seasonId]
    );
  };

  const toggleOccasion = (occasion: string) => {
    setSelectedOccasions(prev =>
      prev.includes(occasion)
        ? prev.filter(o => o !== occasion)
        : [...prev, occasion]
    );
  };

  const validateAndSave = async () => {
    if (!imageUri) {
      Alert.alert('Грешка', 'Моля, добави снимка');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Грешка', 'Моля, въведи име на дрехата');
      return;
    }
    if (!category) {
      Alert.alert('Грешка', 'Моля, избери категория');
      return;
    }
    if (!selectedColor) {
      Alert.alert('Грешка', 'Моля, избери цвят');
      return;
    }

    setIsLoading(true);

    try {
      // Generate temporary ID for image upload
      const tempId = Date.now().toString();

      // Upload image first
      const uploadResult = await wardrobeService.uploadImage(imageUri, tempId);
      if (!uploadResult.success || !uploadResult.data) {
        Alert.alert('Грешка', uploadResult.error || 'Неуспешно качване на снимката');
        setIsLoading(false);
        return;
      }

      // Create clothing item
      const result = await wardrobeService.addItem({
        name: name.trim(),
        category: category as any,
        color: selectedColor,
        brand: brand.trim() || undefined,
        material: material.trim() || undefined,
        purchase_price: price ? parseFloat(price) : undefined,
        seasons: selectedSeasons as ('spring' | 'summer' | 'fall' | 'winter')[],
        occasions: selectedOccasions,
        notes: notes.trim() || undefined,
        image_url: uploadResult.data,
        times_worn: 0,
        favorite: false,
      });

      if (result.success) {
        Alert.alert('Успех! 🎉', 'Дрехата е добавена в гардероба', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Грешка', result.error || 'Неуспешно добавяне');
      }
    } catch (error: any) {
      Alert.alert('Грешка', error.message);
    }

    setIsLoading(false);
  };

  // Step 1: Image Selection
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Добави дреха</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.imagePickerContainer}>
          <Text style={styles.stepTitle}>Стъпка 1: Избери снимка</Text>
          <Text style={styles.stepSubtitle}>
            Направи снимка или избери от галерията
          </Text>

          <View style={styles.imageOptions}>
            <TouchableOpacity
              style={styles.imageOption}
              onPress={() => pickImage(true)}
            >
              <View style={[styles.imageOptionIcon, { backgroundColor: colors.accent }]}>
                <Ionicons name="camera" size={40} color={colors.white} />
              </View>
              <Text style={styles.imageOptionText}>Камера</Text>
              <Text style={styles.imageOptionHint}>Снимай сега</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imageOption}
              onPress={() => pickImage(false)}
            >
              <View style={[styles.imageOptionIcon, { backgroundColor: colors.gradientStart }]}>
                <Ionicons name="images" size={40} color={colors.white} />
              </View>
              <Text style={styles.imageOptionText}>Галерия</Text>
              <Text style={styles.imageOptionHint}>Избери снимка</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>💡 Съвети за добра снимка:</Text>
            <Text style={styles.tipItem}>• Използвай бял или еднороден фон</Text>
            <Text style={styles.tipItem}>• Добро осветление без сенки</Text>
            <Text style={styles.tipItem}>• Снимай цялата дреха</Text>
            <Text style={styles.tipItem}>• Избягвай гънки и набръчкване</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Step 2: Details Form
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(1)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Детайли</Text>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={validateAndSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Запази</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Preview */}
          <TouchableOpacity
            style={styles.imagePreviewContainer}
            onPress={() => setStep(1)}
          >
            <Image source={{ uri: imageUri! }} style={styles.imagePreview} />
            <View style={styles.changeImageButton}>
              <Ionicons name="camera" size={16} color={colors.white} />
              <Text style={styles.changeImageText}>Смени</Text>
            </View>
          </TouchableOpacity>

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Име на дрехата *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="напр. Бяла памучна тениска"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Категория *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    category === cat.id && { backgroundColor: cat.color },
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={24}
                    color={category === cat.id ? colors.white : cat.color}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      category === cat.id && { color: colors.white },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Цвят *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.colorRow}>
                {COLORS.map(color => (
                  <TouchableOpacity
                    key={color.id}
                    style={[
                      styles.colorItem,
                      selectedColor === color.id && styles.colorItemSelected,
                    ]}
                    onPress={() => setSelectedColor(color.id)}
                  >
                    <View
                      style={[
                        styles.colorCircle,
                        { backgroundColor: color.hex },
                        color.id === 'white' && styles.colorCircleWhite,
                      ]}
                    >
                      {selectedColor === color.id && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={color.id === 'white' || color.id === 'yellow' || color.id === 'beige' || color.id === 'cream' ? colors.textPrimary : colors.white}
                        />
                      )}
                    </View>
                    <Text style={styles.colorLabel}>{color.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Brand & Material */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, styles.flex]}>
              <Text style={styles.label}>Марка</Text>
              <TextInput
                style={styles.textInput}
                placeholder="напр. Zara"
                placeholderTextColor={colors.textMuted}
                value={brand}
                onChangeText={setBrand}
              />
            </View>
            <View style={styles.inputSpacer} />
            <View style={[styles.inputGroup, styles.flex]}>
              <Text style={styles.label}>Материал</Text>
              <TextInput
                style={styles.textInput}
                placeholder="напр. Памук"
                placeholderTextColor={colors.textMuted}
                value={material}
                onChangeText={setMaterial}
              />
            </View>
          </View>

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Цена (за Cost Per Wear)</Text>
            <View style={styles.priceInputWrapper}>
              <TextInput
                style={[styles.textInput, styles.priceInput]}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
              <Text style={styles.priceCurrency}>лв.</Text>
            </View>
          </View>

          {/* Seasons */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Сезон</Text>
            <View style={styles.seasonRow}>
              {SEASONS.map(season => (
                <TouchableOpacity
                  key={season.id}
                  style={[
                    styles.seasonItem,
                    selectedSeasons.includes(season.id) && styles.seasonItemSelected,
                  ]}
                  onPress={() => toggleSeason(season.id)}
                >
                  <Text style={styles.seasonIcon}>{season.icon}</Text>
                  <Text
                    style={[
                      styles.seasonLabel,
                      selectedSeasons.includes(season.id) && styles.seasonLabelSelected,
                    ]}
                  >
                    {season.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Occasions */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Повод</Text>
            <View style={styles.occasionGrid}>
              {OCCASIONS.map(occasion => (
                <TouchableOpacity
                  key={occasion}
                  style={[
                    styles.occasionChip,
                    selectedOccasions.includes(occasion) && styles.occasionChipSelected,
                  ]}
                  onPress={() => toggleOccasion(occasion)}
                >
                  <Text
                    style={[
                      styles.occasionText,
                      selectedOccasions.includes(occasion) && styles.occasionTextSelected,
                    ]}
                  >
                    {occasion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Бележки</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Добави бележки за тази дреха..."
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  saveButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: typography.semibold,
    fontSize: typography.md,
  },
  scrollView: {
    flex: 1,
  },
  // Step 1 styles
  imagePickerContainer: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: typography.md,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  imageOptions: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.xxl,
  },
  imageOption: {
    alignItems: 'center',
  },
  imageOptionIcon: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  imageOptionText: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  imageOptionHint: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  tips: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    ...shadows.sm,
  },
  tipsTitle: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  tipItem: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  // Step 2 styles
  imagePreviewContainer: {
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  imagePreview: {
    width: '100%',
    height: 250,
    backgroundColor: colors.border,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  changeImageText: {
    color: colors.white,
    fontSize: typography.sm,
  },
  inputGroup: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 80,
    paddingTop: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  categoryLabel: {
    fontSize: typography.sm,
    color: colors.textPrimary,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  colorItem: {
    alignItems: 'center',
    padding: spacing.xs,
    borderRadius: borderRadius.md,
  },
  colorItemSelected: {
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  colorCircleWhite: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  rowInputs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  inputSpacer: {
    width: spacing.md,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
  },
  priceCurrency: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    marginLeft: spacing.md,
  },
  seasonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  seasonItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seasonItemSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  seasonIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  seasonLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  seasonLabelSelected: {
    color: colors.white,
    fontWeight: typography.medium,
  },
  occasionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  occasionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  occasionChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  occasionText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
  },
  occasionTextSelected: {
    color: colors.white,
    fontWeight: typography.medium,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
