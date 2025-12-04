# n8n AI Stylist Workflows

Тази папка съдържа n8n workflow-и за AI стилист функционалността.

## Налични Workflow-и

### 1. `ai-stylist-openai.json` (Препоръчителен)
Използва OpenAI GPT-4 за генериране на стилистични препоръки.

**Изисквания:**
- OpenAI API ключ
- Цена: ~$0.01-0.03 на заявка

### 2. `ai-stylist-ollama.json` (Безплатен, локален)
Използва локален Ollama сървър за AI отговори.

**Изисквания:**
- Инсталиран Ollama (https://ollama.ai)
- Локален модел като `llama2` или `mistral`
- Безплатен, но изисква силен компютър

## Инструкции за Import

### Стъпка 1: Отворете n8n
Отворете http://localhost:5678 в браузъра.

### Стъпка 2: Импортирайте workflow
1. Кликнете на **+ Create Workflow** или отидете в менюто
2. Изберете **Import from File**
3. Качете `ai-stylist-openai.json` или `ai-stylist-ollama.json`

### Стъпка 3: Конфигурирайте credentials

#### За OpenAI вариант:
1. Отворете **OpenAI** node-а
2. Кликнете на **Credentials** → **Create New**
3. Въведете вашия OpenAI API ключ
4. Запазете

#### За Ollama вариант:
1. Уверете се, че Ollama работи: `ollama serve`
2. Изтеглете модел: `ollama pull llama2` или `ollama pull mistral`
3. Ollama по подразбиране работи на http://localhost:11434

### Стъпка 4: Активирайте workflow-а
1. Кликнете на **Active** toggle (горе вдясно)
2. Workflow-ът ще започне да приема заявки

## Webhook URL

След активация, вашият webhook URL ще бъде:
```
http://localhost:5678/webhook/ai-stylist
```

За production:
```
https://your-n8n-domain.com/webhook/ai-stylist
```

## Тестване

Можете да тествате webhook-а с curl:

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
