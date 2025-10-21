"use client";

import React from "react";
import { ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ChartContainer } from "./chart-container";
import type { PieChartProps } from "./types";

export function PieChart({ title, subtitle, height, labels, values, colors, showLegend = true, className }: PieChartProps) {
  const palette = colors || ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
  const data = labels.map((name, i) => ({ name, value: values[i] ?? 0 }));

  return (
    <ChartContainer title={title} subtitle={subtitle} height={height} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RPieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip />
          {showLegend && <Legend />}
        </RPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
