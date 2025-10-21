/**
 * Data visualization types for the Zeiro platform
 */

export type VisualizationType = 'table' | 'bar_chart' | 'line_chart' | 'pie_chart' | 'area_chart' | 'scatter_plot';

export interface VisualizationColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  format?: string; // For dates, numbers, etc.
}

export interface VisualizationData {
  columns: VisualizationColumn[];
  rows: Record<string, any>[];
}

export interface ChartConfig {
  xAxis?: string; // Column key for X-axis
  yAxis?: string | string[]; // Column key(s) for Y-axis
  groupBy?: string; // Column key for grouping/series
  title?: string;
  subtitle?: string;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
}

export interface TableConfig {
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

export interface DataVisualization {
  id: string;
  type: VisualizationType;
  data: VisualizationData;
  config: ChartConfig | TableConfig;
  query?: string; // The SQL query that generated this data
  timestamp: string;
}

export interface DataVisualizationMessage {
  type: 'data_visualization';
  visualization: DataVisualization;
  executionId: string;
  threadId: string;
}
