"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Send,
  Sparkles,
  Loader2,
  CloudSun,
  Shirt,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

import { api } from "@/lib/api";
import type { ChatMessage, Outfit } from "@/lib/types";

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
}

interface SuggestionResponse {
  success?: boolean;
  message: string;
  sessionId?: string;
  suggestions?: Outfit[];
}

export default function AiStylistPage() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Здравейте! 👋 Аз съм Стела, вашият AI стилист. Мога да ви помогна да изберете подходящ тоалет за всякакъв повод. Просто ми кажете какво планирате!",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('session_' + Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simulated weather (would connect to OpenWeatherMap in production)
  const [weather] = useState<WeatherData>({
    temp: 22,
    description: "Слънчево",
    icon: "☀️",
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Fetch user's garments for context
  const { data: garmentsData } = useQuery({
    queryKey: ["garments-for-ai"],
    queryFn: async () => {
      const response = await api.get("/garments?limit=100");
      if (Array.isArray(response.data)) {
        return { data: response.data, total: response.data.length };
      }
      return response.data;
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await api.post<SuggestionResponse>("/ai/chat", {
        message,
        sessionId,
        context: {
          weather,
          garmentCount: garmentsData?.total || 0,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Handle the response properly
      let messageContent = '';
      if (typeof data === 'string') {
        messageContent = data;
      } else if (data?.message) {
        messageContent = data.message;
      } else {
        messageContent = 'Извинете, възникна грешка. Моля, опитайте отново.';
      }
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: messageContent,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Update session ID if provided
      if (data?.sessionId) {
        setSessionId(data.sessionId);
      }
    },
    onError: (error: any) => {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Извинете, възникна грешка при комуникация. Моля, опитайте отново.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Грешка при комуникация с AI стилиста");
    },
    onSettled: () => {
      setIsTyping(false);
    },
  });

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input.trim();
    setInput("");
    setIsTyping(true);

    // Call backend AI service (which connects to n8n)
    chatMutation.mutate(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "Бизнес среща",
    "Casual уикенд",
    "Романтична вечеря",
    "Интервю за работа",
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInput(`Какво да облека за ${prompt.toLowerCase()}?`);
    inputRef.current?.focus();
  };

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] flex flex-col pb-16 md:pb-0">
      {/* Header - Mobile Optimized */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-purple-500 shrink-0" />
            <span className="truncate">AI Стилист</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 shrink-0">
          <CloudSun className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium whitespace-nowrap">
            {weather.icon} {weather.temp}°C
          </span>
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea ref={scrollRef} className="flex-1 p-3 md:p-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-3 py-2.5 md:px-4 md:py-3 ${
                    message.role === "user"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm md:text-base">{message.content}</div>
                  {message.role === "assistant" && message.id !== "welcome" && (
                    <div className="flex gap-1 mt-2 pt-2 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] md:text-xs text-muted-foreground hover:text-green-600"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        <span className="hidden md:inline">Полезно</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] md:text-xs text-muted-foreground hover:text-red-600"
                      >
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        <span className="hidden md:inline">Не помага</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Prompts - Mobile Optimized */}
        {messages.length === 1 && (
          <div className="px-3 md:px-4 pb-2">
            <p className="text-xs md:text-sm text-muted-foreground mb-2">
              Бързи въпроси:
            </p>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {quickPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="text-[11px] md:text-xs h-7 md:h-8 px-2 md:px-3"
                  onClick={() => handleQuickPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area - Mobile Optimized */}
        <div className="p-3 md:p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Попитайте за съвет..."
              disabled={isTyping}
              className="flex-1 h-10"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping}
              size="icon"
              className="h-10 w-10 shrink-0"
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground">
              <Shirt className="h-3 w-3" />
              {garmentsData?.total || 0} дрехи
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] md:text-xs h-6 px-2"
              onClick={() => {
                const welcomeMessage: ChatMessage = {
                  id: "welcome",
                  role: "assistant",
                  content: "Здравейте! 👋 Аз съм Стела, вашият AI стилист. Мога да ви помогна да изберете подходящ тоалет за всякакъв повод. Просто ми кажете какво планирате!",
                  createdAt: new Date().toISOString(),
                };
                setMessages([welcomeMessage]);
                setSessionId('session_' + Date.now());
              }}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              <span className="hidden md:inline">Нов разговор</span>
              <span className="md:hidden">Изчисти</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
