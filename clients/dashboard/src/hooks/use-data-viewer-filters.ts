import { useState, useEffect } from 'react';
import { type FilterCondition } from './use-manual-query';

export type DataViewerFilter = FilterCondition & { enabled: boolean };

export const useDataViewerFilters = () => {
  const [filters, setFilters] = useState<DataViewerFilter[]>([]);

  // On mount and whenever filters are empty, ensure at least one filter exists
  useEffect(() => {
    if (filters.length === 0) {
      setFilters([{ field: '', operator: 'equals', value: '', enabled: true }]);
    }
  }, [filters]);

  // Add keyboard shortcut for CTRL+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (filters.length > 0) {
          setFilters([]);
        } else {
          addFilter();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filters]);

  // Add a new filter
  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'equals', value: '', enabled: true }]);
  };

  // Remove a filter
  const removeFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters.length === 0 ? [{ field: '', operator: 'equals', value: '', enabled: true }] : newFilters);
  };

  // Update a filter
  const updateFilter = (index: number, updates: Partial<DataViewerFilter>) => {
    setFilters(filters.map((filter, i) => 
      i === index ? { ...filter, ...updates } : filter
    ));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters([]);
  };

  // Get valid filters (enabled and properly configured)
  const getValidFilters = (): FilterCondition[] => {
    return filters.filter(f => {
      if (!f.enabled || !f.field || !f.operator) return false;
      if (["exists", "not_exists"].includes(f.operator)) return true;
      if (["between", "in"].includes(f.operator)) {
        return f.values && f.values.length > 0 && f.values.every(v => v !== "");
      }
      return f.value !== "" && f.value !== null && f.value !== undefined;
    });
  };

  // Set filters directly (useful for bulk updates)
  const replaceFilters = (newFilters: DataViewerFilter[]) => {
    setFilters(newFilters);
  };

  return {
    filters,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    getValidFilters,
    replaceFilters,
  };
};
