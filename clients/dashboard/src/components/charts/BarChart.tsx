import React from 'react';

interface BarChartData {
  category: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  height?: number;
  showValues?: boolean;
}

const DEFAULT_COLOR = '#3B82F6'; // blue-500

export const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  title, 
  height = 300, 
  showValues = true 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="text-center text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  // Filter out undefined/null values and ensure we have valid numbers
  const validValues = data.map(item => item.value).filter(v => v != null && !isNaN(v));
  const maxValue = validValues.length > 0 ? Math.max(...validValues) : 0;
  const minValue = validValues.length > 0 ? Math.min(...validValues) : 0;
  const range = maxValue - minValue || 1;
  
  // Chart dimensions
  const chartHeight = height - 80; // Leave space for labels
  const chartWidth = 400;
  const barWidth = Math.min(60, (chartWidth - 40) / data.length - 10);
  const barSpacing = (chartWidth - 40 - (barWidth * data.length)) / (data.length - 1 || 1);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {title && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600 mt-1">
            {data.length} {data.length === 1 ? 'category' : 'categories'}
          </p>
        </div>
      )}
      
      <div className="w-full overflow-x-auto">
        <svg width={Math.max(chartWidth, data.length * 80)} height={height} className="min-w-full">
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const value = minValue + (range * ratio);
            const y = chartHeight - (ratio * chartHeight) + 20;
            
            return (
              <g key={ratio}>
                <line
                  x1={30}
                  y1={y}
                  x2={chartWidth + 20}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth={1}
                />
                <text
                  x={25}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-slate-500"
                >
                  {isNaN(value) ? 'N/A' : value.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = ((item.value - minValue) / range) * chartHeight;
            const x = 40 + (index * (barWidth + barSpacing));
            const y = chartHeight - barHeight + 20;
            const color = item.color || DEFAULT_COLOR;

            return (
              <g key={index}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  rx={2}
                />
                
                {/* Value label on top of bar */}
                {showValues && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    className="text-xs fill-slate-700 font-medium"
                  >
                    {item.value.toLocaleString()}
                  </text>
                )}
                
                {/* Category label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 35}
                  textAnchor="middle"
                  className="text-xs fill-slate-600"
                  style={{ 
                    maxWidth: barWidth + 20,
                  }}
                >
                  {item.category.length > 12 
                    ? `${item.category.substring(0, 12)}...` 
                    : item.category
                  }
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Statistics */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-4">
        <span>Min: {isNaN(minValue) ? 'N/A' : minValue.toLocaleString()}</span>
        <span>Max: {isNaN(maxValue) ? 'N/A' : maxValue.toLocaleString()}</span>
        <span>Avg: {validValues.length > 0 ? (validValues.reduce((sum, val) => sum + val, 0) / validValues.length).toLocaleString() : 'N/A'}</span>
      </div>
    </div>
  );
}; 