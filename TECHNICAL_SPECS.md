# Wardrobe Manager - Технически спецификации

## 1. Enums и константи

### Категории дрехи (GarmentCategory)
```typescript
enum GarmentCategory {
  // Горна част
  TSHIRT = 'tshirt',           // Тениска
  SHIRT = 'shirt',             // Риза
  BLOUSE = 'blouse',           // Блуза
  POLO = 'polo',               // Поло
  TANK_TOP = 'tank_top',       // Потник
  SWEATER = 'sweater',         // Пуловер
  CARDIGAN = 'cardigan',       // Жилетка
  HOODIE = 'hoodie',           // Суитшърт с качулка
  SWEATSHIRT = 'sweatshirt',   // Суитшърт
  
  // Връхни дрехи
  JACKET = 'jacket',           // Яке
  BLAZER = 'blazer',           // Сако
  COAT = 'coat',               // Палто
  VEST = 'vest',               // Елек
  PARKA = 'parka',             // Парка
  WINDBREAKER = 'windbreaker', // Ветровка
  
  // Долна част
  PANTS = 'pants',             // Панталон
  JEANS = 'jeans',             // Дънки
  SHORTS = 'shorts',           // Къси панталони
  SKIRT = 'skirt',             // Пола
  LEGGINGS = 'leggings',       // Клин
  JOGGERS = 'joggers',         // Спортен панталон
  
  // Цели дрехи
  DRESS = 'dress',             // Рокля
  JUMPSUIT = 'jumpsuit',       // Гащеризон
  ROMPER = 'romper',           // Къс гащеризон
  SUIT = 'suit',               // Костюм
  
  // Обувки
  SNEAKERS = 'sneakers',       // Маратонки
  BOOTS = 'boots',             // Ботуши
  HEELS = 'heels',             // Високи токчета
  FLATS = 'flats',             // Равни обувки
  SANDALS = 'sandals',         // Сандали
  LOAFERS = 'loafers',         // Мокасини
  FORMAL_SHOES = 'formal_shoes', // Официални обувки
  
  // Аксесоари
  BAG = 'bag',                 // Чанта
  BELT = 'belt',               // Колан
  SCARF = 'scarf',             // Шал
  HAT = 'hat',                 // Шапка
  WATCH = 'watch',             // Часовник
  JEWELRY = 'jewelry',         // Бижута
  SUNGLASSES = 'sunglasses',   // Слънчеви очила
  TIE = 'tie',                 // Вратовръзка
  GLOVES = 'gloves',           // Ръкавици
}
```

### Сезони (Season)
```typescript
enum Season {
  SPRING = 'spring',       // Пролет
  SUMMER = 'summer',       // Лято
  FALL = 'fall',           // Есен
  WINTER = 'winter',       // Зима
  ALL_YEAR = 'all_year',   // Целогодишно
}
```

### Стилове (GarmentStyle)
```typescript
enum GarmentStyle {
  CASUAL = 'casual',           // Ежедневен
  BUSINESS = 'business',       // Бизнес/Офис
  BUSINESS_CASUAL = 'business_casual', // Бизнес ежедневен
  FORMAL = 'formal',           // Официален
  SPORT = 'sport',             // Спортен
  ATHLETIC = 'athletic',       // Атлетичен
  STREETWEAR = 'streetwear',   // Улично
  BOHEMIAN = 'bohemian',       // Бохо
  VINTAGE = 'vintage',         // Винтидж
  MINIMALIST = 'minimalist',   // Минималистичен
  PREPPY = 'preppy',           // Преппи
  ROMANTIC = 'romantic',       // Романтичен
  EDGY = 'edgy',               // Дръзък
}
```

### Статус на дреха (GarmentStatus)
```typescript
enum GarmentStatus {
  ACTIVE = 'active',           // Активна (носи се)
  INACTIVE = 'inactive',       // Неактивна (не се носи временно)
  DAMAGED = 'damaged',         // Повредена
  DONATION = 'donation',       // За даряване
  SELL = 'sell',               // За продаване
  ARCHIVED = 'archived',       // Архивирана
}
```

### Поводи (Occasion)
```typescript
enum Occasion {
  EVERYDAY = 'everyday',       // Ежедневие
  WORK = 'work',               // Работа
  MEETING = 'meeting',         // Среща
  DATE = 'date',               // Романтична среща
  PARTY = 'party',             // Парти
  WEDDING = 'wedding',         // Сватба
  FORMAL_EVENT = 'formal_event', // Официално събитие
  INTERVIEW = 'interview',     // Интервю
  SPORT = 'sport',             // Спорт
  OUTDOOR = 'outdoor',         // На открито
  BEACH = 'beach',             // Плаж
  TRAVEL = 'travel',           // Пътуване
  CASUAL_OUTING = 'casual_outing', // Разходка
  DINNER = 'dinner',           // Вечеря навън
  BRUNCH = 'brunch',           // Бранч
}
```

### Цветове (Color)
```typescript
const COLORS = [
  { id: 'black', name: 'Черно', hex: '#000000' },
  { id: 'white', name: 'Бяло', hex: '#FFFFFF' },
  { id: 'gray', name: 'Сиво', hex: '#808080' },
  { id: 'navy', name: 'Тъмносиньо', hex: '#000080' },
  { id: 'blue', name: 'Синьо', hex: '#0000FF' },
  { id: 'light_blue', name: 'Светлосиньо', hex: '#ADD8E6' },
  { id: 'red', name: 'Червено', hex: '#FF0000' },
  { id: 'burgundy', name: 'Бордо', hex: '#800020' },
  { id: 'pink', name: 'Розово', hex: '#FFC0CB' },
  { id: 'orange', name: 'Оранжево', hex: '#FFA500' },
  { id: 'yellow', name: 'Жълто', hex: '#FFFF00' },
  { id: 'green', name: 'Зелено', hex: '#008000' },
  { id: 'olive', name: 'Маслинено', hex: '#808000' },
  { id: 'teal', name: 'Тюркоазено', hex: '#008080' },
  { id: 'purple', name: 'Лилаво', hex: '#800080' },
  { id: 'brown', name: 'Кафяво', hex: '#8B4513' },
  { id: 'beige', name: 'Бежово', hex: '#F5F5DC' },
  { id: 'cream', name: 'Кремаво', hex: '#FFFDD0' },
  { id: 'gold', name: 'Златисто', hex: '#FFD700' },
  { id: 'silver', name: 'Сребристо', hex: '#C0C0C0' },
  { id: 'multicolor', name: 'Многоцветно', hex: null },
  { id: 'pattern', name: 'На шарки', hex: null },
];
```

### Размери
```typescript
// Общи размери
const GENERAL_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

// EU размери за дрехи
const EU_CLOTHING_SIZES = ['32', '34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54'];

// EU размери за обувки
const EU_SHOE_SIZES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'];

// US размери за обувки (мъже)
const US_MENS_SHOE_SIZES = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13', '14'];

// US размери за обувки (жени)
const US_WOMENS_SHOE_SIZES = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11'];
```

---

## 2. API DTOs

### User DTOs
```typescript
// Register
interface RegisterDto {
  email: string;           // @IsEmail()
  password: string;        // @MinLength(8)
  name?: string;
}

// Login
interface LoginDto {
  email: string;
  password: string;
}

// Update Profile
interface UpdateProfileDto {
  name?: string;
  age?: number;            // @Min(13) @Max(120)
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  height?: number;         // in cm
  weight?: number;         // in kg
  sizeTop?: string;
  sizeBottom?: string;
  sizeShoes?: string;
  stylePreferences?: GarmentStyle[];
  location?: string;       // City, Country
}
```

### Garment DTOs
```typescript
// Create Garment
interface CreateGarmentDto {
  name?: string;
  category: GarmentCategory;      // @IsEnum()
  subcategory?: string;
  colors: string[];               // @IsArray() @ArrayMinSize(1)
  season: Season;                 // @IsEnum()
  style?: GarmentStyle;           // @IsEnum()
  size?: string;
  status?: GarmentStatus;         // Default: ACTIVE
}

// Update Garment
interface UpdateGarmentDto {
  name?: string;
  category?: GarmentCategory;
  subcategory?: string;
  colors?: string[];
  season?: Season;
  style?: GarmentStyle;
  size?: string;
  status?: GarmentStatus;
}

// Garment Query (Filters)
interface GarmentQueryDto {
  category?: GarmentCategory[];
  colors?: string[];
  season?: Season[];
  style?: GarmentStyle[];
  status?: GarmentStatus[];
  search?: string;
  page?: number;                  // Default: 1
  limit?: number;                 // Default: 20, Max: 100
  sortBy?: 'createdAt' | 'name' | 'category';
  sortOrder?: 'asc' | 'desc';
}

// Garment Response
interface GarmentResponseDto {
  id: string;
  name: string | null;
  category: GarmentCategory;
  subcategory: string | null;
  colors: string[];
  season: Season;
  style: GarmentStyle | null;
  size: string | null;
  imageUrl: string;
  thumbnailUrl: string;
  status: GarmentStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

### Outfit DTOs
```typescript
// Create Outfit
interface CreateOutfitDto {
  name: string;                   // @IsNotEmpty()
  garmentIds: string[];           // @IsArray() @ArrayMinSize(1)
  occasion?: Occasion;
  season?: Season;
  notes?: string;
}

// Update Outfit
interface UpdateOutfitDto {
  name?: string;
  garmentIds?: string[];
  occasion?: Occasion;
  season?: Season;
  notes?: string;
}

// Outfit Response
interface OutfitResponseDto {
  id: string;
  name: string;
  occasion: Occasion | null;
  season: Season | null;
  notes: string | null;
  garments: GarmentResponseDto[];
  createdAt: Date;
  updatedAt: Date;
  wearCount: number;              // From wear_history
  lastWornAt: Date | null;
}
```

### AI DTOs
```typescript
// Suggest Outfit Request
interface SuggestOutfitDto {
  occasion: Occasion;
  date?: Date;                    // Default: today
  includeWeather?: boolean;       // Default: true
  count?: number;                 // Default: 3, Max: 5
  excludeGarmentIds?: string[];   // Дрехи, които да не се използват
}

// AI Suggestion Response
interface OutfitSuggestionDto {
  id: string;                     // Temporary ID
  garments: GarmentResponseDto[];
  explanation: string;
  occasionFit: 'perfect' | 'good' | 'acceptable';
  weatherInfo?: WeatherInfoDto;
}

// Chat Message
interface ChatMessageDto {
  content: string;                // @IsNotEmpty()
  type?: 'text' | 'outfit_request';
}

// Chat Response
interface ChatResponseDto {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  suggestions?: OutfitSuggestionDto[];
  createdAt: Date;
}

// Weather Info
interface WeatherInfoDto {
  temperature: number;
  feelsLike: number;
  description: string;
  precipitation: boolean;
  humidity: number;
  windSpeed: number;
  icon: string;
}
```

### n8n Webhook DTOs
```typescript
// Classification Request (to n8n)
interface ClassifyGarmentRequest {
  garmentId: string;
  imageUrl: string;
  userId: string;
}

// Classification Response (from n8n)
interface ClassifyGarmentResponse {
  garmentId: string;
  category: GarmentCategory;
  subcategory?: string;
  colors: string[];
  style?: GarmentStyle;
  season?: Season;
  confidence: number;
}

// AI Suggestion Request (to n8n)
interface AiSuggestionRequest {
  userId: string;
  userProfile: {
    gender: string;
    age: number;
    stylePreferences: GarmentStyle[];
  };
  garments: {
    id: string;
    category: GarmentCategory;
    colors: string[];
    style: GarmentStyle | null;
    season: Season;
  }[];
  occasion: Occasion;
  weatherData?: WeatherInfoDto;
  count: number;
}

// AI Suggestion Response (from n8n)
interface AiSuggestionResponse {
  suggestions: {
    garmentIds: string[];
    explanation: string;
    occasionFit: 'perfect' | 'good' | 'acceptable';
  }[];
}
```

---

## 3. API Response Formats

### Success Response
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
```

### Error Response
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

### Error Codes
```typescript
enum ErrorCode {
  // Auth Errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // Validation Errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  
  // Resource Errors
  NOT_FOUND = 'NOT_FOUND',
  GARMENT_NOT_FOUND = 'GARMENT_NOT_FOUND',
  OUTFIT_NOT_FOUND = 'OUTFIT_NOT_FOUND',
  
  // AI Errors
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
  CLASSIFICATION_FAILED = 'CLASSIFICATION_FAILED',
  
  // Server Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}
```

---

## 4. n8n Prompts

### Classify Garment Prompt
```
You are a fashion expert AI that classifies clothing items from images.

Analyze the provided image and return a JSON object with the following properties:

1. category: The main category of the garment. Must be one of: [list of GarmentCategory values]
2. subcategory: A more specific type (optional, e.g., "crew neck t-shirt", "slim fit jeans")
3. colors: An array of colors present in the garment. Use these values: [list of color IDs]
   - First color should be the primary/dominant color
   - Include secondary colors if significant
4. style: The style of the garment. Must be one of: [list of GarmentStyle values]
5. season: Recommended season for wearing. Must be one of: spring, summer, fall, winter, all_year

Consider:
- Material weight and warmth for season
- Cut and design for style classification
- Accurate color identification

Return ONLY valid JSON, no additional text.

Example response:
{
  "category": "tshirt",
  "subcategory": "graphic t-shirt",
  "colors": ["black", "white"],
  "style": "casual",
  "season": "all_year"
}
```

### AI Outfit Suggestion Prompt
```
You are a professional fashion stylist helping users create perfect outfits.

USER PROFILE:
- Gender: {{gender}}
- Age: {{age}}
- Style preferences: {{stylePreferences}}

AVAILABLE WARDROBE:
{{#each garments}}
- ID: {{this.id}}
  Category: {{this.category}}
  Colors: {{this.colors}}
  Style: {{this.style}}
  Season: {{this.season}}
{{/each}}

CONTEXT:
- Occasion: {{occasion}}
- Weather: Temperature {{weather.temperature}}°C, {{weather.description}}
- Season: {{currentSeason}}

TASK:
Create {{count}} complete outfit suggestions using ONLY items from the available wardrobe.

RULES:
1. Each outfit must be cohesive and appropriate for the occasion
2. Consider weather appropriateness (temperature, precipitation)
3. Match colors harmoniously
4. Use garment IDs exactly as provided
5. Each outfit should typically include:
   - Top layer (shirt, blouse, sweater)
   - Bottom layer (pants, skirt) OR full piece (dress)
   - Outerwear if weather requires
   - Shoes (if available)
   - Optional accessories

RESPONSE FORMAT (JSON only):
{
  "suggestions": [
    {
      "garmentIds": ["id1", "id2", "id3"],
      "explanation": "Brief explanation of why this outfit works for the occasion and weather",
      "occasionFit": "perfect" | "good" | "acceptable"
    }
  ]
}

Provide exactly {{count}} suggestions, ordered from best to least suitable.
```

---

## 5. Environment Variables

```env
# Application
NODE_ENV=development|production
PORT=3000
FRONTEND_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wardrobe_manager

# Redis (optional for MVP)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Storage (S3 Compatible)
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_BUCKET=wardrobe-manager
STORAGE_ACCESS_KEY=your-access-key
STORAGE_SECRET_KEY=your-secret-key
STORAGE_REGION=eu-central-1
STORAGE_PUBLIC_URL=https://your-cdn.com

# n8n
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
N8N_API_KEY=your-n8n-api-key

# OpenAI (for direct calls if needed)
OPENAI_API_KEY=sk-your-openai-key

# Weather API
OPENWEATHERMAP_API_KEY=your-weather-api-key

# Email (for password reset)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM=Wardrobe Manager <noreply@example.com>
```

---

## 6. File Upload Specifications

### Accepted Image Formats
- JPEG/JPG
- PNG
- WebP
- HEIC/HEIF (convert to JPEG on upload)

### Image Processing
```typescript
interface ImageProcessingConfig {
  // Original image
  original: {
    maxWidth: 2000,
    maxHeight: 2000,
    quality: 85,
    format: 'jpeg',
  },
  // Thumbnail for cards
  thumbnail: {
    width: 400,
    height: 400,
    fit: 'cover',
    quality: 80,
    format: 'webp',
  },
  // Mini thumbnail for lists
  mini: {
    width: 100,
    height: 100,
    fit: 'cover',
    quality: 75,
    format: 'webp',
  },
}
```

### Upload Limits
- Max file size: 10MB
- Max files per request: 1 (for MVP)
- Allowed MIME types: image/jpeg, image/png, image/webp, image/heic

---

*Версия: 1.0*
*Последна актуализация: Декември 2024*
