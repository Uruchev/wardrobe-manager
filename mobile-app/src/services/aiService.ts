import { supabase, ClothingItem, Outfit } from '../config/supabase';
import { useWardrobeStore, useOutfitsStore, useAIStore } from '../store';

// n8n Fashion Advisor Ultimate Webhook URL
const N8N_WEBHOOK_URL = 'https://n8n.simeontsvetanovn8nworkflows.site/webhook/fashion-advisor';

// Demo mode flag - set to false for production with authentication
const DEMO_MODE = false;

interface ServiceResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    suggestions?: OutfitSuggestion[];
    items?: ClothingItem[];
    action?: string;
  };
}

export interface OutfitSuggestion {
  id: string;
  name: string;
  items: ClothingItem[];
  reasoning: string;
  occasion?: string;
  weather?: string;
  confidence: number;
}

export interface WeatherInfo {
  temperature: number;
  condition: string;
  humidity: number;
  city: string;
}

export interface AIContext {
  wardrobe: ClothingItem[];
  outfits: Outfit[];
  weather?: WeatherInfo;
  userPreferences?: any;
  recentWorn?: ClothingItem[];
}

export const aiService = {
  /**
   * Изпращане на съобщение до AI стилиста
   */
  async sendMessage(
    message: string,
    context?: Partial<AIContext>
  ): Promise<ServiceResponse<ChatMessage>> {
    try {
      // Get user ID from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Не си влязъл в профила' };
      const userId = user.id;

      // Get current wardrobe and outfits for context
      const wardrobe = useWardrobeStore.getState().items;
      const outfits = useOutfitsStore.getState().outfits;

      // Prepare context for AI
      const aiContext: AIContext = {
        wardrobe,
        outfits,
        ...context,
      };

      // Create user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date(),
      };

      // Add to store
      useAIStore.getState().addMessage(userMessage);

      // Determine occasion from message
      const lowerMessage = message.toLowerCase();
      let occasion = null;
      if (lowerMessage.includes('работа') || lowerMessage.includes('офис')) occasion = 'work';
      else if (lowerMessage.includes('среща') || lowerMessage.includes('вечеря')) occasion = 'date';
      else if (lowerMessage.includes('спорт') || lowerMessage.includes('тренировка')) occasion = 'sport';
      else if (lowerMessage.includes('парти') || lowerMessage.includes('клуб')) occasion = 'party';
      else if (lowerMessage.includes('casual') || lowerMessage.includes('ежедневие')) occasion = 'casual';

      // Call n8n Fashion Advisor Ultimate webhook
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId,
          messageType: 'chat',
          location: context?.weather?.city || 'Sofia, Bulgaria',
          occasion,
          sessionId: `session-${userId}-${Date.now()}`,
          preferences: {
            wardrobeCount: wardrobe.length,
            outfitCount: outfits.length,
          },
        }),
      });

      if (!response.ok) {
        // Fallback to local AI response if webhook fails
        const fallbackResponse = await this.generateLocalResponse(message, aiContext);
        return { success: true, data: fallbackResponse };
      }

      const data = await response.json();

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || data.response,
        timestamp: new Date(),
        metadata: {
          suggestions: data.suggestions,
          items: data.recommendedItems,
          action: data.action,
        },
      };

      // Add to store
      useAIStore.getState().addMessage(assistantMessage);

      return { success: true, data: assistantMessage };
    } catch (error: any) {
      console.error('AI Service Error:', error);
      // Generate fallback response
      const fallbackResponse = await this.generateLocalResponse(
        message,
        { wardrobe: useWardrobeStore.getState().items, outfits: useOutfitsStore.getState().outfits }
      );
      return { success: true, data: fallbackResponse };
    }
  },

  /**
   * Локален AI отговор (когато n8n е недостъпен)
   */
  async generateLocalResponse(
    message: string,
    context: AIContext
  ): Promise<ChatMessage> {
    const lowerMessage = message.toLowerCase();
    let response = '';
    let suggestions: OutfitSuggestion[] = [];
    let recommendedItems: ClothingItem[] = [];

    // Analyze intent
    if (lowerMessage.includes('какво да облека') || lowerMessage.includes('предложи') || lowerMessage.includes('outfit')) {
      response = this.generateOutfitSuggestion(context);
      suggestions = this.createOutfitSuggestions(context, 3);
    } else if (lowerMessage.includes('работа') || lowerMessage.includes('офис')) {
      response = this.generateWorkOutfitSuggestion(context);
      suggestions = this.createOutfitSuggestions(context, 2, 'work');
    } else if (lowerMessage.includes('вечеря') || lowerMessage.includes('среща') || lowerMessage.includes('date')) {
      response = this.generateDateOutfitSuggestion(context);
      suggestions = this.createOutfitSuggestions(context, 2, 'date');
    } else if (lowerMessage.includes('спорт') || lowerMessage.includes('тренировка')) {
      response = this.generateSportOutfitSuggestion(context);
      suggestions = this.createOutfitSuggestions(context, 2, 'sport');
    } else if (lowerMessage.includes('цвят') || lowerMessage.includes('комбинира')) {
      response = this.generateColorAdvice(context, lowerMessage);
    } else if (lowerMessage.includes('гардероб') || lowerMessage.includes('статистика')) {
      response = this.generateWardrobeAnalysis(context);
    } else if (lowerMessage.includes('купя') || lowerMessage.includes('липсва') || lowerMessage.includes('нямам')) {
      response = this.generateShoppingAdvice(context);
    } else if (lowerMessage.includes('здравей') || lowerMessage.includes('здрасти') || lowerMessage.includes('привет')) {
      response = this.generateGreeting();
    } else {
      response = this.generateGenericResponse(context);
    }

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      metadata: {
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        items: recommendedItems.length > 0 ? recommendedItems : undefined,
      },
    };

    useAIStore.getState().addMessage(assistantMessage);
    return assistantMessage;
  },

  /**
   * Сумиране на гардероба за контекст
   */
  summarizeWardrobe(wardrobe: ClothingItem[]): Record<string, number> {
    return wardrobe.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  },

  /**
   * Генериране на предложение за тоалет
   */
  generateOutfitSuggestion(context: AIContext): string {
    const { wardrobe } = context;
    if (wardrobe.length === 0) {
      return "👋 Виждам, че гардеробът ти все още е празен! Започни като добавиш няколко дрехи - просто снимай ги с камерата. След това ще мога да ти давам персонализирани предложения!";
    }

    const tops = wardrobe.filter(i => i.category === 'tops');
    const bottoms = wardrobe.filter(i => i.category === 'bottoms');
    const dresses = wardrobe.filter(i => i.category === 'dresses');

    if (tops.length > 0 && bottoms.length > 0) {
      const randomTop = tops[Math.floor(Math.random() * tops.length)];
      const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
      
      return `👗 Имам страхотна идея за теб!\n\nПредлагам да комбинираш:\n• ${randomTop.name} (${randomTop.color})\n• ${randomBottom.name} (${randomBottom.color})\n\nТази комбинация е перфектна за ежедневно носене. ${randomTop.color} и ${randomBottom.color} се допълват чудесно!\n\n💡 Искаш ли да ти предложа още варианти или да добавим аксесоари?`;
    }

    if (dresses.length > 0) {
      const randomDress = dresses[Math.floor(Math.random() * dresses.length)];
      return `👗 За днес ти препоръчвам:\n\n• ${randomDress.name} (${randomDress.color})\n\nЕлегантна и практична опция! Можеш да я комбинираш с обувки на ток за по-официален вид или с маратонки за по-casual look.\n\n💡 Искаш ли да добавим аксесоари?`;
    }

    return "🤔 Виждам, че имаш няколко дрехи, но за пълноценни предложения ще ми трябват още артикули. Добави горници и долници, за да мога да ти създам перфектни комбинации!";
  },

  /**
   * Предложение за работа
   */
  generateWorkOutfitSuggestion(context: AIContext): string {
    const { wardrobe } = context;
    const workTops = wardrobe.filter(i => 
      i.category === 'tops' && 
      (i.occasions?.includes('work') || ['бяло', 'синьо', 'черно', 'сиво'].some(c => i.color.toLowerCase().includes(c)))
    );
    const workBottoms = wardrobe.filter(i => 
      i.category === 'bottoms' && 
      (i.occasions?.includes('work') || ['черно', 'сиво', 'тъмно'].some(c => i.color.toLowerCase().includes(c)))
    );

    if (workTops.length > 0 && workBottoms.length > 0) {
      const top = workTops[Math.floor(Math.random() * workTops.length)];
      const bottom = workBottoms[Math.floor(Math.random() * workBottoms.length)];
      
      return `💼 За офиса ти препоръчвам:\n\n• ${top.name} (${top.color})\n• ${bottom.name} (${bottom.color})\n\nТова е класическа комбинация, която излъчва професионализъм. Добави елегантни обувки и минималистични аксесоари за завършен вид.\n\n💡 Съвет: Избягвай прекалено ярки цветове за важни срещи.`;
    }

    return "💼 За работа препоръчвам неутрални цветове като бяло, черно, сиво и тъмносиньо. Виждам, че можеш да добавиш още официални дрехи в гардероба си!";
  },

  /**
   * Предложение за среща
   */
  generateDateOutfitSuggestion(context: AIContext): string {
    const { wardrobe } = context;
    const stylishItems = wardrobe.filter(i => 
      i.favorite || i.occasions?.includes('date') || ['черно', 'червено', 'бордо'].some(c => i.color.toLowerCase().includes(c))
    );

    if (stylishItems.length >= 2) {
      const items = stylishItems.slice(0, 2);
      return `❤️ За специална среща:\n\n${items.map(i => `• ${i.name} (${i.color})`).join('\n')}\n\nТази комбинация е елегантна и стилна - перфектна за романтична вечер! Добави любимия си парфюм и ще бъдеш неустоима/неустоим!\n\n💡 Съвет: Червените и бордо нюансите привличат вниманието и създават топла атмосфера.`;
    }

    return "❤️ За среща избери нещо, в което се чувстваш уверена/уверен! Препоръчвам дрехи в по-тъмни или наситени цветове - черно, бордо или тъмносиньо.";
  },

  /**
   * Предложение за спорт
   */
  generateSportOutfitSuggestion(context: AIContext): string {
    const { wardrobe } = context;
    const sportItems = wardrobe.filter(i => 
      i.occasions?.includes('sport') || i.material?.toLowerCase().includes('памук') || i.material?.toLowerCase().includes('спорт')
    );

    if (sportItems.length > 0) {
      return `🏃 За тренировка:\n\n${sportItems.slice(0, 3).map(i => `• ${i.name}`).join('\n')}\n\nНай-важното е да се чувстваш комфортно и свободно по време на движение!\n\n💡 Съвет: Избягвай памук за интензивни тренировки - търси дишащи материи.`;
    }

    return "🏃 Не виждам много спортни дрехи в гардероба ти. Препоръчвам да добавиш удобни, дишащи тениски и еластични панталони или клинове!";
  },

  /**
   * Съвети за цветове
   */
  generateColorAdvice(context: AIContext, message: string): string {
    const colorCombinations = [
      { colors: ['бяло', 'черно'], advice: 'Класическа и винаги актуална комбинация!' },
      { colors: ['синьо', 'бяло'], advice: 'Свеж и чист вид - перфектно за лятото!' },
      { colors: ['бежово', 'кафяво'], advice: 'Топла, земна палитра - много стилно!' },
      { colors: ['черно', 'червено'], advice: 'Драматична комбинация - перфектна за вечерни събития!' },
      { colors: ['сиво', 'розово'], advice: 'Нежна и модерна комбинация!' },
    ];

    const randomCombo = colorCombinations[Math.floor(Math.random() * colorCombinations.length)];

    return `🎨 Ето няколко съвета за комбиниране на цветове:\n\n**${randomCombo.colors.join(' + ')}**\n${randomCombo.advice}\n\n**Златни правила:**\n• Не повече от 3 цвята в един тоалет\n• Неутралните цветове (бяло, черно, сиво, бежово) се комбинират с всичко\n• Комплементарните цветове (срещуположни в цветовия кръг) създават драматичен ефект\n\n💡 Кажи ми кои цветове искаш да комбинираш и ще ти дам конкретен съвет!`;
  },

  /**
   * Анализ на гардероба
   */
  generateWardrobeAnalysis(context: AIContext): string {
    const { wardrobe } = context;
    const summary = this.summarizeWardrobe(wardrobe);
    
    const categoryLabels: Record<string, string> = {
      tops: 'Горници',
      bottoms: 'Долници',
      dresses: 'Рокли',
      outerwear: 'Връхни дрехи',
      shoes: 'Обувки',
      accessories: 'Аксесоари',
    };

    const stats = Object.entries(summary)
      .map(([cat, count]) => `• ${categoryLabels[cat] || cat}: ${count} бр.`)
      .join('\n');

    const total = wardrobe.length;
    const favorites = wardrobe.filter(i => i.favorite).length;
    const avgWorn = wardrobe.length > 0 
      ? (wardrobe.reduce((sum, i) => sum + i.times_worn, 0) / wardrobe.length).toFixed(1)
      : 0;

    return `📊 **Анализ на гардероба ти:**\n\n**Общо:** ${total} артикула\n${stats}\n\n**Статистика:**\n• Любими: ${favorites} бр.\n• Средно носене: ${avgWorn} пъти на артикул\n\n💡 **Препоръки:**\n${this.generateWardrobeRecommendations(summary)}`;
  },

  /**
   * Генериране на препоръки за гардероба
   */
  generateWardrobeRecommendations(summary: Record<string, number>): string {
    const recommendations: string[] = [];

    if (!summary.tops || summary.tops < 5) {
      recommendations.push('• Добави още горници за повече разнообразие');
    }
    if (!summary.bottoms || summary.bottoms < 3) {
      recommendations.push('• Инвестирай в няколко качествени панталони/поли');
    }
    if (!summary.outerwear || summary.outerwear < 2) {
      recommendations.push('• Добави връхни дрехи за различни сезони');
    }
    if (!summary.accessories || summary.accessories < 3) {
      recommendations.push('• Аксесоарите могат да трансформират всеки тоалет!');
    }

    return recommendations.length > 0 
      ? recommendations.join('\n')
      : 'Гардеробът ти е добре балансиран! 👏';
  },

  /**
   * Съвети за пазаруване
   */
  generateShoppingAdvice(context: AIContext): string {
    const { wardrobe } = context;
    const summary = this.summarizeWardrobe(wardrobe);
    
    const missing: string[] = [];
    if (!summary.tops || summary.tops < 3) missing.push('базови тениски и ризи');
    if (!summary.bottoms || summary.bottoms < 2) missing.push('класически дънки или панталони');
    if (!summary.outerwear) missing.push('универсално яке');
    if (!summary.shoes || summary.shoes < 2) missing.push('комфортни обувки за всеки ден');

    if (missing.length === 0) {
      return "🛍️ Гардеробът ти изглежда доста пълен! Вместо да купуваш ново, опитай да създадеш нови комбинации от това, което имаш. Sustainability is in! ♻️";
    }

    return `🛍️ **Какво липсва в гардероба ти:**\n\n${missing.map(m => `• ${m}`).join('\n')}\n\n💡 **Съвет:** Инвестирай в качествени базови дрехи - те се комбинират с всичко и издържат по-дълго. Търси неутрални цветове за максимална гъвкавост!`;
  },

  /**
   * Поздрав
   */
  generateGreeting(): string {
    const greetings = [
      "👋 Здравей! Аз съм твоят личен AI стилист. Как мога да ти помогна днес? Мога да:\n\n• 👗 Предложа тоалет за конкретен повод\n• 🎨 Дам съвети за комбиниране на цветове\n• 📊 Анализирам гардероба ти\n• 🛍️ Препоръчам какво ти липсва",
      "✨ Здрасти! Готов съм да ти помогна да изглеждаш невероятно! Какъв е поводът днес - работа, среща, или просто искаш да се почувстваш добре?",
      "👗 Привет, модна звезда! С какво мога да помогна? Просто ми кажи какво ти трябва - аз съм тук, за да превърна гардероба ти в твоя супер сила!",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  },

  /**
   * Общ отговор
   */
  generateGenericResponse(context: AIContext): string {
    return "🤔 Интересен въпрос! Мога да ти помогна с:\n\n• **\"Какво да облека днес?\"** - предложение за тоалет\n• **\"Помогни за работа/среща/спорт\"** - тоалет за конкретен повод\n• **\"Как да комбинирам цветове?\"** - съвети за стил\n• **\"Анализирай гардероба ми\"** - статистика и препоръки\n• **\"Какво ми липсва?\"** - идеи за покупки\n\nКажи ми какво те интересува! 👗";
  },

  /**
   * Създаване на предложения за тоалети
   */
  createOutfitSuggestions(
    context: AIContext,
    count: number,
    occasion?: string
  ): OutfitSuggestion[] {
    const { wardrobe } = context;
    const suggestions: OutfitSuggestion[] = [];

    const tops = wardrobe.filter(i => i.category === 'tops');
    const bottoms = wardrobe.filter(i => i.category === 'bottoms');

    for (let i = 0; i < Math.min(count, tops.length, bottoms.length); i++) {
      const top = tops[i % tops.length];
      const bottom = bottoms[i % bottoms.length];

      suggestions.push({
        id: `suggestion-${Date.now()}-${i}`,
        name: `Комбинация ${i + 1}`,
        items: [top, bottom],
        reasoning: `${top.color} и ${bottom.color} се допълват добре.`,
        occasion,
        confidence: 0.8 - (i * 0.1),
      });
    }

    return suggestions;
  },

  /**
   * Изчистване на чат историята
   */
  clearHistory(): void {
    useAIStore.getState().clearMessages();
  },

  /**
   * Получаване на времето (за контекст)
   */
  async getWeather(city: string = 'Sofia'): Promise<ServiceResponse<WeatherInfo>> {
    try {
      // This would normally call a weather API through n8n
      const response = await fetch(`${N8N_WEBHOOK_URL}/weather?city=${city}`);
      
      if (!response.ok) {
        // Return mock data if API fails
        return {
          success: true,
          data: {
            temperature: 22,
            condition: 'sunny',
            humidity: 45,
            city,
          },
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      // Return mock data on error
      return {
        success: true,
        data: {
          temperature: 20,
          condition: 'cloudy',
          humidity: 50,
          city,
        },
      };
    }
  },
};
