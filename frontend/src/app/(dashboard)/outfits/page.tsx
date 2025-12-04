"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Loader2,
  Layers,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { OCCASION_LABELS, SEASON_LABELS } from "@/lib/constants";
import type { Outfit } from "@/lib/types";
import { OutfitForm } from "@/components/outfit-form";

export default function OutfitsPage() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["outfits"],
    queryFn: async () => {
      const response = await api.get("/outfits");
      // Handle both paginated and array response
      if (Array.isArray(response.data)) {
        return { data: response.data, total: response.data.length };
      }
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/outfits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
      toast.success("Тоалетът беше изтрит");
    },
    onError: () => {
      toast.error("Грешка при изтриване");
    },
  });

  const wearMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/outfits/${id}/wear`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
      toast.success("Отбелязано като носено!");
    },
    onError: () => {
      toast.error("Грешка при отбелязване");
    },
  });

  const handleDelete = (outfit: Outfit) => {
    if (confirm(`Сигурни ли сте, че искате да изтриете "${outfit.name}"?`)) {
      deleteMutation.mutate(outfit.id);
    }
  };

  const handleEdit = (outfit: Outfit) => {
    setEditingOutfit(outfit);
    setIsAddDialogOpen(true);
  };

  const handleWear = (outfit: Outfit) => {
    wearMutation.mutate(outfit.id);
  };

  const handleDialogClose = () => {
    setIsAddDialogOpen(false);
    setEditingOutfit(null);
  };

  const handleSuccess = () => {
    handleDialogClose();
    queryClient.invalidateQueries({ queryKey: ["outfits"] });
  };

  const outfits = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* Header - Mobile Optimized */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Моите Тоалети</h1>
          <p className="text-sm text-muted-foreground">
            {total} запазени комбинации
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="md:size-default"
              onClick={() => setEditingOutfit(null)}
            >
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Създай тоалет</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOutfit ? "Редактиране на тоалет" : "Създаване на нов тоалет"}
              </DialogTitle>
              <DialogDescription>
                {editingOutfit
                  ? "Редактирайте комбинацията от дрехи"
                  : "Изберете дрехи, за да създадете тоалет"}
              </DialogDescription>
            </DialogHeader>
            <OutfitForm
              outfit={editingOutfit}
              onSuccess={handleSuccess}
              onCancel={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Грешка при зареждане на тоалетите
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["outfits"] })}
          >
            Опитай отново
          </Button>
        </div>
      ) : outfits.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
            <Layers className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Няма създадени тоалети
          </h3>
          <p className="text-muted-foreground mb-4 text-sm px-4">
            Създайте първия си тоалет, като комбинирате дрехи
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Създай тоалет
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {outfits.map((outfit: Outfit) => (
            <Card key={outfit.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="p-3 md:p-4 pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base md:text-lg">{outfit.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleWear(outfit)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Облечи днес
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(outfit)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Редактирай
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(outfit)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Изтрий
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0 pb-2">
                {/* Garment preview grid */}
                <div className="grid grid-cols-3 gap-1.5 md:gap-2 mb-3">
                  {outfit.items?.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden"
                    >
                      {item.garment?.imageUrl ? (
                        <img
                          src={item.garment.imageUrl}
                          alt={item.garment.name ?? 'Дреха'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl md:text-2xl">👕</span>
                      )}
                    </div>
                  ))}
                  {outfit.items && outfit.items.length > 3 && (
                    <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-xs md:text-sm text-muted-foreground">
                      +{outfit.items.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {outfit.occasion && (
                    <Badge variant="secondary" className="text-[10px] md:text-xs">
                      {OCCASION_LABELS[outfit.occasion as keyof typeof OCCASION_LABELS] || outfit.occasion}
                    </Badge>
                  )}
                  {outfit.season && (
                    <Badge variant="outline" className="text-[10px] md:text-xs">
                      {SEASON_LABELS[outfit.season as keyof typeof SEASON_LABELS] || outfit.season}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-3 md:p-4 pt-2">
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                  <span>{outfit.items?.length || 0} дрехи</span>
                  {outfit.wearCount !== undefined && outfit.wearCount > 0 && (
                    <span>Носен {outfit.wearCount}x</span>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <div className="fixed bottom-20 right-4 md:hidden">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => {
            setEditingOutfit(null);
            setIsAddDialogOpen(true);
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
