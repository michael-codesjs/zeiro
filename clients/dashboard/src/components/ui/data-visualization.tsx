"use client";

import React from 'react';
import { cn } from '@/utils/cn';
import {
  BarChart as UiBarChart,
  LineChart as UiLineChart,
  AreaChart as UiAreaChart,
  PieChart as UiPieChart,
  ScatterChart as UiScatterChart,
  type XYChartProps,
} from '@/components/ui/charts';

// Import types from SDK
interface VisualizationColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  format?: string;
}

interface VisualizationData {
  columns: VisualizationColumn[];
  rows: Record<string, any>[];
}

interface ChartConfig {
  xAxis?: string;
  yAxis?: string | string[];
  groupBy?: string;
  title?: string;
  subtitle?: string;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
}

interface TableConfig {
  title?: string;
  subtitle?: string;
  sortable?: boolean;
  searchable?: boolean;
  pagination?: {
    pageSize: number;
    showSizeChanger?: boolean;
  };
  maxHeight?: string;
}

type VisualizationType = 'table' | 'bar_chart' | 'line_chart' | 'pie_chart' | 'area_chart' | 'scatter_plot';

interface DataVisualization {
  id: string;
  type: VisualizationType;
  data: VisualizationData;
  config: ChartConfig | TableConfig;
  query?: string;
  timestamp: string;
}

interface DataVisualizationProps {
  visualization: DataVisualization;
  className?: string;
}

// Default color palette
const DEFAULT_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
];

export function DataVisualization({ visualization, className }: DataVisualizationProps) {
  const { type, data, config } = visualization;

  // Helper function to get chart colors
  const getColors = () => {
    if ('colors' in config && config.colors) {
      return config.colors;
    }
    return DEFAULT_COLORS;
  };

  // Helper function to format data
  const normalizedRows = React.useMemo(() => {
    return data.rows.map(row => {
      const formattedRow: Record<string, any> = {};
      data.columns.forEach(col => {
        let value = row[col.key];
        if (col.type === 'date' && value) {
          value = new Date(value).toISOString();
        } else if (col.type === 'number' && value !== null && value !== undefined) {
          value = Number(value);
        }
        formattedRow[col.key] = value;
        formattedRow[col.label] = value;
      });
      return formattedRow;
    });
  }, [data]);

  // Get chart configuration
  const chartConfig = config as ChartConfig;
  const tableConfig = config as TableConfig;
  const colors = getColors();

  // Build series for XY charts (bar/line/area)
  const buildXYSeries = (): XYChartProps['series'] => {
    const xKey = chartConfig.xAxis || data.columns[0]?.key || 'x';
    const yKeys = Array.isArray(chartConfig.yAxis)
      ? chartConfig.yAxis
      : [chartConfig.yAxis || data.columns[1]?.key || 'y'];

    const series = yKeys.map((yKey) => ({
      name: String(yKey),
      data: normalizedRows.map(r => ({ x: r[xKey], y: Number(r[yKey as string] ?? 0) })),
    }));
    return series;
  };

  // Render title and subtitle for tables
  const renderHeader = () => {
    const title = 'title' in config ? config.title : undefined;
    const subtitle = 'subtitle' in config ? config.subtitle : undefined;
    if (!title && !subtitle) return null;
    return (
      <div className="mb-4">
        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
    );
  };

  // Render table
  const renderTable = () => {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200">
        {renderHeader()}
        <div 
          className="overflow-auto"
          style={{ maxHeight: tableConfig.maxHeight || '400px' }}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {data.columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.rows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {data.columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {formatCellValue(row[column.key], column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Format cell value based on column type
  const formatCellValue = (value: any, column: VisualizationColumn) => {
    if (value === null || value === undefined) return '-';
    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  };

  // Render chart based on type using reusable components
  const renderChart = () => {
    const xKey = chartConfig.xAxis || data.columns[0]?.key || 'x';
    const yKeysArr = Array.isArray(chartConfig.yAxis)
      ? chartConfig.yAxis
      : [chartConfig.yAxis || data.columns[1]?.key || 'y'];

    switch (type) {
      case 'bar_chart':
        return (
          <UiBarChart
            title={chartConfig.title}
            subtitle={chartConfig.subtitle}
            height={400}
            series={buildXYSeries()}
            xKey={xKey}
            yKeys={yKeysArr as string[]}
            colors={colors}
            showLegend={chartConfig.showLegend !== false}
          />
        );
      case 'line_chart':
        return (
          <UiLineChart
            title={chartConfig.title}
            subtitle={chartConfig.subtitle}
            height={400}
            series={buildXYSeries()}
            xKey={xKey}
            yKeys={yKeysArr as string[]}
            colors={colors}
            showLegend={chartConfig.showLegend !== false}
          />
        );
      case 'area_chart':
        return (
          <UiAreaChart
            title={chartConfig.title}
            subtitle={chartConfig.subtitle}
            height={400}
            series={buildXYSeries()}
            xKey={xKey}
            yKeys={yKeysArr as string[]}
            colors={colors}
            showLegend={chartConfig.showLegend !== false}
          />
        );
      case 'pie_chart': {
        const labelKey = xKey;
        const valueKey = yKeysArr[0] as string;
        const labels = normalizedRows.map(r => String(r[labelKey]));
        const values = normalizedRows.map(r => Number(r[valueKey] ?? 0));
        return (
          <UiPieChart
            title={chartConfig.title}
            subtitle={chartConfig.subtitle}
            height={400}
            labels={labels}
            values={values}
            colors={colors}
            showLegend={chartConfig.showLegend !== false}
          />
        );
      }
      case 'scatter_plot': {
        const series = (yKeysArr as string[]).map((yKey, i) => ({
          name: yKey,
          data: normalizedRows.map(r => ({ x: Number(r[xKey] ?? 0), y: Number(r[yKey] ?? 0) })),
          color: colors[i % colors.length]
        }));
        return (
          <UiScatterChart
            title={chartConfig.title}
            subtitle={chartConfig.subtitle}
            height={400}
            series={series}
            xKey={xKey}
            yKeys={yKeysArr as string[]}
            colors={colors}
            showLegend={chartConfig.showLegend !== false}
          />
        );
      }
      default:
        return renderTable();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {type === 'table' ? (
        renderTable()
      ) : (
        <div>
          {renderChart()}
          {visualization.query && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                View SQL Query
              </summary>
              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                {visualization.query}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
