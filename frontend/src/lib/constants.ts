// Garment Categories (as enum for zod validation)
export enum GarmentCategory {
  // Tops
  TSHIRT = 'tshirt',
  SHIRT = 'shirt',
  BLOUSE = 'blouse',
  POLO = 'polo',
  TANK_TOP = 'tank_top',
  SWEATER = 'sweater',
  CARDIGAN = 'cardigan',
  HOODIE = 'hoodie',
  SWEATSHIRT = 'sweatshirt',
  // Outerwear
  JACKET = 'jacket',
  BLAZER = 'blazer',
  COAT = 'coat',
  VEST = 'vest',
  PARKA = 'parka',
  WINDBREAKER = 'windbreaker',
  // Bottoms
  PANTS = 'pants',
  JEANS = 'jeans',
  SHORTS = 'shorts',
  SKIRT = 'skirt',
  LEGGINGS = 'leggings',
  JOGGERS = 'joggers',
  // Full body
  DRESS = 'dress',
  JUMPSUIT = 'jumpsuit',
  ROMPER = 'romper',
  SUIT = 'suit',
  // Shoes
  SNEAKERS = 'sneakers',
  BOOTS = 'boots',
  HEELS = 'heels',
  FLATS = 'flats',
  SANDALS = 'sandals',
  LOAFERS = 'loafers',
  FORMAL_SHOES = 'formal_shoes',
  // Accessories
  BAG = 'bag',
  BELT = 'belt',
  SCARF = 'scarf',
  HAT = 'hat',
  WATCH = 'watch',
  JEWELRY = 'jewelry',
  SUNGLASSES = 'sunglasses',
  TIE = 'tie',
  GLOVES = 'gloves',
}

// Seasons (as enum for zod validation)
export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  FALL = 'fall',
  WINTER = 'winter',
  ALL_YEAR = 'all_year',
}

// Garment Styles (as enum for zod validation)
export enum GarmentStyle {
  CASUAL = 'casual',
  BUSINESS = 'business',
  BUSINESS_CASUAL = 'business_casual',
  FORMAL = 'formal',
  SPORT = 'sport',
  ATHLETIC = 'athletic',
  STREETWEAR = 'streetwear',
  BOHEMIAN = 'bohemian',
  VINTAGE = 'vintage',
  MINIMALIST = 'minimalist',
  PREPPY = 'preppy',
  ROMANTIC = 'romantic',
  EDGY = 'edgy',
}

// Garment Status (as enum for zod validation)
export enum GarmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DAMAGED = 'damaged',
  DONATION = 'donation',
  SELL = 'sell',
  ARCHIVED = 'archived',
}

// Occasions (as enum for zod validation)
export enum Occasion {
  EVERYDAY = 'everyday',
  WORK = 'work',
  MEETING = 'meeting',
  DATE = 'date',
  PARTY = 'party',
  WEDDING = 'wedding',
  FORMAL_EVENT = 'formal_event',
  INTERVIEW = 'interview',
  SPORT = 'sport',
  OUTDOOR = 'outdoor',
  BEACH = 'beach',
  TRAVEL = 'travel',
  CASUAL_OUTING = 'casual_outing',
  DINNER = 'dinner',
  BRUNCH = 'brunch',
}

// Gender
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: 'Мъж',
  [Gender.FEMALE]: 'Жена',
  [Gender.OTHER]: 'Друго',
};

// Garment Colors (enum for form validation)
export enum GarmentColor {
  BLACK = 'black',
  WHITE = 'white',
  GRAY = 'gray',
  NAVY = 'navy',
  BLUE = 'blue',
  LIGHT_BLUE = 'light_blue',
  RED = 'red',
  BURGUNDY = 'burgundy',
  PINK = 'pink',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  GREEN = 'green',
  OLIVE = 'olive',
  TEAL = 'teal',
  PURPLE = 'purple',
  BROWN = 'brown',
  BEIGE = 'beige',
  CREAM = 'cream',
  GOLD = 'gold',
  SILVER = 'silver',
  MULTICOLOR = 'multicolor',
  PATTERN = 'pattern',
}

export const COLOR_LABELS: Record<GarmentColor, string> = {
  [GarmentColor.BLACK]: 'Черно',
  [GarmentColor.WHITE]: 'Бяло',
  [GarmentColor.GRAY]: 'Сиво',
  [GarmentColor.NAVY]: 'Тъмносиньо',
  [GarmentColor.BLUE]: 'Синьо',
  [GarmentColor.LIGHT_BLUE]: 'Светлосиньо',
  [GarmentColor.RED]: 'Червено',
  [GarmentColor.BURGUNDY]: 'Бордо',
  [GarmentColor.PINK]: 'Розово',
  [GarmentColor.ORANGE]: 'Оранжево',
  [GarmentColor.YELLOW]: 'Жълто',
  [GarmentColor.GREEN]: 'Зелено',
  [GarmentColor.OLIVE]: 'Маслинено',
  [GarmentColor.TEAL]: 'Тюркоазено',
  [GarmentColor.PURPLE]: 'Лилаво',
  [GarmentColor.BROWN]: 'Кафяво',
  [GarmentColor.BEIGE]: 'Бежово',
  [GarmentColor.CREAM]: 'Кремаво',
  [GarmentColor.GOLD]: 'Златисто',
  [GarmentColor.SILVER]: 'Сребристо',
  [GarmentColor.MULTICOLOR]: 'Многоцветно',
  [GarmentColor.PATTERN]: 'На шарки',
};

// Colors with hex values (for color pickers)
export const COLORS = [
  { id: 'black', name: 'Черно', nameEn: 'Black', hex: '#000000' },
  { id: 'white', name: 'Бяло', nameEn: 'White', hex: '#FFFFFF' },
  { id: 'gray', name: 'Сиво', nameEn: 'Gray', hex: '#808080' },
  { id: 'navy', name: 'Тъмносиньо', nameEn: 'Navy', hex: '#000080' },
  { id: 'blue', name: 'Синьо', nameEn: 'Blue', hex: '#0000FF' },
  { id: 'light_blue', name: 'Светлосиньо', nameEn: 'Light Blue', hex: '#ADD8E6' },
  { id: 'red', name: 'Червено', nameEn: 'Red', hex: '#FF0000' },
  { id: 'burgundy', name: 'Бордо', nameEn: 'Burgundy', hex: '#800020' },
  { id: 'pink', name: 'Розово', nameEn: 'Pink', hex: '#FFC0CB' },
  { id: 'orange', name: 'Оранжево', nameEn: 'Orange', hex: '#FFA500' },
  { id: 'yellow', name: 'Жълто', nameEn: 'Yellow', hex: '#FFFF00' },
  { id: 'green', name: 'Зелено', nameEn: 'Green', hex: '#008000' },
  { id: 'olive', name: 'Маслинено', nameEn: 'Olive', hex: '#808000' },
  { id: 'teal', name: 'Тюркоазено', nameEn: 'Teal', hex: '#008080' },
  { id: 'purple', name: 'Лилаво', nameEn: 'Purple', hex: '#800080' },
  { id: 'brown', name: 'Кафяво', nameEn: 'Brown', hex: '#8B4513' },
  { id: 'beige', name: 'Бежово', nameEn: 'Beige', hex: '#F5F5DC' },
  { id: 'cream', name: 'Кремаво', nameEn: 'Cream', hex: '#FFFDD0' },
  { id: 'gold', name: 'Златисто', nameEn: 'Gold', hex: '#FFD700' },
  { id: 'silver', name: 'Сребристо', nameEn: 'Silver', hex: '#C0C0C0' },
  { id: 'multicolor', name: 'Многоцветно', nameEn: 'Multicolor', hex: null },
  { id: 'pattern', name: 'На шарки', nameEn: 'Pattern', hex: null },
] as const;

// Size options
export const GENERAL_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
export const EU_CLOTHING_SIZES = ['32', '34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54'];
export const EU_SHOE_SIZES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'];

// Labels for UI (Bulgarian)
export const CATEGORY_LABELS: Record<GarmentCategory, string> = {
  [GarmentCategory.TSHIRT]: 'Тениска',
  [GarmentCategory.SHIRT]: 'Риза',
  [GarmentCategory.BLOUSE]: 'Блуза',
  [GarmentCategory.POLO]: 'Поло',
  [GarmentCategory.TANK_TOP]: 'Потник',
  [GarmentCategory.SWEATER]: 'Пуловер',
  [GarmentCategory.CARDIGAN]: 'Жилетка',
  [GarmentCategory.HOODIE]: 'Суитшърт с качулка',
  [GarmentCategory.SWEATSHIRT]: 'Суитшърт',
  [GarmentCategory.JACKET]: 'Яке',
  [GarmentCategory.BLAZER]: 'Сако',
  [GarmentCategory.COAT]: 'Палто',
  [GarmentCategory.VEST]: 'Елек',
  [GarmentCategory.PARKA]: 'Парка',
  [GarmentCategory.WINDBREAKER]: 'Ветровка',
  [GarmentCategory.PANTS]: 'Панталон',
  [GarmentCategory.JEANS]: 'Дънки',
  [GarmentCategory.SHORTS]: 'Къси панталони',
  [GarmentCategory.SKIRT]: 'Пола',
  [GarmentCategory.LEGGINGS]: 'Клин',
  [GarmentCategory.JOGGERS]: 'Спортен панталон',
  [GarmentCategory.DRESS]: 'Рокля',
  [GarmentCategory.JUMPSUIT]: 'Гащеризон',
  [GarmentCategory.ROMPER]: 'Къс гащеризон',
  [GarmentCategory.SUIT]: 'Костюм',
  [GarmentCategory.SNEAKERS]: 'Маратонки',
  [GarmentCategory.BOOTS]: 'Ботуши',
  [GarmentCategory.HEELS]: 'Високи токчета',
  [GarmentCategory.FLATS]: 'Равни обувки',
  [GarmentCategory.SANDALS]: 'Сандали',
  [GarmentCategory.LOAFERS]: 'Мокасини',
  [GarmentCategory.FORMAL_SHOES]: 'Официални обувки',
  [GarmentCategory.BAG]: 'Чанта',
  [GarmentCategory.BELT]: 'Колан',
  [GarmentCategory.SCARF]: 'Шал',
  [GarmentCategory.HAT]: 'Шапка',
  [GarmentCategory.WATCH]: 'Часовник',
  [GarmentCategory.JEWELRY]: 'Бижута',
  [GarmentCategory.SUNGLASSES]: 'Слънчеви очила',
  [GarmentCategory.TIE]: 'Вратовръзка',
  [GarmentCategory.GLOVES]: 'Ръкавици',
};

export const SEASON_LABELS: Record<Season, string> = {
  [Season.SPRING]: 'Пролет',
  [Season.SUMMER]: 'Лято',
  [Season.FALL]: 'Есен',
  [Season.WINTER]: 'Зима',
  [Season.ALL_YEAR]: 'Целогодишно',
};

export const STYLE_LABELS: Record<GarmentStyle, string> = {
  [GarmentStyle.CASUAL]: 'Ежедневен',
  [GarmentStyle.BUSINESS]: 'Бизнес',
  [GarmentStyle.BUSINESS_CASUAL]: 'Бизнес ежедневен',
  [GarmentStyle.FORMAL]: 'Официален',
  [GarmentStyle.SPORT]: 'Спортен',
  [GarmentStyle.ATHLETIC]: 'Атлетичен',
  [GarmentStyle.STREETWEAR]: 'Улично',
  [GarmentStyle.BOHEMIAN]: 'Бохо',
  [GarmentStyle.VINTAGE]: 'Винтидж',
  [GarmentStyle.MINIMALIST]: 'Минималистичен',
  [GarmentStyle.PREPPY]: 'Преппи',
  [GarmentStyle.ROMANTIC]: 'Романтичен',
  [GarmentStyle.EDGY]: 'Дръзък',
};

export const OCCASION_LABELS: Record<Occasion, string> = {
  [Occasion.EVERYDAY]: 'Ежедневие',
  [Occasion.WORK]: 'Работа',
  [Occasion.MEETING]: 'Среща',
  [Occasion.DATE]: 'Романтична среща',
  [Occasion.PARTY]: 'Парти',
  [Occasion.WEDDING]: 'Сватба',
  [Occasion.FORMAL_EVENT]: 'Официално събитие',
  [Occasion.INTERVIEW]: 'Интервю',
  [Occasion.SPORT]: 'Спорт',
  [Occasion.OUTDOOR]: 'На открито',
  [Occasion.BEACH]: 'Плаж',
  [Occasion.TRAVEL]: 'Пътуване',
  [Occasion.CASUAL_OUTING]: 'Разходка',
  [Occasion.DINNER]: 'Вечеря навън',
  [Occasion.BRUNCH]: 'Бранч',
};

export const STATUS_LABELS: Record<GarmentStatus, string> = {
  [GarmentStatus.ACTIVE]: 'Активна',
  [GarmentStatus.INACTIVE]: 'Неактивна',
  [GarmentStatus.DAMAGED]: 'Повредена',
  [GarmentStatus.DONATION]: 'За даряване',
  [GarmentStatus.SELL]: 'За продаване',
  [GarmentStatus.ARCHIVED]: 'Архивирана',
};
