"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface LoadingPlaceholderProps {
  message?: string;
  lines?: number;
}

export function LoadingPlaceholder({ message = "Carregando...", lines = 3 }: LoadingPlaceholderProps) {
  return (
    <div className="w-full space-y-3 p-4">
      <p className="text-sm text-gray-600">{message}</p>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, idx) => (
          <Skeleton key={idx} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
