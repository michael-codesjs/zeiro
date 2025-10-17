"use client";

import { useState } from "react";
import { Button } from "@/components/ui/buttons/button";
import { Popover } from "@/components/ui/popover";
import { cn } from "@/utils/cn";
import { useDataSources } from "@/hooks/use-data-sources";
import { useSelectedDataSourceStore } from "@/hooks/use-selected-data-source-store";
import { getDataSourceImageUrl, getDataSourceImageAlt } from "@/utils/data-source-utils";
import { 
  Data,
  ArrowDown2,
  BoxAdd
} from "iconsax-reactjs";

interface DataSourceSelectorProps {
  variant?: "compact" | "large";
  className?: string;
}

export function DataSourceSelector({ variant = "compact", className }: DataSourceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: dataSources = [], isLoading: isLoadingDataSources } = useDataSources();
  const { selectedDataSource, setSelectedDataSource } = useSelectedDataSourceStore();

  const handleDataSourceSelect = (dataSource: any) => {
    setSelectedDataSource(dataSource);
    setIsOpen(false);
  };

  const getDataSourceIcon = (type: string) => {
    return (
      <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center border border-slate-200">
        <img 
          src={getDataSourceImageUrl(type)} 
          alt={getDataSourceImageAlt(type)}
          className="w-4 h-4 object-contain"
        />
      </div>
    );
  };

  const isCompact = variant === "compact";

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      trigger={
        <Button
          type="button"
          variant="ghost"
          size={isCompact ? "xs" : "sm"}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex-shrink-0 border border-gray-200 rounded-full",
            selectedDataSource 
              ? (isCompact ? "p-2" : "p-3")
              : (isCompact ? "p-2 w-8 h-8" : "p-3 w-10 h-10"),
            "flex items-center justify-center",
            className
          )}
        >
          {selectedDataSource ? (
            <div className="flex items-center space-x-2">
              <BoxAdd size={16} className="text-gray-500" />
              {!isCompact && (
                <span className="text-xs font-medium text-gray-700 truncate max-w-20">
                  {selectedDataSource.name}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <BoxAdd size={16} className="text-gray-500" />
            </div>
          )}
        </Button>
      }
    >
      <div className="w-64 max-h-64 overflow-y-auto">
        <div className="p-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Select Data Source</p>
          {isLoadingDataSources ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-2 p-2">
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex-1 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {dataSources.map((dataSource) => (
                <button
                  key={dataSource.id}
                  onClick={() => handleDataSourceSelect(dataSource)}
                  className={cn(
                    "w-full flex items-center space-x-2 p-2 rounded-md text-left hover:bg-gray-50 transition-colors",
                    selectedDataSource?.id === dataSource.id && "bg-blue-50 text-blue-700"
                  )}
                >
                  {getDataSourceIcon(dataSource.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{dataSource.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{dataSource.type}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Popover>
  );
}
