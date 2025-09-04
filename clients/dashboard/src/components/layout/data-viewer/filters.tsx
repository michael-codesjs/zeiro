"use client";

import React from 'react';
import { Button, Input, Select, type SelectOption } from "../../ui";

// Simple filter interface with nested field support
export interface Filter {
  key: string; // This will be the full path like 'data.error'
  parentField?: string; // The parent field like 'data'
  childField?: string; // The child field like 'error'
  value: any;
  operator: string;
  enabled: boolean; // Whether this filter is enabled
}

export interface FieldOption {
  value: string;
  label: string;
  description?: string;
}

export interface HierarchicalField {
  parent: string;
  children: string[];
}

export interface FiltersProps {
  filters: Filter[];
  hierarchicalFields: Map<string, string[]>; // Map of parent field to child fields
  onFiltersChange: (filters: Filter[]) => void;
  onApplyFilters?: () => void;
  onClearFilters?: () => void;
  loading?: boolean;
}

// Default operators
const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Not Contains" },
  { value: "begins_with", label: "Begins With" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
  { value: "greater_equal", label: "Greater Equal" },
  { value: "less_equal", label: "Less Equal" },
  { value: "between", label: "Between" },
  { value: "in", label: "In" },
  { value: "exists", label: "Exists" },
  { value: "not_exists", label: "Not Exists" },
];

export default function Filters({
  filters,
  hierarchicalFields,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  loading = false,
}: FiltersProps) {
  
  // Create parent field options
  const parentFieldOptions: SelectOption[] = [
    { value: "", label: "Field" },
    ...Array.from(hierarchicalFields.keys()).map(parent => ({
      value: parent,
      label: parent,
    })),
  ];

  // Get child field options for a given parent
  const getChildFieldOptions = (parentField: string): SelectOption[] => {
    const children = hierarchicalFields.get(parentField) || [];
    if (children.length === 0) {
      return []; // No children, this is a simple field
    }
    return [
      { value: "", label: "Property" },
      ...children.map(child => ({
        value: child,
        label: child,
      })),
    ];
  };

  const operatorOptions: SelectOption[] = [
    { value: "", label: "Operator" },
    ...OPERATORS,
  ];

  // Add a new filter
  const addFilter = () => {
    const newFilter: Filter = { 
      key: '', 
      parentField: '',
      childField: '',
      value: '', 
      operator: 'equals',
      enabled: true
    };
    onFiltersChange([...filters, newFilter]);
  };

  // Remove a filter
  const removeFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    onFiltersChange(newFilters);
  };

  // Update a filter
  const updateFilter = (index: number, updates: Partial<Filter>) => {
    const newFilters = filters.map((filter, i) => {
      if (i === index) {
        const updatedFilter = { ...filter, ...updates };
        
        // If parent field changed, reset child field and update key
        if (updates.parentField !== undefined) {
          const children = hierarchicalFields.get(updates.parentField) || [];
          if (children.length === 0) {
            // Simple field, no children
            updatedFilter.key = updates.parentField;
            updatedFilter.childField = '';
          } else {
            // Has children, reset child field
            updatedFilter.childField = '';
            updatedFilter.key = updates.parentField; // Will be updated when child is selected
          }
        }
        
        // If child field changed, update the full key
        if (updates.childField !== undefined && updatedFilter.parentField) {
          if (updates.childField) {
            updatedFilter.key = `${updatedFilter.parentField}.${updates.childField}`;
          } else {
            updatedFilter.key = updatedFilter.parentField;
          }
        }
        
        return updatedFilter;
      }
      return filter;
    });
    onFiltersChange(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    onFiltersChange([]);
    onClearFilters?.();
  };

  // Ensure at least one filter exists
  React.useEffect(() => {
    if (filters.length === 0) {
      addFilter();
    }
  }, [filters.length]);

  // Check if operator needs multiple values
  const needsMultipleValues = (operator: string) => {
    return ["between", "in"].includes(operator);
  };

  // Check if operator needs no value
  const needsNoValue = (operator: string) => {
    return ["exists", "not_exists"].includes(operator);
  };

  return (
    <div className="w-full space-y-1">
      {/* Filter Rows */}
      {filters.map((filter, index) => {
        const hasChildren = hierarchicalFields.get(filter.parentField || '')?.length > 0;
        const childOptions = filter.parentField ? getChildFieldOptions(filter.parentField) : [];
        
        return (
          <div key={index} className="w-full flex items-center space-x-2 overflow-visible">
            {/* Enable/Disable Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={filter.enabled}
                onChange={(e) => updateFilter(index, { enabled: e.target.checked })}
                disabled={loading}
                className="h-4 w-4 text-blue-600 bg-white border-slate-300 rounded focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Enable/disable this filter"
              />
            </div>

            {/* Parent Field Selection */}
            <div className="min-w-[100px] max-w-[120px]">
              <Select
                options={parentFieldOptions}
                value={filter.parentField || ''}
                onValueChange={(value) => updateFilter(index, { parentField: value })}
                placeholder="Field"
                disabled={loading}
                size="xs"
                noFocusStyles={true}
                className="text-xs h-6"
              />
            </div>

            {/* Child Field Selection (only show if parent has children) */}
            {hasChildren && (
              <div className="min-w-[100px] max-w-[120px]">
                <Select
                  options={childOptions}
                  value={filter.childField || ''}
                  onValueChange={(value) => updateFilter(index, { childField: value })}
                  placeholder="Property"
                  disabled={loading || !filter.parentField}
                  size="xs"
                  noFocusStyles={true}
                  className="text-xs h-6"
                />
              </div>
            )}

          {/* Operator Selection */}
          <div className="min-w-[100px] max-w-[120px]">
            <Select
              options={operatorOptions}
              value={filter.operator}
              onValueChange={(value) => updateFilter(index, { operator: value })}
              placeholder="Operator"
              disabled={loading}
              size="xs"
              noFocusStyles={true}
              className="text-xs h-6"
            />
          </div>

          {/* Value Input */}
          {!needsNoValue(filter.operator) && (
            <div className="flex-1 min-w-[100px]">
              <Input
                type="text"
                value={needsMultipleValues(filter.operator) 
                  ? (Array.isArray(filter.value) ? filter.value.join(", ") : filter.value || "")
                  : (filter.value || "")
                }
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const newValue = needsMultipleValues(filter.operator)
                    ? inputValue.split(", ").map(v => v.trim()).filter(v => v !== "")
                    : inputValue;
                  updateFilter(index, { value: newValue });
                }}
                placeholder={
                  needsMultipleValues(filter.operator)
                    ? (filter.operator === "between" ? "value1, value2" : "value1, value2, value3")
                    : "Value"
                }
                size="xs"
                disabled={loading}
                className="focus:!outline-none focus:!ring-0 focus:!border-slate-300"
              />
            </div>
          )}

          {/* Remove Filter Button */}
          <button
            onClick={() => removeFilter(index)}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove filter"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          </div>
        );
      })}

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 mt-2">
        <Button
          variant="secondary"
          size="xs"
          onClick={addFilter}
          disabled={loading}
        >
          Add Filter
        </Button>
        
        <Button
          variant="ghost"
          size="xs"
          onClick={handleClearFilters}
          disabled={loading}
        >
          Clear
        </Button>
        
        {onApplyFilters && (
          <Button
            variant="primary"
            size="xs"
            onClick={onApplyFilters}
            disabled={loading}
          >
            Apply All
          </Button>
        )}
      </div>
    </div>
  );
}

// Utility function to get valid filters (filters that have key, operator, and value when needed)
export const getValidFilters = (filters: Filter[]): Filter[] => {
  return filters.filter(filter => {
    // Must be enabled
    if (!filter.enabled) return false;
    
    // Must have a parent field and operator
    if (!filter.parentField || !filter.operator) return false;
    
    // Must have a valid key (either simple field or parent.child)
    if (!filter.key) return false;
    
    // Operators that don't need values
    if (["exists", "not_exists"].includes(filter.operator)) return true;
    
    // Operators that need multiple values
    if (["between", "in"].includes(filter.operator)) {
      return Array.isArray(filter.value) && filter.value.length > 0 && filter.value.every(v => v !== "");
    }
    
    // Regular operators need a single value
    return filter.value !== "" && filter.value !== null && filter.value !== undefined;
  });
};