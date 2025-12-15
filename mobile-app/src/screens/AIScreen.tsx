import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { useAIChatStore, useWardrobeStore } from '../store';
import { aiService, ChatMessage } from '../services/aiService';
import { voiceService } from '../services/voiceService';
import { ClothingItem } from '../config/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: 'sunny', text: 'Какво да облека днес?' },
  { icon: 'business', text: 'Аутфит за работа' },
  { icon: 'wine', text: 'Вечерен аутфит' },
  { icon: 'airplane', text: 'Какво да опаковам за пътуване?' },
  { icon: 'color-palette', text: 'Какви цветове ми отиват?' },
];

export default function AIScreen() {
  const [input, setInput] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false); // Изключено по подразбиране
  const { messages, isLoading, isListening, addMessage, setLoading, setListening } =
    useAIChatStore();
  const { items } = useWardrobeStore();
  const flatListRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for voice button when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  // Speak AI response when voice is enabled
  useEffect(() => {
    if (voiceEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        voiceService.speak(lastMessage.content);
      }
    }
  }, [messages, voiceEnabled]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Stop any ongoing speech
    await voiceService.stopSpeaking();

    setInput('');
    setLoading(true);

    try {
      // Use AI service for intelligent responses
      const result = await aiService.sendMessage(text.trim());
      
      if (!result.success) {
        console.error('AI Error:', result.error);
      }
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = async () => {
    if (isListening) {
      // Stop recording and transcribe
      setListening(false);
      const result = await voiceService.stopRecording();
      
      if (result.success && result.data) {
        // Send transcribed text
        sendMessage(result.data);
      } else if (result.error) {
        Alert.alert('Грешка', result.error);
      }
    } else {
      // Start recording
      const result = await voiceService.startRecording();
      
      if (result.success) {
        setListening(true);
      } else {
        Alert.alert('Грешка', result.error || 'Не може да се стартира запис');
      }
    }
  };

  const toggleVoiceOutput = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) {
      voiceService.stopSpeaking();
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === 'user' ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {item.role === 'assistant' && (
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={16} color={colors.white} />
        </View>
      )}
      <View style={styles.messageContent}>
        <View
          style={[
            styles.messageBubble,
            item.role === 'user' ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.role === 'user' ? styles.userText : styles.aiText,
            ]}
          >
            {item.content}
          </Text>
        </View>
        
        {/* Show suggested items if available */}
        {item.metadata?.suggestions && item.metadata.suggestions.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsScroll}
          >
            {item.metadata.suggestions.map((suggestion, idx) => (
              <View key={idx} style={styles.suggestionCard}>
                <Text style={styles.suggestionTitle}>{suggestion.name}</Text>
                <View style={styles.suggestionItems}>
                  {suggestion.items.slice(0, 2).map((suggItem: ClothingItem, itemIdx: number) => (
                    <Image
                      key={itemIdx}
                      source={{ uri: suggItem.image_no_bg_url || suggItem.image_url }}
                      style={styles.suggestionItemImage}
                    />
                  ))}
                </View>
                <Text style={styles.suggestionReasoning} numberOfLines={2}>
                  {suggestion.reasoning}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={24} color={colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Стилист</Text>
            <Text style={styles.headerSubtitle}>
              {isListening ? '🎤 Слушам...' : 'Винаги готов да помогне'}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, voiceEnabled && styles.headerButtonActive]}
            onPress={toggleVoiceOutput}
          >
            <Ionicons 
              name={voiceEnabled ? 'volume-high' : 'volume-mute'} 
              size={20} 
              color={voiceEnabled ? colors.accent : colors.textMuted} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              voiceService.stopSpeaking();
              useAIChatStore.getState().clearMessages();
            }}
          >
            <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <View style={styles.emptyChatIcon}>
              <Ionicons name="chatbubbles" size={48} color={colors.accent} />
            </View>
            <Text style={styles.emptyChatTitle}>Здравей! 👋</Text>
            <Text style={styles.emptyChatText}>
              Аз съм твоят личен AI стилист. Питай ме какво да облечеш, как да
              комбинираш дрехи или за съвети за стил!
            </Text>
            
            {/* Quick Prompts */}
            <View style={styles.quickPrompts}>
              {QUICK_PROMPTS.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickPrompt}
                  onPress={() => sendMessage(prompt.text)}
                >
                  <Ionicons
                    name={prompt.icon as any}
                    size={16}
                    color={colors.accent}
                  />
                  <Text style={styles.quickPromptText}>{prompt.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
      />

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.loadingText}>AI мисли...</Text>
          </View>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
              onPress={toggleVoice}
              disabled={isLoading}
            >
              <Ionicons
                name={isListening ? 'radio' : 'mic'}
                size={22}
                color={isListening ? colors.white : colors.accent}
              />
            </TouchableOpacity>
          </Animated.View>
          
          <TextInput
            style={styles.input}
            placeholder={isListening ? 'Слушам...' : 'Питай ме нещо...'}
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            editable={!isListening}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || isListening) && styles.sendButtonDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isLoading || isListening}
          >
            <Ionicons
              name="send"
              size={20}
              color={input.trim() && !isListening ? colors.white : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
  },
  headerButtonActive: {
    backgroundColor: `${colors.accent}20`,
  },
  clearButton: {
    padding: spacing.sm,
  },
  messagesList: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.xs,
  },
  aiBubble: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: spacing.xs,
    ...shadows.sm,
  },
  messageText: {
    fontSize: typography.md,
    lineHeight: 22,
  },
  userText: {
    color: colors.white,
  },
  aiText: {
    color: colors.textPrimary,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  emptyChatIcon: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyChatTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyChatText: {
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  quickPrompts: {
    width: '100%',
  },
  quickPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickPromptText: {
    marginLeft: spacing.sm,
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  loadingContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  loadingText: {
    marginLeft: spacing.sm,
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  voiceButtonActive: {
    backgroundColor: colors.accent,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
  messageContent: {
    flex: 1,
    maxWidth: '85%',
  },
  suggestionsScroll: {
    marginTop: spacing.sm,
  },
  suggestionCard: {
    width: 180,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionTitle: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  suggestionItems: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  suggestionItemImage: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  suggestionReasoning: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
});
