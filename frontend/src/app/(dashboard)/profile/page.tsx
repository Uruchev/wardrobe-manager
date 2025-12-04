"use client";

import { Loader2, Camera } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuthStore } from "@/stores/auth-store";
import { navigateTo } from "@/lib/config";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success("Излязохте успешно");
    navigateTo('/login/');
  };

  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Профил</h1>
        <p className="text-muted-foreground">
          Вашата лична информация
        </p>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Профилна снимка</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatarUrl ?? undefined} />
              <AvatarFallback className="text-2xl bg-purple-100 text-purple-700">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <p className="font-medium text-lg">{user?.name}</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Име</label>
            <Input value={user?.name || ""} disabled />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Имейл</label>
            <Input value={user?.email || ""} disabled />
          </div>

          {user?.gender && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Пол</label>
              <Input value={user.gender === 'male' ? 'Мъж' : user.gender === 'female' ? 'Жена' : 'Друго'} disabled />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="pt-6">
          <Button variant="destructive" onClick={handleLogout} className="w-full">
            Изход от профила
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
