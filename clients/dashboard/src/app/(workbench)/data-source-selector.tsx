"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { type Database } from "@/hooks/use-data-sources";
import { Input } from "@/components/ui";
import Image from "next/image";

interface DataSourceSelectorProps {
  dataSources: Database[];
  selectedDataSource: Database | null;
  onSelectDataSource: (dataSource: Database | null) => void;
}

export default function DataSourceSelector({ 
  dataSources = [], 
  selectedDataSource, 
  onSelectDataSource 
}: DataSourceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Filter data sources based on search query
  const filteredDataSources = (dataSources || []).filter(dataSource =>
    dataSource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dataSource.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update button position when opening
  const updateButtonPosition = () => {
    if (buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Check if the click is inside the popover (which is rendered in document.body)
        const popoverElement = document.querySelector('[data-popover-content]');
        if (popoverElement && popoverElement.contains(event.target as Node)) {
          return; // Don't close if clicking inside popover
        }
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDataSourceIcon = (type: Database['type']) => {
    const getImagePath = (dbType: string) => {
      switch (dbType.toLowerCase()) {
        case 'dynamodb':
          return '/images/data-sources/dynamodb.png';
        case 'postgresql':
          return '/images/data-sources/postgres.png';
        case 'mysql':
          return '/images/data-sources/mysql.png';
        case 'mongodb':
          return '/images/data-sources/mongo.png';
        default:
          return null;
      }
    };

    const imagePath = getImagePath(type);
    
    if (imagePath) {
      return (
        <div className="w-6 h-6 flex items-center justify-center">
          <Image
            src={imagePath}
            alt={`${type} logo`}
            width={24}
            height={24}
            className="w-6 h-6 object-contain"
          />
        </div>
      );
    }

    // Fallback for unknown types
    return (
      <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center">
        <div className="w-3 h-3 bg-slate-500 rounded-sm"></div>
      </div>
    );
  };


  const handleSelectDataSource = (dataSource: Database) => {
    onSelectDataSource(dataSource);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClearSelection = () => {
    onSelectDataSource(null);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(!isOpen);
          updateButtonPosition();
        }}
        className="inline-flex items-center justify-between min-w-52 px-4 py-3 bg-white rounded-lg text-sm font-medium text-slate-700 focus:outline-none transition-colors border border-slate-300"
      >
        <div className="flex items-center space-x-3">
          {selectedDataSource ? (
            <>
              {getDataSourceIcon(selectedDataSource.type)}
              <div className="flex flex-col items-start">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-900 font-medium">{selectedDataSource.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <span>{selectedDataSource.type}</span>
                  <span>•</span>
                  <span>{(selectedDataSource.connection_config?.item_count || selectedDataSource.metadata?.item_count || 0).toLocaleString()} items</span>
                  {selectedDataSource.connection_config?.region && (
                    <>
                      <span>•</span>
                      <span>{selectedDataSource.connection_config.region}</span>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <span className="text-slate-500">Select a data source here</span>
          )}
        </div>
        
        <svg 
          className={`w-4 h-4 text-slate-400 ml-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popover */}
      {isOpen && buttonRect && createPortal(
        <div 
          className="bg-white rounded-lg shadow-xl border border-slate-200 z-[9999] w-96 max-h-80 overflow-hidden"
          style={{
            position: 'fixed',
            top: `${buttonRect.bottom + 8}px`,
            left: `${buttonRect.left}px`,
            width: `${Math.max(buttonRect.width, 384)}px`, // Ensure minimum width
          }}
          data-popover-content
        >
          {/* Search Input */}
          <div className="p-3 border-b border-slate-100">
            <Input
              type="search"
              placeholder="Search data sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {dataSources.length > 0 ? (
              <>
                {filteredDataSources.length > 0 ? (
                  <div className="p-2">
                    {filteredDataSources.map((dataSource) => (
                      <button
                        key={dataSource.id}
                        onClick={() => handleSelectDataSource(dataSource)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left hover:bg-slate-50 transition-colors ${
                          selectedDataSource?.id === dataSource.id ? 'bg-indigo-50 boarder border-indigo-200' : ''
                        }`}
                      >
                        {getDataSourceIcon(dataSource.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {dataSource.name}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-slate-500">{dataSource.type}</p>
                            <span className="text-xs text-slate-400">•</span>
                            <p className="text-xs text-slate-500">{(dataSource.connection_config?.item_count || dataSource.metadata?.item_count || 0).toLocaleString()} items</p>
                            {dataSource.connection_config?.region && (
                              <>
                                <span className="text-xs text-slate-400">•</span>
                                <p className="text-xs text-slate-500">{dataSource.connection_config.region}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                    
                    {selectedDataSource && (
                      <>
                        <div className="border-t border-slate-100 my-2"></div>
                        <button
                          onClick={handleClearSelection}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center">
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <span className="text-sm text-slate-500">Clear Selection</span>
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">No data sources found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500 mb-1">No data sources available</p>
                <p className="text-xs text-slate-400">Add a data source to get started</p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
} 