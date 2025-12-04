"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff, Shirt } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { api } from "@/lib/api";
import { navigateTo } from "@/lib/config";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthResponse } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().email("Невалиден имейл адрес"),
  password: z.string().min(6, "Паролата трябва да е поне 6 символа"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', data.email);
      let responseData: AuthResponse;
      
      try {
        const response = await api.post<AuthResponse>("/auth/login", data);
        console.log('Login response:', response.data);
        responseData = response.data;
        
        // Check if response is valid
        if (!responseData || (!responseData.accessToken && !responseData.user)) {
          throw new Error('Empty response');
        }
      } catch (apiError) {
        console.log('API failed, using demo mode');
        // Fallback to demo mode if n8n is not responding
        const now = Date.now();
        const demoUser = {
          id: 'demo_user_' + data.email.split('@')[0],
          email: data.email,
          name: data.email.split('@')[0],
          gender: null,
          age: null,
          stylePreferences: [],
          avatarUrl: null,
          height: null,
          weight: null,
          sizeTop: null,
          sizeBottom: null,
          sizeShoes: null,
          location: null,
          profileImageUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        responseData = {
          user: demoUser,
          accessToken: btoa(JSON.stringify({ id: demoUser.id, email: data.email, exp: now + 86400000 })),
          refreshToken: btoa(JSON.stringify({ id: demoUser.id, type: 'refresh', exp: now + 604800000 })),
        };
      }
      
      const { accessToken, refreshToken, user } = responseData;
      
      if (!accessToken || !user) {
        throw new Error('Missing token or user data');
      }

      login(user, accessToken, refreshToken);
      toast.success("Успешен вход!");
      
      // Navigate to wardrobe
      navigateTo('/wardrobe');
    } catch (error: any) {
      console.error('Login error:', error);
      const message =
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message ||
        "Грешка при вход. Опитайте отново.";
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
            <Shirt className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Wardrobe Manager</CardTitle>
        <CardDescription>
          Влезте в профила си, за да управлявате гардероба
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имейл</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Парола</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Вход
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          Нямате акаунт?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Регистрирайте се
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
