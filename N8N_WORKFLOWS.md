# Wardrobe Manager - n8n Workflows Спецификация

## Общ преглед

Този документ описва n8n workflows, които ще бъдат използвани в Wardrobe Manager.
n8n служи като оркестратор за AI логика, интеграции с външни услуги и сложни бизнес процеси.

---

## 1. Classify Garment Workflow

### Описание
Автоматична класификация на дреха при качване на снимка.

### Trigger
- **Тип:** Webhook
- **Метод:** POST
- **URL:** `/webhook/classify-garment`

### Input
```json
{
  "garmentId": "clxyz123",
  "imageUrl": "https://storage.example.com/garments/image.jpg",
  "userId": "user_abc123"
}
```

### Workflow Steps

```
┌──────────────────┐
│  Webhook Trigger │
│  (POST request)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Validate Input  │
│  (IF node)       │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│  Call OpenAI Vision API  │
│  (HTTP Request)          │
│  - model: gpt-4o         │
│  - image + prompt        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Parse AI Response       │
│  (Code node)             │
│  - Extract JSON          │
│  - Map to internal enums │
│  - Validate categories   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Callback to Backend     │
│  (HTTP Request)          │
│  POST /n8n/garment-      │
│  classified              │
└──────────────────────────┘
```

### Code Node: Parse AI Response
```javascript
// Parse and validate the AI response
const aiResponse = $input.first().json;
const content = JSON.parse(aiResponse.choices[0].message.content);

// Valid categories mapping
const validCategories = [
  'tshirt', 'shirt', 'blouse', 'polo', 'tank_top', 'sweater', 
  'cardigan', 'hoodie', 'sweatshirt', 'jacket', 'blazer', 'coat',
  'vest', 'parka', 'windbreaker', 'pants', 'jeans', 'shorts',
  'skirt', 'leggings', 'joggers', 'dress', 'jumpsuit', 'romper',
  'suit', 'sneakers', 'boots', 'heels', 'flats', 'sandals',
  'loafers', 'formal_shoes', 'bag', 'belt', 'scarf', 'hat',
  'watch', 'jewelry', 'sunglasses', 'tie', 'gloves'
];

const validColors = [
  'black', 'white', 'gray', 'navy', 'blue', 'light_blue', 'red',
  'burgundy', 'pink', 'orange', 'yellow', 'green', 'olive', 'teal',
  'purple', 'brown', 'beige', 'cream', 'gold', 'silver', 'multicolor', 'pattern'
];

const validStyles = [
  'casual', 'business', 'business_casual', 'formal', 'sport',
  'athletic', 'streetwear', 'bohemian', 'vintage', 'minimalist',
  'preppy', 'romantic', 'edgy'
];

const validSeasons = ['spring', 'summer', 'fall', 'winter', 'all_year'];

// Validate and map
const category = validCategories.includes(content.category) 
  ? content.category 
  : 'tshirt'; // fallback

const colors = (content.colors || [])
  .filter(c => validColors.includes(c))
  .slice(0, 5); // max 5 colors

const style = validStyles.includes(content.style) 
  ? content.style 
  : null;

const season = validSeasons.includes(content.season) 
  ? content.season 
  : 'all_year';

return {
  garmentId: $input.first().json.garmentId,
  classification: {
    category,
    subcategory: content.subcategory || null,
    colors: colors.length > 0 ? colors : ['multicolor'],
    style,
    season,
    confidence: 0.85 // можем да добавим логика за confidence
  }
};
```

### Output
```json
{
  "garmentId": "clxyz123",
  "classification": {
    "category": "tshirt",
    "subcategory": "graphic t-shirt",
    "colors": ["black", "white"],
    "style": "casual",
    "season": "all_year",
    "confidence": 0.85
  }
}
```

### Error Handling
- Ако Vision API не върне валиден JSON → retry 1 път
- Ако retry fail → изпращане на error callback с default стойности
- Логване на грешката за анализ

---

## 2. AI Outfit Suggestion Workflow

### Описание
Генериране на AI базирани предложения за outfits въз основа на гардероба на потребителя.

### Trigger
- **Тип:** Webhook
- **Метод:** POST
- **URL:** `/webhook/suggest-outfit`

### Input
```json
{
  "userId": "user_abc123",
  "userProfile": {
    "gender": "female",
    "age": 28,
    "stylePreferences": ["casual", "minimalist"]
  },
  "garments": [
    {
      "id": "garment_1",
      "category": "tshirt",
      "colors": ["white"],
      "style": "casual",
      "season": "all_year"
    },
    {
      "id": "garment_2",
      "category": "jeans",
      "colors": ["blue"],
      "style": "casual",
      "season": "all_year"
    }
  ],
  "occasion": "casual_outing",
  "date": "2024-12-04",
  "location": "Sofia, Bulgaria",
  "count": 3
}
```

### Workflow Steps

```
┌──────────────────┐
│  Webhook Trigger │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│  Check if weather needed │
│  (IF node)               │
└────────┬─────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌─────────────────┐
│ Skip    │ │ Execute         │
│ Weather │ │ Get Weather     │
│         │ │ Sub-workflow    │
└────┬────┘ └────────┬────────┘
     │               │
     └───────┬───────┘
             │
             ▼
┌──────────────────────────┐
│  Build LLM Prompt        │
│  (Code node)             │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Call OpenAI API         │
│  (HTTP Request)          │
│  - model: gpt-4o         │
│  - response_format: json │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Parse & Validate        │
│  (Code node)             │
│  - Validate garment IDs  │
│  - Format response       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Respond to Webhook      │
└──────────────────────────┘
```

### Code Node: Build LLM Prompt
```javascript
const input = $input.first().json;
const { userProfile, garments, occasion, weatherData, count } = input;

// Occasion translations for context
const occasionDescriptions = {
  'everyday': 'everyday casual activities',
  'work': 'office/workplace',
  'meeting': 'business meeting',
  'date': 'romantic date',
  'party': 'party or celebration',
  'wedding': 'wedding event',
  'formal_event': 'formal/black-tie event',
  'interview': 'job interview',
  'sport': 'sports or gym',
  'outdoor': 'outdoor activities',
  'beach': 'beach or pool',
  'travel': 'traveling',
  'casual_outing': 'casual outing with friends',
  'dinner': 'dinner at a restaurant',
  'brunch': 'brunch'
};

// Build garments list for prompt
const garmentsList = garments.map(g => 
  `- ID: ${g.id}, Type: ${g.category}, Colors: ${g.colors.join(', ')}, Style: ${g.style || 'not specified'}, Season: ${g.season}`
).join('\n');

// Weather context
let weatherContext = '';
if (weatherData) {
  weatherContext = `
Current Weather:
- Temperature: ${weatherData.temperature}°C (feels like ${weatherData.feelsLike}°C)
- Conditions: ${weatherData.description}
- Precipitation: ${weatherData.precipitation ? 'Yes, expect rain' : 'No'}
- Wind: ${weatherData.windSpeed} km/h`;
}

const prompt = `You are a professional fashion stylist. Create ${count} outfit suggestions for a ${userProfile.age}-year-old ${userProfile.gender}.

User's style preferences: ${userProfile.stylePreferences.join(', ')}

AVAILABLE WARDROBE:
${garmentsList}

OCCASION: ${occasionDescriptions[occasion] || occasion}
${weatherContext}

RULES:
1. Use ONLY garment IDs from the list above
2. Each outfit must be complete and appropriate for the occasion
3. Consider weather if provided
4. Match colors harmoniously
5. A complete outfit typically needs: top + bottom (or dress) + shoes (if available)

Return ONLY valid JSON in this exact format:
{
  "suggestions": [
    {
      "garmentIds": ["id1", "id2", "id3"],
      "explanation": "Why this outfit works...",
      "occasionFit": "perfect"
    }
  ]
}

occasionFit values: "perfect", "good", or "acceptable"`;

return {
  prompt,
  ...input
};
```

### Code Node: Parse & Validate Response
```javascript
const input = $input.first().json;
const aiResponse = input.aiResponse;
const availableGarmentIds = input.garments.map(g => g.id);

let suggestions;
try {
  const content = JSON.parse(aiResponse.choices[0].message.content);
  suggestions = content.suggestions || [];
} catch (e) {
  // Fallback: try to extract JSON from response
  const match = aiResponse.choices[0].message.content.match(/\{[\s\S]*\}/);
  if (match) {
    suggestions = JSON.parse(match[0]).suggestions || [];
  } else {
    throw new Error('Could not parse AI response');
  }
}

// Validate each suggestion
const validatedSuggestions = suggestions
  .filter(s => s.garmentIds && s.garmentIds.length > 0)
  .map(s => ({
    garmentIds: s.garmentIds.filter(id => availableGarmentIds.includes(id)),
    explanation: s.explanation || 'Great outfit for the occasion!',
    occasionFit: ['perfect', 'good', 'acceptable'].includes(s.occasionFit) 
      ? s.occasionFit 
      : 'good'
  }))
  .filter(s => s.garmentIds.length >= 2); // Need at least 2 items for outfit

// If no valid suggestions, create a basic one
if (validatedSuggestions.length === 0 && availableGarmentIds.length >= 2) {
  validatedSuggestions.push({
    garmentIds: availableGarmentIds.slice(0, Math.min(3, availableGarmentIds.length)),
    explanation: 'A simple combination from your wardrobe.',
    occasionFit: 'acceptable'
  });
}

return {
  suggestions: validatedSuggestions,
  weatherInfo: input.weatherData || null
};
```

### Output
```json
{
  "suggestions": [
    {
      "garmentIds": ["garment_1", "garment_2", "garment_5"],
      "explanation": "This casual outfit combines a classic white t-shirt with blue jeans - perfect for a relaxed outing. The white sneakers complete the look.",
      "occasionFit": "perfect"
    },
    {
      "garmentIds": ["garment_3", "garment_2", "garment_6"],
      "explanation": "A slightly dressier option with the striped shirt tucked into the same jeans.",
      "occasionFit": "good"
    }
  ],
  "weatherInfo": {
    "temperature": 18,
    "feelsLike": 16,
    "description": "Partly cloudy",
    "precipitation": false
  }
}
```

---

## 3. Get Weather Sub-workflow

### Описание
Получаване на текуща прогноза за времето за дадена локация.

### Trigger
- **Тип:** Execute Workflow Trigger (sub-workflow)
- Може да се извика и като самостоятелен webhook

### Input
```json
{
  "location": "Sofia, Bulgaria",
  "date": "2024-12-04"
}
```

### Workflow Steps

```
┌──────────────────────────┐
│  Execute Workflow        │
│  Trigger                 │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  HTTP Request            │
│  OpenWeatherMap API      │
│  GET /weather            │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Format Response         │
│  (Code node)             │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Return                  │
└──────────────────────────┘
```

### HTTP Request Configuration
```
Method: GET
URL: https://api.openweathermap.org/data/2.5/weather
Query Parameters:
  - q: {{ $json.location }}
  - appid: {{ $credentials.openWeatherMapApiKey }}
  - units: metric
  - lang: bg (или en)
```

### Code Node: Format Response
```javascript
const weather = $input.first().json;

return {
  temperature: Math.round(weather.main.temp),
  feelsLike: Math.round(weather.main.feels_like),
  description: weather.weather[0].description,
  precipitation: weather.weather[0].main.toLowerCase().includes('rain') ||
                 weather.weather[0].main.toLowerCase().includes('snow'),
  humidity: weather.main.humidity,
  windSpeed: Math.round(weather.wind.speed * 3.6), // Convert m/s to km/h
  icon: weather.weather[0].icon,
  sunrise: new Date(weather.sys.sunrise * 1000).toISOString(),
  sunset: new Date(weather.sys.sunset * 1000).toISOString()
};
```

### Output
```json
{
  "temperature": 12,
  "feelsLike": 10,
  "description": "облачно",
  "precipitation": false,
  "humidity": 65,
  "windSpeed": 15,
  "icon": "04d",
  "sunrise": "2024-12-04T05:45:00.000Z",
  "sunset": "2024-12-04T16:30:00.000Z"
}
```

---

## 4. Generate Outfit Visualization (Post-MVP)

### Описание
Генериране на визуализация на потребителя с избрани дрехи.

### Trigger
- **Тип:** Webhook
- **Метод:** POST
- **URL:** `/webhook/generate-visualization`

### Input
```json
{
  "userId": "user_abc123",
  "userImageUrl": "https://storage.example.com/users/profile.jpg",
  "garments": [
    {
      "id": "garment_1",
      "imageUrl": "https://storage.example.com/garments/tshirt.jpg",
      "category": "tshirt",
      "colors": ["white"]
    },
    {
      "id": "garment_2",
      "imageUrl": "https://storage.example.com/garments/jeans.jpg",
      "category": "jeans",
      "colors": ["blue"]
    }
  ]
}
```

### Workflow Steps

```
┌──────────────────────────┐
│  Webhook Trigger         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Content Moderation      │
│  (OpenAI Moderation API) │
│  Check user image        │
└────────┬─────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌─────────────────┐
│ Flagged │ │ Proceed         │
│ → Error │ │                 │
└─────────┘ └────────┬────────┘
                     │
                     ▼
┌──────────────────────────┐
│  Build Generation Prompt │
│  (Code node)             │
│  Include safety rules    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Call Image Generation   │
│  API (e.g., DALL-E 3,    │
│  Midjourney, Stable      │
│  Diffusion via API)      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Upload to Storage       │
│  (S3/MinIO)              │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Return Image URL        │
└──────────────────────────┘
```

### Бележки за имплементация
- Тази функционалност е след MVP
- Изисква внимателен избор на image generation модел
- Необходима е модерация на входните и изходните изображения
- Трябва да се спазват етични правила (без голота, без бельо)

---

## 5. Credentials Configuration

### OpenAI
```yaml
Name: OpenAI
Type: OpenAI API
API Key: sk-xxx...
```

### OpenWeatherMap
```yaml
Name: OpenWeatherMap
Type: HTTP Header Auth
Header Name: (none - use query param)
# Use in HTTP Request: ?appid={{apiKey}}
```

### Backend Callback
```yaml
Name: Backend API
Type: HTTP Header Auth
Header Name: X-N8N-Webhook-Secret
Header Value: your-secret-key
```

---

## 6. Environment Variables за n8n

```env
# n8n specific
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=secure_password

# Webhook URL
WEBHOOK_URL=https://your-n8n.example.com

# Backend callback
BACKEND_URL=https://api.wardrobemanager.com
BACKEND_WEBHOOK_SECRET=your-secret-key

# External APIs
OPENAI_API_KEY=sk-xxx
OPENWEATHERMAP_API_KEY=xxx
```

---

## 7. Testing Checklist

### Classify Garment
- [ ] Тест с ясна снимка на тениска
- [ ] Тест с тъмна/нискокачествена снимка
- [ ] Тест с дреха с много цветове
- [ ] Тест с аксесоар (чанта, обувки)
- [ ] Тест с невалиден image URL
- [ ] Тест с timeout от Vision API

### AI Outfit Suggestion
- [ ] Тест с пълен гардероб (10+ дрехи)
- [ ] Тест с минимален гардероб (2-3 дрехи)
- [ ] Тест с различни поводи
- [ ] Тест с включено време
- [ ] Тест без налични данни за време
- [ ] Тест с невалидни garment IDs в отговора

### Get Weather
- [ ] Тест с валиден град
- [ ] Тест с невалиден град
- [ ] Тест с различни езици
- [ ] Тест с timeout от API

---

*Версия: 1.0*
*Последна актуализация: Декември 2024*
