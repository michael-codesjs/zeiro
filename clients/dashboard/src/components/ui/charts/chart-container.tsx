"use client";

import { cn } from "@/utils/cn";
import React from "react";

interface ChartContainerProps {
  title?: string
  subtitle?: string
  height?: number
  className?: string
  children: React.ReactNode
}

export function ChartContainer({ title, subtitle, height = 400, className, children }: ChartContainerProps) {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-6", className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}
      <div style={{ height }} className="w-full">
        {children}
      </div>
    </div>
  )
}
