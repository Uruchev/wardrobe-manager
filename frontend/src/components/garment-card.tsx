"use client";

import Image from "next/image";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  CATEGORY_LABELS,
  SEASON_LABELS,
  STYLE_LABELS,
  COLOR_LABELS,
} from "@/lib/constants";
import type { Garment } from "@/lib/types";

interface GarmentCardProps {
  garment: Garment;
  viewMode: "grid" | "list";
  onEdit: () => void;
  onDelete: () => void;
}

export function GarmentCard({
  garment,
  viewMode,
  onEdit,
  onDelete,
}: GarmentCardProps) {
  const categoryLabel = CATEGORY_LABELS[garment.category as keyof typeof CATEGORY_LABELS] || garment.category;
  const seasonLabel = SEASON_LABELS[garment.season as keyof typeof SEASON_LABELS] || garment.season;
  const styleLabel = garment.style ? STYLE_LABELS[garment.style as keyof typeof STYLE_LABELS] : null;
  const colorLabel = garment.primaryColor ? COLOR_LABELS[garment.primaryColor as keyof typeof COLOR_LABELS] : null;

  if (viewMode === "list") {
    return (
      <Card className="flex flex-row items-center p-2.5 md:p-3 hover:shadow-md transition-shadow">
        <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {garment.imageUrl ? (
            <Image
              src={garment.imageUrl}
              alt={garment.name ?? 'Дреха'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-2xl text-gray-400">
              👕
            </div>
          )}
        </div>
        <div className="flex-1 ml-3 min-w-0">
          <h3 className="font-medium text-sm md:text-base text-gray-900 truncate">{garment.name || 'Без име'}</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            <Badge variant="secondary" className="text-[10px] md:text-xs">
              {categoryLabel}
            </Badge>
            <Badge variant="outline" className="text-[10px] md:text-xs">
              {seasonLabel}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Редактирай
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Изтрий
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative aspect-square bg-gray-100">
        {garment.imageUrl ? (
          <Image
            src={garment.imageUrl}
            alt={garment.name ?? 'Дреха'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-4xl md:text-6xl text-gray-300">
            👕
          </div>
        )}
        {/* Always visible on mobile, hover on desktop */}
        <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-7 w-7 md:h-8 md:w-8 shadow-sm">
                <MoreVertical className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Редактирай
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Изтрий
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CardContent className="p-2 md:p-3">
        <h3 className="font-medium text-xs md:text-sm text-gray-900 truncate mb-1.5 md:mb-2">
          {garment.name || 'Без име'}
        </h3>
        <div className="flex flex-wrap gap-0.5 md:gap-1">
          <Badge variant="secondary" className="text-[9px] md:text-xs px-1.5 py-0">
            {categoryLabel}
          </Badge>
          <Badge variant="outline" className="text-[9px] md:text-xs px-1.5 py-0">
            {seasonLabel}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
