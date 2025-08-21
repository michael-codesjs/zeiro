import React from 'react';
import { type QueryResult } from '../../../../hooks/use-natural-language-query';

interface QueryResultDisplayProps {
  result: QueryResult;
}

export const QueryResultDisplay: React.FC<QueryResultDisplayProps> = ({ result }) => {
  return (
    <div className="mt-4 space-y-4">
      {/* Query Performance */}
      {result.metadata.performance && (
        <div className={`p-3 rounded-lg border ${
          result.metadata.performance.efficient 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              result.metadata.performance.efficient ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm font-medium text-slate-700">Performance</span>
          </div>
          <p className="text-sm text-slate-600">{result.metadata.performance.message}</p>
        </div>
      )}

      {/* Results Summary */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-indigo-700">Results</span>
          <span className="text-xs bg-indigo-200 text-indigo-700 px-2 py-1 rounded">
            {result.metadata.count || 0} items found
          </span>
        </div>
        {result.metadata.confidence && (
          <div className="text-xs text-indigo-600">
            Confidence: {Math.round(result.metadata.confidence * 100)}%
          </div>
        )}
      </div>
    </div>
  );
}; 