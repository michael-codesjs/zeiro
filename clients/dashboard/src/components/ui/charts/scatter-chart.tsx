"use client";

import React from "react";
import { ResponsiveContainer, ScatterChart as RScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartContainer } from "./chart-container";
import type { XYChartProps } from "./types";

export function ScatterChart({ title, subtitle, height, series, xKey, yKeys, colors, showLegend = true, className }: XYChartProps) {
  const palette = colors || series.map(s => s.color).filter(Boolean) as string[];

  // For scatter we expect each series to provide { x, y } points
  const s = series.map((ss, i) => ({ name: ss.name, data: (ss.data as any[]).map(d => ({ x: (d as any).x, y: (d as any).y })), color: palette[i % (palette.length || 1)] || '#3B82F6' }));

  return (
    <ChartContainer title={title} subtitle={subtitle} height={height} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" name={xKey} tick={{ fontSize: 12 }} />
          <YAxis type="number" dataKey="y" name={yKeys?.[0] || 'y'} tick={{ fontSize: 12 }} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          {showLegend && <Legend />}
          {s.map((ss) => (
            <Scatter key={ss.name} name={ss.name} data={ss.data} fill={ss.color} />
          ))}
        </RScatterChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
