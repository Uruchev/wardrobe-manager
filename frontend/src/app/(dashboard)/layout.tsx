"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Shirt,
  Sparkles,
  User,
  Menu,
  LogOut,
  Layers,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth-store";

const navigation = [
  { name: "Гардероб", href: "/wardrobe", icon: Shirt },
  { name: "Тоалети", href: "/outfits", icon: Layers },
  { name: "AI Стилист", href: "/ai-stylist", icon: Sparkles },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Wait for hydration before checking auth
    if (_hasHydrated && !isAuthenticated) {
      const basePath = process.env.NODE_ENV === 'production' ? '/wardrobe-manager' : '';
      window.location.href = `${basePath}/login/`;
    }
  }, [_hasHydrated, isAuthenticated]);

  const handleLogout = () => {
    logout();
    const basePath = process.env.NODE_ENV === 'production' ? '/wardrobe-manager' : '';
    window.location.href = `${basePath}/login/`;
  };

  // Show loading while hydrating
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 border-b">
            <Link href="/wardrobe" className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Shirt className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Wardrobe Manager</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="flex-shrink-0 border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-2 py-6"
                >
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={user?.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{user?.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {user?.email}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Профил
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Изход
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4 bg-white border-b">
          <Link href="/wardrobe" className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Shirt className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold">Wardrobe</span>
          </Link>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </div>

                <nav className="flex-1 p-3 space-y-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    <User className="mr-3 h-5 w-5" />
                    Профил
                  </Link>
                </nav>

                <div className="p-3 border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Изход
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? "text-purple-600"
                    : "text-gray-500"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
                <span className="text-[10px] mt-1 font-medium">{item.name}</span>
              </Link>
            );
          })}
          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              pathname === "/profile"
                ? "text-purple-600"
                : "text-gray-500"
            }`}
          >
            <User className={`h-5 w-5 ${pathname === "/profile" ? "stroke-[2.5px]" : ""}`} />
            <span className="text-[10px] mt-1 font-medium">Профил</span>
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="pt-14 pb-16 lg:pt-0 lg:pb-0">
          <div className="px-4 py-4 sm:px-6 lg:px-8 lg:py-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
