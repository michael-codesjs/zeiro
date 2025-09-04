import React, { useState, useMemo } from 'react';

interface ColumnInfo {
  key: string;
  type: string;
  isKey?: boolean;
}

interface TableProps {
  data: any[];
  title?: string;
  showSelection?: boolean;
  showTypeIcons?: boolean;
  maxRows?: number;
  maxHeight?: string;
  onRowSelect?: (selectedRows: Set<number>) => void;
  metadata?: {
    count?: number;
    scannedCount?: number;
    operation?: string;
    timeTaken?: number;
    lastEvaluatedKey?: any;
  };
}

export const Table: React.FC<TableProps> = ({
  data,
  title,
  showSelection = false,
  showTypeIcons = true,
  maxRows = 50,
  maxHeight = "600px",
  onRowSelect,
  metadata
}) => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Helper function to infer data type
  const inferType = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'unknown';
  };

  // Helper function to detect if a column is a key (partition key or GSI key)
  const isKeyColumn = (columnName: string): boolean => {
    const keyPatterns = [
      /^PK$/i,           // Partition Key
      /^SK$/i,           // Sort Key
      /^GSI\d*PK$/i,     // GSI Partition Key (GSI1PK, GSI2PK, etc.)
      /^GSI\d*SK$/i,     // GSI Sort Key (GSI1SK, GSI2SK, etc.)
      /^id$/i,           // Common ID field
      /.*[Ii]d$/,        // Fields ending with 'id' or 'Id'
      /.*[Kk]ey$/        // Fields ending with 'key' or 'Key'
    ];
    
    return keyPatterns.some(pattern => pattern.test(columnName));
  };

  // Helper function to determine the display order of key columns
  const getKeyOrder = (columnName: string): number => {
    if (/^PK$/i.test(columnName)) return 1;        // Primary partition key first
    if (/^SK$/i.test(columnName)) return 2;        // Primary sort key second
    if (/^GSI1PK$/i.test(columnName)) return 3;    // GSI1 partition key
    if (/^GSI1SK$/i.test(columnName)) return 4;    // GSI1 sort key
    if (/^GSI2PK$/i.test(columnName)) return 5;    // GSI2 partition key
    if (/^GSI2SK$/i.test(columnName)) return 6;    // GSI2 sort key
    if (/^GSI\d+PK$/i.test(columnName)) return 7;  // Other GSI partition keys
    if (/^GSI\d+SK$/i.test(columnName)) return 8;  // Other GSI sort keys
    if (/^id$/i.test(columnName)) return 9;        // ID fields
    if (/.*[Ii]d$/.test(columnName)) return 10;    // Other ID fields
    if (/.*[Kk]ey$/.test(columnName)) return 11;   // Other key fields
    return 12; // Fallback for other keys
  };



  // Extract column information from the data
  const columns = useMemo((): ColumnInfo[] => {
    if (!data?.length) return [];
    
    const allKeys = new Set<string>();
    
    // Get only top-level keys from all items (no nested flattening)
    data.forEach(item => {
      if (item && typeof item === 'object') {
        Object.keys(item).forEach(key => {
          allKeys.add(key);
        });
      }
    });

    // Convert to array and sort by key importance
    const columnArray = Array.from(allKeys).map(key => ({
      key,
      type: inferType(data[0]?.[key]),
      isKey: isKeyColumn(key)
    }));

    // Sort columns: keys first, then regular columns
    return columnArray.sort((a, b) => {
      // Primary keys and GSI keys come first
      if (a.isKey && !b.isKey) return -1;
      if (!a.isKey && b.isKey) return 1;
      
      // Within keys, sort by specific key hierarchy
      if (a.isKey && b.isKey) {
        const aOrder = getKeyOrder(a.key);
        const bOrder = getKeyOrder(b.key);
        if (aOrder !== bOrder) return aOrder - bOrder;
      }
      
      // For non-keys, alphabetical order
      return a.key.localeCompare(b.key);
    });
  }, [data]);

  // Helper function to format field names for display
  const formatFieldName = (fieldName: string): string => {
    // For nested JSON fields like 'data.error', show only the last part 'error'
    const parts = fieldName.split('.');
    return parts[parts.length - 1];
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '∅';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (Array.isArray(value)) return `[${value.length} items]`;
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'string':
        return <span className="text-blue-600">Aa</span>;
      case 'number':
        return <span className="text-green-600">123</span>;
      case 'boolean':
        return <span className="text-purple-600">⊤⊥</span>;
      case 'array':
        return <span className="text-orange-600">[]</span>;
      case 'object':
        return <span className="text-red-600">{}</span>;
      default:
        return <span className="text-slate-400">?</span>;
    }
  };

  const formatDisplayValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') {
      return value.length > 50 ? `${value.substring(0, 50)}...` : value;
    }
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (Array.isArray(value)) return `Array (${value.length} items)`;
    if (typeof value === 'object') return 'Object';
    return String(value);
  };

  const getRecordIcon = (item: any, columns: ColumnInfo[]): string => {
    // Try to find a name field for initials
    const nameFields = ['name', 'title', 'label', 'firstName', 'username', 'email'];
    for (const field of nameFields) {
      const value = item[field];
      if (typeof value === 'string' && value.length > 0) {
        const words = value.split(' ');
        if (words.length >= 2) {
          return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        return value.substring(0, 2).toUpperCase();
      }
    }
    
    // Fallback to first column initial or generic icon
    const firstCol = columns[0];
    if (firstCol && item[firstCol.key]) {
      const value = String(item[firstCol.key]);
      return value.substring(0, 2).toUpperCase();
    }
    
    return '📊';
  };

  const handleRowSelect = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
    onRowSelect?.(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
      onRowSelect?.(new Set());
    } else {
      const newSelected = new Set(data.map((_, i) => i));
      setSelectedRows(newSelected);
      onRowSelect?.(newSelected);
    }
  };

  // Check scroll position to show/hide fade effects
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Set up scroll listener
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);
    
    // Check on resize as well
    const resizeObserver = new ResizeObserver(checkScrollPosition);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      resizeObserver.disconnect();
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 text-slate-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-slate-900">No data</h3>
          <p className="text-sm text-slate-500">Get started by adjusting your filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="bg-white rounded-lg border border-slate-200 h-[600px] flex flex-col relative">
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-auto scrollbar-custom"
        >
          <table className="w-full min-w-max">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr>
                {/* Select All Checkbox */}
                <th className="px-6 py-3 text-left border-b border-slate-200">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </th>

                {/* Column Headers */}
                {columns.map((column) => (
                  <th key={column.key} className="px-6 py-3 text-left border-b border-slate-200 min-w-[150px]">
                    <div className="text-xs font-semibold text-slate-700 text-left">
                      <span title={column.key !== formatFieldName(column.key) ? column.key : undefined}>
                        {formatFieldName(column.key)}
                      </span>
                      {column.isKey && (
                        <span className="ml-1 inline-flex items-center rounded bg-slate-100 px-1 py-0.5 text-xs font-medium text-slate-800">
                          PK
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    selectedRows.has(index) ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(index)}
                      onChange={() => handleRowSelect(index)}
                      className="h-4 w-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </td>

                  {/* Data Columns */}
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 min-w-[150px]">
                      <div className="text-xs text-slate-900">
                        {formatValue(item[column.key]) === '∅' ? (
                          <span className="text-slate-400 italic">null</span>
                        ) : (
                          <div className="truncate" title={formatValue(item[column.key])}>
                            {formatDisplayValue(item[column.key])}
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Left scroll fade */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-20" />
        )}
        
        {/* Right scroll fade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-20" />
        )}
      </div>
      
      {/* Sticky Info Bar - Only show for manual queries with metadata */}
      {metadata && (
        <div className="sticky bottom-2 left-0 w-fit min-w-[220px] max-w-[90%] mx-auto bg-slate-100 text-slate-700 text-xs rounded shadow px-4 py-2 flex items-center gap-4 z-20 border border-slate-200">
          <span>{metadata.count || data.length} items found{metadata.scannedCount && metadata.scannedCount !== (metadata.count || data.length) ? ` (${metadata.scannedCount} scanned)` : ''}</span>
          {metadata.operation && (
            <span className="text-slate-500">• {metadata.operation} operation</span>
          )}
          {metadata.timeTaken && (
            <span className="text-slate-400">• {metadata.timeTaken} ms</span>
          )}
        </div>
      )}
    </div>
  );
}; 