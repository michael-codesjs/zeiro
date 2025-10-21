import { DataVisualization, VisualizationType, VisualizationData, ChartConfig, TableConfig } from './types';

/**
 * Utility functions for creating and sending data visualizations
 */

export class VisualizationBuilder {
  private visualization: Partial<DataVisualization>;

  constructor(type: VisualizationType, data: VisualizationData) {
    this.visualization = {
      id: `viz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Set chart configuration
   */
  withChartConfig(config: ChartConfig): this {
    this.visualization.config = config;
    return this;
  }

  /**
   * Set table configuration
   */
  withTableConfig(config: TableConfig): this {
    this.visualization.config = config;
    return this;
  }

  /**
   * Set the SQL query that generated this data
   */
  withQuery(query: string): this {
    this.visualization.query = query;
    return this;
  }

  /**
   * Build the final visualization object
   */
  build(): DataVisualization {
    if (!this.visualization.config) {
      // Default config based on type
      if (this.visualization.type === 'table') {
        this.visualization.config = {
          sortable: true,
          searchable: true,
          pagination: { pageSize: 10 }
        } as TableConfig;
      } else {
        this.visualization.config = {
          showLegend: true,
          showGrid: true
        } as ChartConfig;
      }
    }

    return this.visualization as DataVisualization;
  }
}

/**
 * Smart visualization type detection based on data characteristics and user intent
 */
export function suggestVisualizationType(
  data: VisualizationData, 
  userIntent?: string
): VisualizationType {
  const { columns, rows } = data;
  
  // If no data, default to table
  if (!rows.length) return 'table';
  
  // Check for explicit user requests first - this takes absolute priority
  if (userIntent) {
    const intent = userIntent.toLowerCase();
    console.log('🔍 Analyzing user intent for chart type:', intent);
    
    // Explicit chart type requests
    if (intent.includes('pie chart') || intent.includes('pie')) {
      console.log('✅ User explicitly requested pie chart');
      return 'pie_chart';
    }
    if (intent.includes('bar chart') || intent.includes('bar')) {
      console.log('✅ User explicitly requested bar chart');
      return 'bar_chart';
    }
    if (intent.includes('line chart') || intent.includes('line')) {
      console.log('✅ User explicitly requested line chart');
      return 'line_chart';
    }
    if (intent.includes('area chart') || intent.includes('area')) {
      console.log('✅ User explicitly requested area chart');
      return 'area_chart';
    }
    if (intent.includes('scatter') || intent.includes('scatter plot')) {
      console.log('✅ User explicitly requested scatter plot');
      return 'scatter_plot';
    }
    if (intent.includes('table')) {
      console.log('✅ User explicitly requested table');
      return 'table';
    }
    
    // Smart context-based detection
    if (intent.includes('compare') || intent.includes('comparison') || intent.includes('vs') || intent.includes('versus')) {
      console.log('💡 Detected comparison context - suggesting pie chart');
      return 'pie_chart';
    }
    if (intent.includes('trend') || intent.includes('over time') || intent.includes('timeline') || intent.includes('history')) {
      console.log('💡 Detected time series context - suggesting line chart');
      return 'line_chart';
    }
    if (intent.includes('distribution') || intent.includes('breakdown') || intent.includes('proportion')) {
      console.log('💡 Detected distribution context - suggesting pie chart');
      return 'pie_chart';
    }
    if (intent.includes('ranking') || intent.includes('top') || intent.includes('most') || intent.includes('least')) {
      console.log('💡 Detected ranking context - suggesting bar chart');
      return 'bar_chart';
    }
  }
  
  const numericColumns = columns.filter(col => col.type === 'number').length;
  const dateColumns = columns.filter(col => col.type === 'date').length;
  const stringColumns = columns.filter(col => col.type === 'string').length;
  
  // Time series data (has date + numeric columns)
  if (dateColumns >= 1 && numericColumns >= 1) {
    return 'line_chart';
  }
  
  // Categorical data with one numeric column - perfect for pie charts
  if (stringColumns >= 1 && numericColumns === 1) {
    // For comparison data (like "blogs vs publications"), pie chart is ideal
    if (rows.length <= 10) {
      return 'pie_chart';
    }
    return 'bar_chart';
  }
  
  // Multiple numeric columns suggest comparison
  if (numericColumns >= 2) {
    return 'scatter_plot';
  }
  
  // Large datasets or complex data default to table
  if (rows.length > 50 || columns.length > 6) {
    return 'table';
  }
  
  // Default fallback
  return 'table';
}

/**
 * Convert query results to visualization data format
 */
export function queryResultsToVisualizationData(
  results: any[],
  columnTypes?: Record<string, 'string' | 'number' | 'date' | 'boolean'>
): VisualizationData {
  if (!results.length) {
    return { columns: [], rows: [] };
  }

  // Infer columns from first row
  const firstRow = results[0];
  const columns = Object.keys(firstRow).map(key => {
    const value = firstRow[key];
    let type: 'string' | 'number' | 'date' | 'boolean' = 'string';
    
    // Use provided type or infer
    if (columnTypes && columnTypes[key]) {
      type = columnTypes[key];
    } else if (typeof value === 'number') {
      type = 'number';
    } else if (typeof value === 'boolean') {
      type = 'boolean';
    } else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
      type = 'date';
    }

    return {
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type
    };
  });

  return {
    columns,
    rows: results
  };
}

/**
 * Send a data visualization via WebSocket
 */
export async function sendDataVisualization(
  websocketManager: any,
  visualization: DataVisualization,
  executionId: string,
  threadId: string
): Promise<void> {
  await websocketManager.publishChatUpdate('data_visualization', {
    visualization
  }, {
    executionId,
    threadId
  });
}
