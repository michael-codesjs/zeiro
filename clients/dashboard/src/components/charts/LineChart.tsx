import React from 'react';

interface LineChartData {
  x: string | number;
  y: number;
}

interface LineChartProps {
  data: LineChartData[];
  title?: string;
  height?: number;
  color?: string;
  showDots?: boolean;
}

const DEFAULT_COLOR = '#3B82F6'; // blue-500

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  title, 
  height = 300, 
  color = DEFAULT_COLOR,
  showDots = true 
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

  const sortedData = [...data].sort((a, b) => {
    if (typeof a.x === 'string' && typeof b.x === 'string') {
      return a.x.localeCompare(b.x);
    }
    return Number(a.x) - Number(b.x);
  });

  // Filter out undefined/null values and ensure we have valid numbers
  const validYValues = sortedData.map(item => item.y).filter(y => y != null && !isNaN(y));
  const maxY = validYValues.length > 0 ? Math.max(...validYValues) : 0;
  const minY = validYValues.length > 0 ? Math.min(...validYValues) : 0;
  const rangeY = maxY - minY || 1;
  
  // Chart dimensions
  const chartHeight = height - 80;
  const chartWidth = 500;
  const padding = 50;

  // Calculate points for the line
  const points = sortedData.map((item, index) => {
    const x = padding + (index / (sortedData.length - 1 || 1)) * (chartWidth - 2 * padding);
    const y = chartHeight - ((item.y - minY) / rangeY) * (chartHeight - 40) + 20;
    return { x, y, data: item };
  });

  // Create path for the line
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {title && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600 mt-1">
            {sortedData.length} data {sortedData.length === 1 ? 'point' : 'points'}
          </p>
        </div>
      )}
      
      <div className="w-full overflow-x-auto">
        <svg width={chartWidth} height={height} className="min-w-full">
          {/* Y-axis grid lines and labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const value = minY + (rangeY * ratio);
            const y = chartHeight - (ratio * (chartHeight - 40)) + 20;
            
            return (
              <g key={ratio}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth={1}
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-slate-500"
                >
                  {isNaN(value) ? 'N/A' : value.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {points.map((point, index) => {
            // Show every nth label to avoid crowding
            const showLabel = sortedData.length <= 10 || index % Math.ceil(sortedData.length / 8) === 0;
            
            if (!showLabel) return null;

            return (
              <text
                key={index}
                x={point.x}
                y={chartHeight + 35}
                textAnchor="middle"
                className="text-xs fill-slate-600"
              >
                {String(point.data.x).length > 10 
                  ? `${String(point.data.x).substring(0, 10)}...` 
                  : String(point.data.x)
                }
              </text>
            );
          })}

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {showDots && points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={color}
              stroke="white"
              strokeWidth={2}
              className="hover:r-6 transition-all cursor-pointer"
            >
              <title>{`${point.data.x}: ${point.data.y != null ? point.data.y.toLocaleString() : 'N/A'}`}</title>
            </circle>
          ))}

          {/* Gradient fill under line (optional) */}
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <path
            d={`${pathData} L ${points[points.length - 1]?.x || 0} ${chartHeight + 20} L ${points[0]?.x || 0} ${chartHeight + 20} Z`}
            fill={`url(#gradient-${color.replace('#', '')})`}
          />
        </svg>
      </div>

      {/* Statistics */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-4">
        <span>Min: {isNaN(minY) ? 'N/A' : minY.toLocaleString()}</span>
        <span>Max: {isNaN(maxY) ? 'N/A' : maxY.toLocaleString()}</span>
        <span>Avg: {validYValues.length > 0 ? (validYValues.reduce((sum, val) => sum + val, 0) / validYValues.length).toLocaleString() : 'N/A'}</span>
        <span>Range: {isNaN(rangeY) ? 'N/A' : rangeY.toLocaleString()}</span>
      </div>
    </div>
  );
}; 