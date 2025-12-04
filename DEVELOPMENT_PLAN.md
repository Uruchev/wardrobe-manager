# Wardrobe Manager - План за разработка

## 📋 Съдържание
1. [Обобщение на проекта](#1-обобщение-на-проекта)
2. [Технически стек](#2-технически-стек)
3. [Структура на проекта](#3-структура-на-проекта)
4. [Фази на разработка](#4-фази-на-разработка)
5. [Детайлен план по етапи](#5-детайлен-план-по-етапи)
6. [n8n Workflows](#6-n8n-workflows)
7. [API Endpoints](#7-api-endpoints)
8. [База данни](#8-база-данни)
9. [Чеклисти за всеки етап](#9-чеклисти-за-всеки-етап)

---

## 1. Обобщение на проекта

### Цел
AI базиран личен стилист и организатор на гардероба, който:
- Организира дрехите в дигитален гардероб
- Предлага модни комбинации (outfits) съобразени с повода, времето, сезона и личния стил
- Визуализира как би изглеждал потребителят с дадени дрехи (бъдещо)
- Препоръчва нови дрехи за покупка при нужда (бъдещо)

### MVP Функционалности
- [x] Регистрация и логин (email + парола)
- [x] Потребителски профил
- [x] Модул "Моят гардероб" - качване/снимане на дрехи
- [x] Автоматична класификация на дрехи
- [x] Табличен/картов изглед с филтри
- [x] AI чат интерфейс за модни съвети
- [x] AI предложения за outfits
- [x] Интеграция с Weather API
- [x] Запазване и преглед на outfits

### Бъдещи функционалности (предвидени в архитектурата)
- [ ] Гласови команди и отговори
- [ ] Визуализация "потребител + дрехи"
- [ ] Интеграция с онлайн магазини
- [ ] Статистики и cost-per-wear
- [ ] Gap analysis
- [ ] Travel capsule / packing list

---

## 2. Технически стек

### Frontend
```
Framework: Next.js 14+ (App Router)
Styling: Tailwind CSS + shadcn/ui
State Management: Zustand или React Query
Форми: React Hook Form + Zod
i18n: next-intl (БГ/EN)
```

### Backend
```
Framework: NestJS (Node.js)
ORM: Prisma
Валидация: class-validator, class-transformer
Auth: JWT + Passport.js
API: REST (GraphQL опционално за по-късно)
```

### База данни
```
Primary: PostgreSQL
Cache: Redis (опционално за MVP)
```

### Storage
```
Снимки: AWS S3 / MinIO / Cloudflare R2
CDN: Cloudflare (опционално)
```

### AI & Автоматизации
```
Оркестратор: n8n (self-hosted или cloud)
LLM: OpenAI API (GPT-4/GPT-4o)
Vision: OpenAI Vision API / Google Cloud Vision
Weather: OpenWeatherMap API
```

### DevOps
```
Контейнеризация: Docker + Docker Compose
CI/CD: GitHub Actions
Хостинг: Vercel (Frontend) + Railway/Render (Backend) + n8n Cloud
```

---

## 3. Структура на проекта

```
wardrobe-manager/
├── frontend/                    # Next.js приложение
│   ├── app/
│   │   ├── (auth)/             # Логин, регистрация
│   │   ├── (dashboard)/        # Защитени страници
│   │   │   ├── wardrobe/       # Гардероб
│   │   │   ├── outfits/        # Outfits
│   │   │   ├── ai-stylist/     # AI чат
│   │   │   └── profile/        # Профил
│   │   └── api/                # API routes (ако има нужда)
│   ├── components/
│   │   ├── ui/                 # shadcn компоненти
│   │   ├── wardrobe/           # Компоненти за гардероб
│   │   ├── outfits/            # Компоненти за outfits
│   │   └── ai/                 # AI чат компоненти
│   ├── lib/                    # Utilities, API client
│   ├── hooks/                  # Custom hooks
│   ├── stores/                 # Zustand stores
│   └── messages/               # i18n файлове (bg, en)
│
├── backend/                     # NestJS приложение
│   ├── src/
│   │   ├── auth/               # Автентикация модул
│   │   ├── users/              # Потребители модул
│   │   ├── garments/           # Дрехи модул
│   │   ├── outfits/            # Outfits модул
│   │   ├── ai/                 # AI интеграция модул
│   │   ├── weather/            # Weather модул
│   │   ├── storage/            # File storage модул
│   │   ├── n8n/                # n8n webhook интеграция
│   │   └── common/             # Shared utilities
│   └── prisma/
│       ├── schema.prisma       # DB schema
│       └── migrations/         # Миграции
│
├── n8n/                         # n8n конфигурации
│   ├── workflows/              # Exported workflows (JSON)
│   │   ├── classify-garment.json
│   │   ├── ai-outfit-suggestion.json
│   │   ├── get-weather.json
│   │   └── generate-visualization.json
│   └── credentials/            # Credential templates
│
├── docker/                      # Docker конфигурации
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── Dockerfiles/
│
├── docs/                        # Документация
│   ├── api/                    # API документация
│   ├── architecture/           # Архитектурни диаграми
│   └── guides/                 # Ръководства
│
└── scripts/                     # Помощни скриптове
```

---

## 4. Фази на разработка

```
┌─────────────────────────────────────────────────────────────────┐
│                    ФАЗА 1: ФУНДАМЕНТ (2-3 седмици)              │
├─────────────────────────────────────────────────────────────────┤
│ Етап 1.1: Инфраструктура и настройка                            │
│ Етап 1.2: База данни и схеми                                    │
│ Етап 1.3: Регистрация и автентикация                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ФАЗА 2: ГАРДЕРОБ (2-3 седмици)               │
├─────────────────────────────────────────────────────────────────┤
│ Етап 2.1: CRUD за дрехи + качване на снимки                     │
│ Етап 2.2: n8n workflow за класификация                          │
│ Етап 2.3: UI за гардероб - карти, филтри, търсене               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ФАЗА 3: OUTFITS (1-2 седмици)                │
├─────────────────────────────────────────────────────────────────┤
│ Етап 3.1: CRUD за outfits                                       │
│ Етап 3.2: UI за създаване и управление на outfits               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ФАЗА 4: AI СТИЛИСТ (2-3 седмици)             │
├─────────────────────────────────────────────────────────────────┤
│ Етап 4.1: n8n workflow за AI suggestions                        │
│ Етап 4.2: Интеграция с Weather API                              │
│ Етап 4.3: AI чат интерфейс                                      │
│ Етап 4.4: Запазване на AI предложения като outfits              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ФАЗА 5: ПОЛИРАНЕ (1-2 седмици)               │
├─────────────────────────────────────────────────────────────────┤
│ Етап 5.1: UX подобрения и тестване                              │
│ Етап 5.2: i18n (БГ/EN)                                          │
│ Етап 5.3: Документация и deployment                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Детайлен план по етапи

### ФАЗА 1: ФУНДАМЕНТ

#### Етап 1.1: Инфраструктура и настройка
**Времетраене:** 3-5 дни

| # | Задача | Описание |
|---|--------|----------|
| 1.1.1 | Създаване на repositories | GitHub repos за frontend, backend |
| 1.1.2 | Next.js setup | Инициализация с App Router, Tailwind, shadcn/ui |
| 1.1.3 | NestJS setup | Инициализация с Prisma, class-validator |
| 1.1.4 | Docker setup | docker-compose за dev среда (PostgreSQL, Redis, n8n) |
| 1.1.5 | n8n setup | Локална/cloud инстанция, базови credentials |
| 1.1.6 | Environment configs | .env файлове, secrets management |

**Deliverables:**
- Работещи dev среди за frontend и backend
- Docker compose за локална разработка
- n8n инстанция готова за workflows
- Документирани environment variables

---

#### Етап 1.2: База данни и схеми
**Времетраене:** 2-3 дни

| # | Задача | Описание |
|---|--------|----------|
| 1.2.1 | Prisma schema | Дефиниране на всички модели (виж секция 8) |
| 1.2.2 | Миграции | Генериране и прилагане на initial migration |
| 1.2.3 | Seed данни | Примерни данни за development |
| 1.2.4 | DB индекси | Оптимизация за честите заявки |

**Prisma Schema (основа):**
```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  passwordHash      String
  name              String?
  age               Int?
  gender            String?
  height            Int?
  weight            Int?
  sizeTop           String?
  sizeBottom        String?
  sizeShoes         String?
  stylePreferences  Json?
  location          String?
  profileImageUrl   String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  garments          Garment[]
  outfits           Outfit[]
  wearHistory       WearHistory[]
  aiChatSessions    AiChatSession[]
}

model Garment {
  id            String    @id @default(cuid())
  userId        String
  name          String?
  category      String
  subcategory   String?
  colors        Json
  season        String
  style         String?
  size          String?
  imageUrl      String
  status        String    @default("active")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id])
  outfitItems   OutfitItem[]
  wearHistory   WearHistory[]
}

model Outfit {
  id          String    @id @default(cuid())
  userId      String
  name        String
  occasion    String?
  season      String?
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  user        User      @relation(fields: [userId], references: [id])
  items       OutfitItem[]
  wearHistory WearHistory[]
}

model OutfitItem {
  id        String  @id @default(cuid())
  outfitId  String
  garmentId String
  
  outfit    Outfit  @relation(fields: [outfitId], references: [id], onDelete: Cascade)
  garment   Garment @relation(fields: [garmentId], references: [id])
  
  @@unique([outfitId, garmentId])
}

model WearHistory {
  id        String    @id @default(cuid())
  userId    String
  garmentId String?
  outfitId  String?
  wornAt    DateTime  @default(now())
  
  user      User      @relation(fields: [userId], references: [id])
  garment   Garment?  @relation(fields: [garmentId], references: [id])
  outfit    Outfit?   @relation(fields: [outfitId], references: [id])
}

model AiChatSession {
  id        String      @id @default(cuid())
  userId    String
  type      String
  createdAt DateTime    @default(now())
  
  user      User        @relation(fields: [userId], references: [id])
  messages  AiMessage[]
}

model AiMessage {
  id        String    @id @default(cuid())
  sessionId String
  sender    String    // 'user' | 'assistant'
  content   Json
  createdAt DateTime  @default(now())
  
  session   AiChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}
```

---

#### Етап 1.3: Регистрация и автентикация
**Времетраене:** 4-5 дни

| # | Задача | Описание |
|---|--------|----------|
| 1.3.1 | Auth module (BE) | NestJS auth module с JWT strategy |
| 1.3.2 | User module (BE) | CRUD за потребители |
| 1.3.3 | Auth guards (BE) | JWT guard, role guard |
| 1.3.4 | Password reset (BE) | Забравена парола flow |
| 1.3.5 | Login page (FE) | Форма за вход |
| 1.3.6 | Register page (FE) | Форма за регистрация |
| 1.3.7 | Auth context (FE) | React context/store за auth state |
| 1.3.8 | Protected routes (FE) | Middleware за защитени страници |
| 1.3.9 | Profile page (FE) | Преглед и редакция на профил |

**API Endpoints:**
```
POST   /auth/register     - Регистрация
POST   /auth/login        - Вход
POST   /auth/logout       - Изход
POST   /auth/refresh      - Refresh token
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /users/me          - Текущ потребител
PATCH  /users/me          - Update профил
POST   /users/me/avatar   - Upload профилна снимка
```

---

### ФАЗА 2: ГАРДЕРОБ

#### Етап 2.1: CRUD за дрехи + качване на снимки
**Времетраене:** 4-5 дни

| # | Задача | Описание |
|---|--------|----------|
| 2.1.1 | Storage module (BE) | S3/MinIO интеграция за снимки |
| 2.1.2 | Garments module (BE) | CRUD endpoints |
| 2.1.3 | Image upload (BE) | Multipart upload, resizing, thumbnails |
| 2.1.4 | Garment validation (BE) | DTO валидация |
| 2.1.5 | n8n webhook (BE) | Endpoint за получаване на класификация |

**API Endpoints:**
```
POST   /garments              - Създаване на дреха
GET    /garments              - Списък (с филтри, пагинация)
GET    /garments/:id          - Детайли за дреха
PATCH  /garments/:id          - Update дреха
DELETE /garments/:id          - Изтриване (soft delete)
POST   /garments/:id/classify - Ръчно trigger класификация
POST   /n8n/garment-classified - Webhook от n8n
```

**Garment DTO:**
```typescript
class CreateGarmentDto {
  name?: string;
  category: GarmentCategory;    // enum
  subcategory?: string;
  colors: string[];
  season: Season;               // enum
  style?: GarmentStyle;         // enum
  size?: string;
  status?: GarmentStatus;       // enum
}

enum GarmentCategory {
  TSHIRT = 'tshirt',
  SHIRT = 'shirt',
  BLOUSE = 'blouse',
  SWEATER = 'sweater',
  JACKET = 'jacket',
  COAT = 'coat',
  PANTS = 'pants',
  JEANS = 'jeans',
  SHORTS = 'shorts',
  SKIRT = 'skirt',
  DRESS = 'dress',
  SHOES = 'shoes',
  ACCESSORY = 'accessory',
  // ... други
}

enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  FALL = 'fall',
  WINTER = 'winter',
  ALL_YEAR = 'all_year',
}

enum GarmentStyle {
  CASUAL = 'casual',
  BUSINESS = 'business',
  SPORT = 'sport',
  ELEGANT = 'elegant',
  STREETWEAR = 'streetwear',
}

enum GarmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DAMAGED = 'damaged',
  DONATION = 'donation',
}
```

---

#### Етап 2.2: n8n Workflow за класификация
**Времетраене:** 2-3 дни

| # | Задача | Описание |
|---|--------|----------|
| 2.2.1 | Classify Garment workflow | n8n workflow с Vision API |
| 2.2.2 | Category mapping | Mapping на AI резултати към enums |
| 2.2.3 | Error handling | Fallback при неуспешна класификация |
| 2.2.4 | Testing | Тестове с различни типове дрехи |

**Workflow: Classify Garment**
```
[Webhook Trigger]
       │
       ▼
[HTTP Request: Vision API]
  - Изпращане на image_url
  - Prompt за класификация
       │
       ▼
[Function: Parse Response]
  - Извличане на category, colors, style
  - Mapping към вътрешни стойности
       │
       ▼
[HTTP Request: Callback to Backend]
  - POST /n8n/garment-classified
  - Body: { garmentId, category, colors, style }
```

---

#### Етап 2.3: UI за гардероб
**Времетраене:** 4-5 дни

| # | Задача | Описание |
|---|--------|----------|
| 2.3.1 | Wardrobe page | Основна страница с layout |
| 2.3.2 | Garment card | Компонент за карта на дреха |
| 2.3.3 | Garment grid | Grid изглед с responsive design |
| 2.3.4 | Filters sidebar | Филтри по category, color, season, style |
| 2.3.5 | Search | Търсене по име/тагове |
| 2.3.6 | Add garment modal | Модал за добавяне с image upload |
| 2.3.7 | Edit garment modal | Модал за редакция |
| 2.3.8 | Camera capture | Снимане директно от камера |
| 2.3.9 | Loading states | Skeletons, loading indicators |
| 2.3.10 | Empty states | UI за празен гардероб |

**Компоненти:**
```
components/wardrobe/
├── WardrobePage.tsx
├── GarmentGrid.tsx
├── GarmentCard.tsx
├── GarmentFilters.tsx
├── GarmentSearch.tsx
├── AddGarmentModal.tsx
├── EditGarmentModal.tsx
├── ImageUploader.tsx
├── CameraCapture.tsx
└── GarmentDetailView.tsx
```

---

### ФАЗА 3: OUTFITS

#### Етап 3.1: CRUD за outfits
**Времетраене:** 2-3 дни

| # | Задача | Описание |
|---|--------|----------|
| 3.1.1 | Outfits module (BE) | CRUD endpoints |
| 3.1.2 | OutfitItems logic | Many-to-many връзка |
| 3.1.3 | Outfit validation | DTO валидация |
| 3.1.4 | Outfit queries | Include garments в response |

**API Endpoints:**
```
POST   /outfits              - Създаване на outfit
GET    /outfits              - Списък (с филтри)
GET    /outfits/:id          - Детайли с garments
PATCH  /outfits/:id          - Update outfit
DELETE /outfits/:id          - Изтриване
POST   /outfits/:id/wear     - Маркиране като "носено"
```

---

#### Етап 3.2: UI за outfits
**Времетраене:** 3-4 дни

| # | Задача | Описание |
|---|--------|----------|
| 3.2.1 | Outfits page | Списък със запазени outfits |
| 3.2.2 | Outfit card | Визуализация на outfit |
| 3.2.3 | Create outfit flow | Multi-select на дрехи |
| 3.2.4 | Outfit detail view | Детайлен изглед |
| 3.2.5 | Edit outfit | Редакция на съществуващ outfit |

**Компоненти:**
```
components/outfits/
├── OutfitsPage.tsx
├── OutfitGrid.tsx
├── OutfitCard.tsx
├── CreateOutfitModal.tsx
├── GarmentSelector.tsx      # Multi-select за дрехи
├── OutfitPreview.tsx        # Preview на избраните дрехи
└── OutfitDetailView.tsx
```

---

### ФАЗА 4: AI СТИЛИСТ

#### Етап 4.1: n8n Workflow за AI suggestions
**Времетраене:** 3-4 дни

| # | Задача | Описание |
|---|--------|----------|
| 4.1.1 | AI Outfit Suggestion workflow | Основен workflow |
| 4.1.2 | Prompt engineering | Оптимизация на prompts |
| 4.1.3 | Response parsing | JSON структуриран изход |
| 4.1.4 | Validation | Проверка че garment_ids съществуват |
| 4.1.5 | Weather integration | Включване на данни за времето |

**Workflow: AI Outfit Suggestion**
```
[Webhook Trigger]
  - Input: user_profile, garments[], occasion, date
       │
       ▼
[Sub-workflow: Get Weather]
  - Ако не е подадено weather_data
       │
       ▼
[Function: Build Prompt]
  - Систематичен prompt с:
    - User profile info
    - Available garments (id, category, color, style)
    - Occasion, weather, season
    - Instructions за JSON output
       │
       ▼
[OpenAI Node]
  - Model: gpt-4o
  - Temperature: 0.7
  - JSON mode: enabled
       │
       ▼
[Function: Parse & Validate]
  - Parse JSON response
  - Validate garment IDs exist
  - Format output
       │
       ▼
[Respond to Webhook]
  - Return outfit suggestions
```

**Примерен Prompt:**
```
You are a professional fashion stylist. Based on the user's wardrobe, 
suggest 3 outfit combinations.

USER PROFILE:
- Gender: {gender}
- Age: {age}
- Style preferences: {stylePreferences}

AVAILABLE GARMENTS:
{garmentsList}

CONTEXT:
- Occasion: {occasion}
- Weather: {weather}
- Season: {season}

INSTRUCTIONS:
1. Use ONLY garments from the provided list
2. Each outfit should be complete and stylish
3. Consider weather appropriateness
4. Match colors and styles

Return JSON in this format:
{
  "suggestions": [
    {
      "garmentIds": ["id1", "id2", "id3"],
      "explanation": "Why this outfit works...",
      "occasion_fit": "perfect/good/acceptable"
    }
  ]
}
```

---

#### Етап 4.2: Интеграция с Weather API
**Времетраене:** 1-2 дни

| # | Задача | Описание |
|---|--------|----------|
| 4.2.1 | Weather workflow | n8n sub-workflow |
| 4.2.2 | Weather module (BE) | Optional endpoint за frontend |
| 4.2.3 | Location handling | Използване на user location |
| 4.2.4 | Weather caching | Cache за текущия ден |

**Workflow: Get Weather**
```
[Callable/Webhook]
  - Input: location, date
       │
       ▼
[OpenWeatherMap Node]
  - API call за forecast
       │
       ▼
[Function: Format Response]
  - Extract: temp, description, rain, wind
       │
       ▼
[Return]
  - { temperature, description, precipitation, wind }
```

---

#### Етап 4.3: AI чат интерфейс
**Времетраене:** 3-4 дни

| # | Задача | Описание |
|---|--------|----------|
| 4.3.1 | AI module (BE) | Endpoints за AI chat |
| 4.3.2 | Chat sessions (BE) | Съхранение на chat history |
| 4.3.3 | AI Stylist page (FE) | Chat UI |
| 4.3.4 | Message components | User/AI message bubbles |
| 4.3.5 | Outfit suggestions display | Визуализация на предложенията |
| 4.3.6 | Quick actions | Бутони за чести заявки |
| 4.3.7 | Weather display | Показване на текущото време |

**API Endpoints:**
```
POST   /ai/chat              - Нов chat session
POST   /ai/chat/:id/message  - Изпращане на съобщение
GET    /ai/chat/:id          - История на chat
POST   /ai/suggest-outfit    - Директно искане за outfit
GET    /ai/weather           - Текущо време за потребителя
```

**Компоненти:**
```
components/ai/
├── AiStylistPage.tsx
├── ChatContainer.tsx
├── ChatMessage.tsx
├── ChatInput.tsx
├── OutfitSuggestionCard.tsx
├── WeatherWidget.tsx
├── QuickActionButtons.tsx
└── SaveOutfitButton.tsx
```

---

#### Етап 4.4: Запазване на AI предложения
**Времетраене:** 1-2 дни

| # | Задача | Описание |
|---|--------|----------|
| 4.4.1 | Save suggestion flow | Запазване като outfit |
| 4.4.2 | Edit before save | Възможност за промяна |
| 4.4.3 | Confirmation | UI feedback |

---

### ФАЗА 5: ПОЛИРАНЕ

#### Етап 5.1: UX подобрения и тестване
**Времетраене:** 3-4 дни

| # | Задача | Описание |
|---|--------|----------|
| 5.1.1 | Error handling | Глобален error handling |
| 5.1.2 | Loading states | Consistent loading UX |
| 5.1.3 | Form validation | Client-side validation |
| 5.1.4 | Responsive design | Mobile-first проверка |
| 5.1.5 | Accessibility | Basic a11y audit |
| 5.1.6 | E2E tests | Playwright/Cypress тестове |

---

#### Етап 5.2: Интернационализация (i18n)
**Времетраене:** 2-3 дни

| # | Задача | Описание |
|---|--------|----------|
| 5.2.1 | i18n setup | next-intl конфигурация |
| 5.2.2 | BG translations | Български текстове |
| 5.2.3 | EN translations | Английски текстове |
| 5.2.4 | Language switcher | UI за смяна на език |
| 5.2.5 | Date/number formats | Локализация на формати |

---

#### Етап 5.3: Документация и deployment
**Времетраене:** 2-3 дни

| # | Задача | Описание |
|---|--------|----------|
| 5.3.1 | API documentation | OpenAPI/Swagger |
| 5.3.2 | README files | Setup instructions |
| 5.3.3 | Environment docs | Required env vars |
| 5.3.4 | Deployment setup | CI/CD pipelines |
| 5.3.5 | Production deploy | Initial deployment |

---

## 6. n8n Workflows - Детайлна спецификация

### 6.1. Classify Garment

```json
{
  "name": "Classify Garment",
  "trigger": "Webhook",
  "input": {
    "garmentId": "string",
    "imageUrl": "string",
    "userId": "string"
  },
  "steps": [
    {
      "name": "Call Vision API",
      "type": "HTTP Request",
      "config": {
        "method": "POST",
        "url": "https://api.openai.com/v1/chat/completions",
        "body": {
          "model": "gpt-4o",
          "messages": [
            {
              "role": "user",
              "content": [
                {
                  "type": "text",
                  "text": "Analyze this clothing item and return JSON with: category (tshirt/shirt/pants/etc), primaryColor, secondaryColors[], style (casual/business/etc), season (spring/summer/fall/winter/all_year)"
                },
                {
                  "type": "image_url",
                  "image_url": { "url": "{{imageUrl}}" }
                }
              ]
            }
          ],
          "response_format": { "type": "json_object" }
        }
      }
    },
    {
      "name": "Parse Response",
      "type": "Function",
      "code": "// Map AI response to internal categories"
    },
    {
      "name": "Callback to Backend",
      "type": "HTTP Request",
      "config": {
        "method": "POST",
        "url": "{{backendUrl}}/n8n/garment-classified",
        "body": "{{parsedData}}"
      }
    }
  ],
  "output": {
    "success": "boolean",
    "garmentId": "string",
    "classification": {
      "category": "string",
      "colors": "string[]",
      "style": "string",
      "season": "string"
    }
  }
}
```

### 6.2. AI Outfit Suggestion

```json
{
  "name": "AI Outfit Suggestion",
  "trigger": "Webhook",
  "input": {
    "userId": "string",
    "userProfile": "object",
    "garments": "array",
    "occasion": "string",
    "weatherData": "object (optional)"
  },
  "steps": [
    {
      "name": "Check Weather Data",
      "type": "IF",
      "condition": "weatherData is null"
    },
    {
      "name": "Get Weather (sub-workflow)",
      "type": "Execute Workflow",
      "condition": "if weatherData is null"
    },
    {
      "name": "Build LLM Prompt",
      "type": "Function"
    },
    {
      "name": "Call OpenAI",
      "type": "OpenAI Node"
    },
    {
      "name": "Validate & Parse Response",
      "type": "Function"
    }
  ],
  "output": {
    "suggestions": [
      {
        "garmentIds": ["id1", "id2"],
        "explanation": "string",
        "occasionFit": "perfect|good|acceptable"
      }
    ],
    "weatherInfo": "object"
  }
}
```

### 6.3. Get Weather

```json
{
  "name": "Get Weather For User",
  "trigger": "Execute Workflow Trigger / Webhook",
  "input": {
    "location": "string (city, country)",
    "date": "string (ISO date)"
  },
  "steps": [
    {
      "name": "OpenWeatherMap API",
      "type": "HTTP Request",
      "config": {
        "url": "https://api.openweathermap.org/data/2.5/weather",
        "params": {
          "q": "{{location}}",
          "appid": "{{API_KEY}}",
          "units": "metric"
        }
      }
    },
    {
      "name": "Format Response",
      "type": "Function"
    }
  ],
  "output": {
    "temperature": "number",
    "feelsLike": "number",
    "description": "string",
    "precipitation": "boolean",
    "windSpeed": "number",
    "humidity": "number"
  }
}
```

---

## 7. API Endpoints - Пълен списък

### Authentication
| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/auth/register` | Регистрация |
| POST | `/auth/login` | Вход |
| POST | `/auth/logout` | Изход |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/forgot-password` | Забравена парола |
| POST | `/auth/reset-password` | Reset парола |

### Users
| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/users/me` | Текущ потребител |
| PATCH | `/users/me` | Update профил |
| POST | `/users/me/avatar` | Upload аватар |
| DELETE | `/users/me` | Изтриване на акаунт |

### Garments
| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/garments` | Създаване + upload |
| GET | `/garments` | Списък с филтри |
| GET | `/garments/:id` | Детайли |
| PATCH | `/garments/:id` | Update |
| DELETE | `/garments/:id` | Soft delete |
| POST | `/garments/:id/reclassify` | Ре-класификация |

### Outfits
| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/outfits` | Създаване |
| GET | `/outfits` | Списък |
| GET | `/outfits/:id` | Детайли |
| PATCH | `/outfits/:id` | Update |
| DELETE | `/outfits/:id` | Изтриване |
| POST | `/outfits/:id/wear` | Маркиране като носено |

### AI
| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/ai/chat` | Нов chat session |
| GET | `/ai/chat/:id` | Chat история |
| POST | `/ai/chat/:id/message` | Съобщение |
| POST | `/ai/suggest-outfit` | Outfit suggestion |
| GET | `/ai/weather` | Текущо време |

### n8n Webhooks (internal)
| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/n8n/garment-classified` | Callback за класификация |

---

## 8. База данни - ER диаграма

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │       │  garments   │       │   outfits   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │    ┌──│ id (PK)     │
│ email       │  │    │ user_id(FK) │◄───┤  │ user_id(FK) │◄──┐
│ password    │  │    │ name        │    │  │ name        │   │
│ name        │  │    │ category    │    │  │ occasion    │   │
│ age         │  │    │ subcategory │    │  │ season      │   │
│ gender      │  │    │ colors      │    │  │ notes       │   │
│ height      │  │    │ season      │    │  │ created_at  │   │
│ weight      │  └───►│ style       │    │  │ updated_at  │   │
│ sizes...    │       │ size        │    │  └─────────────┘   │
│ style_pref  │       │ image_url   │    │         │          │
│ location    │       │ status      │    │         │          │
│ profile_img │       │ created_at  │    │         ▼          │
│ created_at  │       │ updated_at  │    │  ┌─────────────┐   │
│ updated_at  │       └─────────────┘    │  │outfit_items │   │
└─────────────┘              │           │  ├─────────────┤   │
       │                     │           │  │ id (PK)     │   │
       │                     │           │  │ outfit_id   │───┘
       │                     │           │  │ garment_id  │───┐
       │                     │           │  └─────────────┘   │
       │                     │           │                    │
       │                     └───────────┴────────────────────┘
       │
       │         ┌─────────────────┐      ┌─────────────┐
       │         │  wear_history   │      │ai_chat_sess │
       │         ├─────────────────┤      ├─────────────┤
       │         │ id (PK)         │      │ id (PK)     │
       └────────►│ user_id (FK)    │◄─────│ user_id(FK) │◄───┐
                 │ garment_id (FK) │      │ type        │    │
                 │ outfit_id (FK)  │      │ created_at  │    │
                 │ worn_at         │      └─────────────┘    │
                 └─────────────────┘             │           │
                                                 ▼           │
                                          ┌─────────────┐    │
                                          │ ai_messages │    │
                                          ├─────────────┤    │
                                          │ id (PK)     │    │
                                          │ session_id  │────┘
                                          │ sender      │
                                          │ content     │
                                          │ created_at  │
                                          └─────────────┘
```

---

## 9. Чеклисти за всеки етап

### ✅ Етап 1.1: Инфраструктура
- [ ] GitHub repositories създадени
- [ ] Next.js проект инициализиран
- [ ] NestJS проект инициализиран
- [ ] Docker compose работи локално
- [ ] n8n инстанция достъпна
- [ ] Environment variables документирани
- [ ] README с setup инструкции

### ✅ Етап 1.2: База данни
- [ ] Prisma schema дефинирана
- [ ] Initial migration успешна
- [ ] Seed script работи
- [ ] Индекси добавени

### ✅ Етап 1.3: Автентикация
- [ ] Register endpoint работи
- [ ] Login endpoint работи
- [ ] JWT tokens генерират се
- [ ] Protected routes работят (BE)
- [ ] Register форма (FE)
- [ ] Login форма (FE)
- [ ] Auth state management (FE)
- [ ] Protected routes (FE)
- [ ] Profile page (FE)
- [ ] Password reset flow

### ✅ Етап 2.1: Garments CRUD
- [ ] Storage интеграция (S3/MinIO)
- [ ] Image upload работи
- [ ] POST /garments работи
- [ ] GET /garments с филтри
- [ ] GET /garments/:id
- [ ] PATCH /garments/:id
- [ ] DELETE /garments/:id
- [ ] n8n webhook endpoint

### ✅ Етап 2.2: Classify Garment Workflow
- [ ] Workflow създаден в n8n
- [ ] Vision API интеграция
- [ ] Category mapping работи
- [ ] Callback към backend работи
- [ ] Error handling

### ✅ Етап 2.3: Wardrobe UI
- [ ] Wardrobe page layout
- [ ] Garment cards
- [ ] Grid view responsive
- [ ] Filters работят
- [ ] Search работи
- [ ] Add garment modal
- [ ] Edit garment modal
- [ ] Camera capture
- [ ] Loading/empty states

### ✅ Етап 3.1: Outfits CRUD
- [ ] POST /outfits работи
- [ ] GET /outfits с филтри
- [ ] GET /outfits/:id с garments
- [ ] PATCH /outfits/:id
- [ ] DELETE /outfits/:id

### ✅ Етап 3.2: Outfits UI
- [ ] Outfits page
- [ ] Outfit cards
- [ ] Create outfit flow
- [ ] Garment multi-select
- [ ] Outfit detail view
- [ ] Edit outfit

### ✅ Етап 4.1: AI Suggestion Workflow
- [ ] Workflow създаден
- [ ] LLM integration
- [ ] Prompt оптимизиран
- [ ] JSON response parsing
- [ ] Validation на garment IDs

### ✅ Етап 4.2: Weather Integration
- [ ] Weather sub-workflow
- [ ] OpenWeatherMap integration
- [ ] Location from user profile
- [ ] Integration в AI workflow

### ✅ Етап 4.3: AI Chat UI
- [ ] Chat session endpoints
- [ ] Message storage
- [ ] Chat page UI
- [ ] Message components
- [ ] Outfit suggestions display
- [ ] Weather widget
- [ ] Quick actions

### ✅ Етап 4.4: Save AI Suggestions
- [ ] Save to outfit flow
- [ ] Edit before save option

### ✅ Етап 5.1: UX & Testing
- [ ] Global error handling
- [ ] Consistent loading states
- [ ] Form validation
- [ ] Responsive design check
- [ ] Basic a11y
- [ ] E2E tests

### ✅ Етап 5.2: i18n
- [ ] next-intl setup
- [ ] BG translations
- [ ] EN translations
- [ ] Language switcher
- [ ] Date/number formats

### ✅ Етап 5.3: Deployment
- [ ] API documentation
- [ ] README files complete
- [ ] CI/CD setup
- [ ] Production deployment

---

## 📌 Бележки за екипа

### Приоритети при разработка
1. **Сигурност** - Всички операции трябва да са свързани с конкретен user_id
2. **Производителност** - Stateless backend, pagination навсякъде
3. **UX** - Loading states, error handling, mobile-first

### Конвенции за код
- TypeScript навсякъде (strict mode)
- ESLint + Prettier
- Conventional commits
- PR reviews задължителни

### Архитектурни решения
- n8n за AI логика - позволява лесна промяна на prompts без deploy
- Prisma за type-safe database достъп
- JWT за stateless auth
- S3-compatible storage за vendor flexibility

---

*Документ създаден: Декември 2024*
*Версия: 1.0*
