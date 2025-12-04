"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X } from "lucide-react";
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

import { api } from "@/lib/api";
import {
  GarmentCategory,
  CATEGORY_LABELS,
  Season,
  SEASON_LABELS,
  GarmentStyle,
  STYLE_LABELS,
  GarmentColor,
  COLOR_LABELS,
} from "@/lib/constants";
import type { Garment } from "@/lib/types";

const garmentSchema = z.object({
  name: z.string().min(1, "Името е задължително"),
  category: z.nativeEnum(GarmentCategory, {
    message: "Изберете категория",
  }),
  season: z.nativeEnum(Season, {
    message: "Изберете сезон",
  }),
  style: z.nativeEnum(GarmentStyle).optional(),
  primaryColor: z.nativeEnum(GarmentColor).optional(),
  secondaryColor: z.nativeEnum(GarmentColor).optional(),
  brand: z.string().optional(),
  notes: z.string().optional(),
});

type GarmentFormData = z.infer<typeof garmentSchema>;

interface GarmentFormProps {
  garment?: Garment | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function GarmentForm({ garment, onSuccess, onCancel }: GarmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    garment?.imageUrl || null
  );

  const form = useForm<GarmentFormData>({
    resolver: zodResolver(garmentSchema),
    defaultValues: {
      name: garment?.name || "",
      category: garment?.category as GarmentCategory || undefined,
      season: garment?.season as Season || undefined,
      style: garment?.style as GarmentStyle || undefined,
      primaryColor: garment?.primaryColor as GarmentColor || undefined,
      secondaryColor: garment?.secondaryColor as GarmentColor || undefined,
      brand: garment?.brand || "",
      notes: garment?.notes || "",
    },
  });

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Файлът трябва да е по-малък от 5MB");
          return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: GarmentFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, value as string);
        }
      });

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (garment) {
        await api.patch(`/garments/${garment.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Дрехата беше обновена");
      } else {
        await api.post("/garments", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Дрехата беше добавена");
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Image Upload */}
        <div className="space-y-2">
          <FormLabel>Снимка</FormLabel>
          {imagePreview ? (
            <div className="relative w-full aspect-square max-w-[200px] rounded-lg overflow-hidden border">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full aspect-square max-w-[200px] border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Качете снимка
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isLoading}
              />
            </label>
          )}
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Име *</FormLabel>
              <FormControl>
                <Input
                  placeholder="напр. Синя риза"
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Категория *</FormLabel>
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
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
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
                <FormLabel>Сезон *</FormLabel>
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="style"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Стил</FormLabel>
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
                    {Object.entries(STYLE_LABELS).map(([value, label]) => (
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
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Марка</FormLabel>
                <FormControl>
                  <Input
                    placeholder="напр. Zara"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="primaryColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Основен цвят</FormLabel>
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
                    {Object.entries(COLOR_LABELS).map(([value, label]) => (
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
            name="secondaryColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Вторичен цвят</FormLabel>
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
                    {Object.entries(COLOR_LABELS).map(([value, label]) => (
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

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Бележки</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Допълнителна информация..."
                  className="resize-none"
                  rows={3}
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
            {garment ? "Запази" : "Добави"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
