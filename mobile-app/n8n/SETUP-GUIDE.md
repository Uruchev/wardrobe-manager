# Fashion Advisor Ultimate - n8n AI Agent Setup Guide

## 🎯 Overview

This is a comprehensive AI personal stylist agent for the Fashion Advisor mobile app. It uses:
- **OpenAI GPT-4o-mini** for intelligent responses
- **Native Supabase Tools** for direct database access
- **OpenWeatherMap** for weather-aware outfit suggestions
- **SerpAPI** for current fashion trends research
- **Conversation Memory** for context across messages

## 📦 Required Credentials

Before importing the workflow, you need to configure these credentials in n8n:

### 1. OpenAI API
- **Name**: `OpenAI API`
- **API Key**: Your OpenAI API key from https://platform.openai.com/api-keys

### 2. Supabase API
- **Name**: `Supabase Fashion Advisor`
- **Host URL**: `https://yusvrqkmybxntqnsxhcy.supabase.co`
- **Service Role Key**: Your Supabase service role key (from Project Settings > API)

> ⚠️ **Important**: Use the **Service Role Key**, not the anon key, for full database access.

### 3. OpenWeatherMap API
- **Name**: `OpenWeatherMap`
- **API Key**: Get free key from https://openweathermap.org/api

### 4. SerpAPI (Optional - for fashion trends)
- **Name**: `SerpApi`
- **API Key**: Get from https://serpapi.com/

## 🚀 Installation Steps

### Step 1: Import the Workflow

1. Open your n8n instance: `https://n8n.simeontsvetanovn8nworkflows.site`
2. Go to **Workflows** → **Import from File**
3. Select `fashion-advisor-ultimate.json`

### Step 2: Configure Credentials

After importing, you'll see red warning badges on nodes that need credentials:

1. **OpenAI GPT-4o-mini node**:
   - Click the node
   - Under Credentials, click "Create New"
   - Name: `OpenAI API`
   - Enter your API key
   - Save

2. **All Supabase Tool nodes** (Get Wardrobe, Get Outfits, etc.):
   - Click each node
   - Create credential: `Supabase Fashion Advisor`
   - Host: `https://yusvrqkmybxntqnsxhcy.supabase.co`
   - Service Role Key: (from Supabase dashboard)
   - Save

3. **Weather nodes** (Current Weather, Weather Forecast):
   - Create credential: `OpenWeatherMap`
   - Enter your API key

4. **Fashion Trends Search** (Optional):
   - Create credential: `SerpApi`
   - Enter your API key

### Step 3: Activate the Workflow

1. Toggle the **Active** switch in the top-right
2. The webhook URL will be shown: 
   ```
   https://n8n.simeontsvetanovn8nworkflows.site/webhook/fashion-advisor
   ```

### Step 4: Update Mobile App

Make sure your mobile app's `aiService.ts` uses the correct webhook URL:

```typescript
// In src/services/aiService.ts
const N8N_WEBHOOK_URL = 'https://n8n.simeontsvetanovn8nworkflows.site/webhook/fashion-advisor';
```

## 🔧 Workflow Architecture

```
┌──────────────────┐
│  Webhook Trigger │
│  (POST request)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Parse Request   │
│  (Extract data)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│                   AI AGENT                                │
│  ┌─────────────────┐                                     │
│  │ OpenAI GPT-4o   │◄──── Language Model                 │
│  └─────────────────┘                                     │
│                                                          │
│  ┌─────────────────┐                                     │
│  │ Memory Buffer   │◄──── Conversation Context           │
│  └─────────────────┘                                     │
│                                                          │
│  TOOLS:                                                  │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │ Get Wardrobe    │  │ Get Outfits     │ ◄── Supabase  │
│  └─────────────────┘  └─────────────────┘               │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │ Get Profile     │  │ Save Outfit     │ ◄── Supabase  │
│  └─────────────────┘  └─────────────────┘               │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │ Current Weather │  │ 5-Day Forecast  │ ◄── Weather   │
│  └─────────────────┘  └─────────────────┘               │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │ Trends Search   │  │ Chat History    │ ◄── Search    │
│  └─────────────────┘  └─────────────────┘               │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Send Response  │
                    │  (JSON output)  │
                    └─────────────────┘
```

## 💬 Request Format

The mobile app sends requests in this format:

```json
{
  "message": "Какво да облека за работа днес?",
  "userId": "user-123",
  "messageType": "chat",
  "location": "Sofia, Bulgaria",
  "occasion": "work",
  "sessionId": "session-abc"
}
```

## 📤 Response Format

The agent responds with:

```json
{
  "success": true,
  "message": "🌟 АУТФИТ: Елегантен офис стил\n\n👕 Горна част: Бяла памучна риза\n👖 Долна част: Черни панталони класически\n👞 Обувки: Кожени обувки черни\n\n✨ Защо работи: Класическа комбинация за офиса...",
  "userId": "user-123",
  "intent": "outfit_suggestion",
  "timestamp": "2024-01-15T09:30:00.000Z"
}
```

## 🎨 Agent Capabilities

The AI agent can:

1. **Suggest Outfits** - Based on actual wardrobe items
2. **Check Weather** - Ensure suggestions fit the weather
3. **Search Trends** - Find current fashion trends
4. **Save Outfits** - Remember liked combinations
5. **Analyze Wardrobe** - Find gaps and suggest purchases
6. **Maintain Context** - Remember conversation history

## 🔍 Intent Detection

The agent automatically detects user intent:

| Intent | Trigger Keywords |
|--------|------------------|
| `outfit_suggestion` | аутфит, outfit, комбинация, какво да облека |
| `weather_based` | време, weather, студено, топло |
| `fashion_trends` | тренд, trend, мода, модерно |
| `shopping_advice` | купя, buy, препоръчай, липсва |
| `wardrobe_analysis` | анализ, статистика |
| `general_chat` | (default) |

## 🐛 Troubleshooting

### Error: "Invalid credentials"
- Check that all credentials are properly configured
- Verify API keys are valid and not expired
- For Supabase, ensure you're using the Service Role key

### Error: "No wardrobe items found"
- This is normal for new users
- The agent will encourage users to add clothes

### Error: "Weather data unavailable"
- Check OpenWeatherMap API key
- Verify the location format is correct

### Slow responses
- Consider upgrading to GPT-4 for faster responses
- Check n8n server resources

## 📊 Testing

Test the webhook with curl:

```bash
curl -X POST https://n8n.simeontsvetanovn8nworkflows.site/webhook/fashion-advisor \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Какво да облека днес?",
    "userId": "demo-user",
    "location": "Sofia, Bulgaria"
  }'
```

## 🔄 Updates

To update the workflow:
1. Export current workflow as backup
2. Import new version
3. Re-apply credentials if needed
4. Test before activating
