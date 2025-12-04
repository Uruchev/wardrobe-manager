"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Shirt,
  Loader2,
  X,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";

import { api } from "@/lib/api";
import {
  CATEGORY_LABELS,
  SEASON_LABELS,
} from "@/lib/constants";
import type { Garment } from "@/lib/types";
import { GarmentForm } from "@/components/garment-form";
import { GarmentCard } from "@/components/garment-card";

export default function WardrobePage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGarment, setEditingGarment] = useState<Garment | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch garments
  const { data, isLoading, error } = useQuery({
    queryKey: ["garments", searchQuery, selectedCategory, selectedSeason],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedSeason) params.append("season", selectedSeason);
      
      const response = await api.get(`/garments?${params.toString()}`);
      // Handle both paginated and array response
      if (Array.isArray(response.data)) {
        return { data: response.data, total: response.data.length };
      }
      return response.data;
    },
  });

  // Delete garment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/garments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["garments"] });
      toast.success("Дрехата беше изтрита");
    },
    onError: () => {
      toast.error("Грешка при изтриване");
    },
  });

  const handleDelete = (garment: Garment) => {
    if (confirm(`Сигурни ли сте, че искате да изтриете "${garment.name || 'тази дреха'}"?`)) {
      deleteMutation.mutate(garment.id);
    }
  };

  const handleEdit = (garment: Garment) => {
    setEditingGarment(garment);
    setIsAddDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingGarment(null);
  };

  const handleSuccess = () => {
    handleDialogClose();
    queryClient.invalidateQueries({ queryKey: ["garments"] });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSeason("");
    setIsFilterOpen(false);
  };

  const hasFilters = searchQuery || selectedCategory || selectedSeason;
  const garments = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Header - Mobile Optimized */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Моят Гардероб</h1>
          <p className="text-sm text-muted-foreground">
            {total} дрехи в гардероба
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="md:size-default"
              onClick={() => setEditingGarment(null)}
            >
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Добави дреха</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingGarment ? "Редактиране на дреха" : "Добавяне на нова дреха"}
              </DialogTitle>
              <DialogDescription>
                {editingGarment
                  ? "Редактирайте информацията за дрехата"
                  : "Попълнете информация за дрехата"}
              </DialogDescription>
            </DialogHeader>
            <GarmentForm
              garment={editingGarment}
              onSuccess={handleSuccess}
              onCancel={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filters - Mobile Optimized */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Търсене..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        
        {/* Mobile Filter Button */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden shrink-0 relative">
              <SlidersHorizontal className="h-4 w-4" />
              {hasFilters && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-purple-500 rounded-full" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto rounded-t-xl">
            <SheetHeader className="pb-4">
              <SheetTitle>Филтри</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 pb-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Категория</label>
                <Select value={selectedCategory || "all"} onValueChange={(v) => setSelectedCategory(v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Всички категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всички категории</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Сезон</label>
                <Select value={selectedSeason || "all"} onValueChange={(v) => setSelectedSeason(v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Всички сезони" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всички сезони</SelectItem>
                    {Object.entries(SEASON_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={clearFilters}
                >
                  Изчисти
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Приложи
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Filters */}
        <div className="hidden md:flex gap-2">
          <Select value={selectedCategory || "all"} onValueChange={(v) => setSelectedCategory(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички категории</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSeason || "all"} onValueChange={(v) => setSelectedSeason(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Сезон" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички сезони</SelectItem>
              {Object.entries(SEASON_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* View Toggle */}
        <div className="hidden md:flex gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active Filters Pills - Mobile */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 md:hidden">
          {selectedCategory && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSelectedCategory("")}
            >
              {CATEGORY_LABELS[selectedCategory as keyof typeof CATEGORY_LABELS]}
              <X className="ml-1 h-3 w-3" />
            </Button>
          )}
          {selectedSeason && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSelectedSeason("")}
            >
              {SEASON_LABELS[selectedSeason as keyof typeof SEASON_LABELS]}
              <X className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Грешка при зареждане на гардероба</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["garments"] })}
          >
            Опитай отново
          </Button>
        </div>
      ) : garments.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
            <Shirt className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasFilters ? "Няма намерени дрехи" : "Гардеробът е празен"}
          </h3>
          <p className="text-muted-foreground mb-4 text-sm px-4">
            {hasFilters
              ? "Опитайте с други филтри"
              : "Добавете първата си дреха, за да започнете"}
          </p>
          {!hasFilters && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добави дреха
            </Button>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
              : "space-y-3"
          }
        >
          {garments.map((garment: Garment) => (
            <GarmentCard
              key={garment.id}
              garment={garment}
              viewMode={viewMode}
              onEdit={() => handleEdit(garment)}
              onDelete={() => handleDelete(garment)}
            />
          ))}
        </div>
      )}

      {/* Mobile FAB for adding */}
      <div className="fixed bottom-20 right-4 md:hidden">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => {
            setEditingGarment(null);
            setIsAddDialogOpen(true);
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
