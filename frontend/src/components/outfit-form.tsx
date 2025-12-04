"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

import { api } from "@/lib/api";
import {
  Season,
  SEASON_LABELS,
  Occasion,
  OCCASION_LABELS,
  CATEGORY_LABELS,
} from "@/lib/constants";
import type { Outfit, Garment, PaginatedResponse } from "@/lib/types";

const outfitSchema = z.object({
  name: z.string().min(1, "Името е задължително"),
  occasion: z.nativeEnum(Occasion).optional(),
  season: z.nativeEnum(Season).optional(),
  notes: z.string().optional(),
  garmentIds: z.array(z.string()).min(1, "Изберете поне една дреха"),
});

type OutfitFormData = z.infer<typeof outfitSchema>;

interface OutfitFormProps {
  outfit?: Outfit | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function OutfitForm({ outfit, onSuccess, onCancel }: OutfitFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's garments
  const { data: garmentsData, isLoading: isLoadingGarments } = useQuery({
    queryKey: ["garments-all"],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Garment>>("/garments?limit=100");
      return response.data;
    },
  });

  const form = useForm<OutfitFormData>({
    resolver: zodResolver(outfitSchema),
    defaultValues: {
      name: outfit?.name || "",
      occasion: outfit?.occasion as Occasion || undefined,
      season: outfit?.season as Season || undefined,
      notes: outfit?.notes || "",
      garmentIds: outfit?.items?.map((item) => item.garmentId) || [],
    },
  });

  const selectedGarmentIds = form.watch("garmentIds");

  const toggleGarment = (garmentId: string) => {
    const current = form.getValues("garmentIds");
    if (current.includes(garmentId)) {
      form.setValue(
        "garmentIds",
        current.filter((id) => id !== garmentId)
      );
    } else {
      form.setValue("garmentIds", [...current, garmentId]);
    }
  };

  const onSubmit = async (data: OutfitFormData) => {
    setIsLoading(true);
    try {
      if (outfit) {
        await api.patch(`/outfits/${outfit.id}`, data);
        toast.success("Тоалетът беше обновен");
      } else {
        await api.post("/outfits", data);
        toast.success("Тоалетът беше създаден");
      }
      onSuccess();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Грешка при запазване. Опитайте отново.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Group garments by category
  const garmentsByCategory = garmentsData?.data.reduce((acc, garment) => {
    const category = garment.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(garment);
    return acc;
  }, {} as Record<string, Garment[]>) || {};

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Име на тоалета *</FormLabel>
              <FormControl>
                <Input
                  placeholder="напр. Официална визия за събитие"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="occasion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Повод</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Изберете" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(OCCASION_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="season"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Сезон</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Изберете" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(SEASON_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Garment Selection */}
        <FormField
          control={form.control}
          name="garmentIds"
          render={() => (
            <FormItem>
              <FormLabel>
                Изберете дрехи * ({selectedGarmentIds.length} избрани)
              </FormLabel>
              {isLoadingGarments ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : garmentsData?.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Нямате добавени дрехи. Първо добавете дрехи в гардероба.
                </div>
              ) : (
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="space-y-6">
                    {Object.entries(garmentsByCategory).map(([category, garments]) => (
                      <div key={category}>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">
                          {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category}
                        </h4>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {garments.map((garment) => {
                            const isSelected = selectedGarmentIds.includes(garment.id);
                            return (
                              <button
                                key={garment.id}
                                type="button"
                                onClick={() => toggleGarment(garment.id)}
                                className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                                  isSelected
                                    ? "border-purple-500 ring-2 ring-purple-200"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                {garment.imageUrl ? (
                                  <img
                                    src={garment.imageUrl}
                                    alt={garment.name ?? 'Дреха'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-2xl">
                                    👕
                                  </div>
                                )}
                                {isSelected && (
                                  <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                    <div className="bg-purple-500 rounded-full p-1">
                                      <Check className="h-4 w-4 text-white" />
                                    </div>
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
                                  <span className="text-xs text-white truncate block">
                                    {garment.name}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Бележки</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Допълнителна информация за тоалета..."
                  className="resize-none"
                  rows={2}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Отказ
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {outfit ? "Запази" : "Създай"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
