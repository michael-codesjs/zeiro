import React from 'react';
import { Table, PieChart, BarChart, LineChart } from './index';
import { ChartData } from '../../hooks/use-natural-language-query';

interface ChartRendererProps {
  chartData: ChartData;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({ chartData }) => {
  const { chartType, title, data, message, suggestions, metadata } = chartData;

  // Handle Message type responses (greetings, help, errors)
  if (chartType === 'Message') {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="space-y-4">
          {title && (
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          )}
          
          {message && (
            <p className="text-slate-700 leading-relaxed">{message}</p>
          )}
          
          {suggestions && suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">Try asking:</p>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="text-sm text-slate-600 bg-slate-50 rounded px-3 py-2 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    "{suggestion}"
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
            Data source: {metadata.dataSource}
          </div>
        </div>
      </div>
    );
  }

  // Handle data visualization charts
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="text-center text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">No data available to display</p>
        </div>
      </div>
    );
  }

  switch (chartType) {
    case 'Table':
      return <Table data={data} title={title} />;
      
    case 'PieChart':
      return <PieChart data={data} title={title} />;
      
    case 'BarChart':
      return <BarChart data={data} title={title} />;
      
    case 'LineChart':
      return <LineChart data={data} title={title} />;
      
    case 'AreaChart':
      // For now, use LineChart for AreaChart (we can create a separate component later)
      return <LineChart data={data} title={title} />;
      
    case 'ScatterPlot':
      // For now, use LineChart without connecting lines (we can create a separate component later)
      return <LineChart data={data} title={title} showDots={true} />;
      
    default:
      // Fallback to Table for unknown chart types
      console.warn(`Unknown chart type: ${chartType}, falling back to Table`);
      return <Table data={data} title={title} />;
  }
}; 