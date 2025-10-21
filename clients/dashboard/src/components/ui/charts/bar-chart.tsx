"use client";

import React from "react";
import { ResponsiveContainer, BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartContainer } from "./chart-container";
import type { XYChartProps } from "./types";

export function BarChart({ title, subtitle, height, series, xKey, yKeys, colors, showLegend = true, className }: XYChartProps) {
  const data = mergeSeries(series, xKey);
  const palette = colors || series.map(s => s.color).filter(Boolean) as string[];

  return (
    <ChartContainer title={title} subtitle={subtitle} height={height} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          {showLegend && <Legend />}
          {(yKeys || series.map(s => s.name)).map((key, i) => (
            <Bar key={String(key)} dataKey={String(key)} fill={palette[i % (palette.length || 1)] || '#3B82F6'} />
          ))}
        </RBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

function mergeSeries(series: XYChartProps['series'], xKey: string) {
  const byX: Record<string, any> = {};
  for (const s of series) {
    for (const point of s.data as any[]) {
      const x = typeof point === 'object' ? point.x : point;
      const y = typeof point === 'object' ? point.y : point;
      byX[x] = byX[x] || { [xKey]: x };
      byX[x][s.name] = y;
    }
  }
  return Object.values(byX);
}
