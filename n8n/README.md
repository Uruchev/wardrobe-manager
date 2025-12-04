# n8n Wardrobe Manager Workflows

Тази папка съдържа n8n workflow-и за Wardrobe Manager - AI Личен Стилист.

## 🎯 Препоръчителен Workflow

### `wardrobe-ai-agent-workflow.json`
**Пълен AI Stylist Agent workflow** с всички endpoints:

#### Endpoints:
| Метод | Path | Описание |
|-------|------|----------|
| POST | `/webhook/auth/register` | Регистрация на потребител |
| POST | `/webhook/auth/login` | Логин |
| GET | `/webhook/auth/me` | Текущ потребител |
| GET | `/webhook/garments` | Списък дрехи |
| POST | `/webhook/garments` | Създаване на дреха |
| POST | `/webhook/ai/chat` | **AI Стилист чат** (с Agent) |
| POST | `/webhook/ai/suggest-outfit` | Предложения за тоалет |

#### Характеристики:
- ✅ Използва **AI Agent node** за интелигентни отговори
- ✅ Системен prompt на български език
- ✅ Контекст с гардероба на потребителя
- ✅ Съобразяване с времето
- ✅ CORS headers за frontend
- ✅ `responseMode: responseNode` - критично важно!

---

## 📦 Инструкции за инсталация

### Стъпка 1: Импортирай workflow в n8n
1. Отвори n8n (https://n8n.simeontsvetanovn8nworkflows.site или локално)
2. Кликни "Add workflow" → "Import from file"
3. Избери `wardrobe-ai-agent-workflow.json`

### Стъпка 2: Конфигурирай OpenAI credential
1. Отиди в Settings → Credentials
2. Създай нов "OpenAI API" credential
3. Въведи твоя OpenAI API key
4. Редактирай **"OpenAI Chat Model"** node и избери credential-а

### Стъпка 3: Активирай workflow
1. Кликни бутона **"Active"** в горния десен ъгъл
2. Workflow-ът трябва да е **ЗЕЛЕН/ACTIVE**

### Стъпка 4: Провери endpoints

```bash
curl -X POST http://localhost:5678/webhook/ai-stylist \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Какво да облека за бизнес среща?",
    "userId": "test123",
    "wardrobe": {
      "items": [
        {"name": "Бяла риза", "category": "shirt"},
        {"name": "Черни панталони", "category": "pants"}
      ],
      "totalCount": 2
    },
    "context": {
      "weather": {"temp": 22, "description": "Слънчево"},
      "language": "bg"
    }
  }'
```

## Self-Hosted Production Setup

### С Docker:
```yaml
# docker-compose.yml (добавете към съществуващия)
n8n:
  image: n8nio/n8n
  ports:
    - "5678:5678"
  environment:
    - N8N_HOST=your-domain.com
    - N8N_PROTOCOL=https
    - WEBHOOK_URL=https://your-domain.com
    - N8N_ENCRYPTION_KEY=your-secret-key
  volumes:
    - n8n_data:/home/node/.n8n
```

### Обновете backend .env:
```env
N8N_WEBHOOK_URL=https://your-domain.com/webhook/ai-stylist
```

## Структура на Workflow-а

```
[Webhook Trigger]
       ↓
[Build AI Prompt] - Формира промпт с контекст
       ↓
[AI Response] - OpenAI или Ollama
       ↓
[Respond to Webhook] - Връща отговор
```

## Разширения (По избор)

Можете да добавите допълнителни node-и за:

1. **Weather API** - Автоматично вземане на времето
2. **Image Analysis** - AI анализ на качени снимки
3. **Database** - Запазване на чат история
4. **Notifications** - Email/Push нотификации

## Проблеми и решения

### n8n не отговаря
- Проверете дали контейнерът работи: `docker ps`
- Рестартирайте: `docker-compose restart n8n`

### OpenAI грешки
- Проверете API ключа
- Проверете лимитите на акаунта ви

### Ollama бавен
- Използвайте по-малък модел (`llama2:7b` вместо `llama2:13b`)
- Увеличете RAM паметта

## Контакт

За въпроси относно setup-а, проверете n8n документацията:
https://docs.n8n.io/
