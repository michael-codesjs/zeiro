"use client";

import { useState, useRef, useEffect } from "react";

interface Database {
  id: string;
  name: string;
  type: 'DynamoDB' | 'PostgreSQL' | 'MySQL' | 'MongoDB';
  status: 'connected' | 'disconnected' | 'error';
  lastAccessed: string;
  tableCount: number;
  region?: string;
  accountId?: string;
}

interface DatabaseSelectorProps {
  databases: Database[];
  selectedDatabase: Database | null;
  onSelectDatabase: (database: Database | null) => void;
}

export default function DatabaseSelector({ 
  databases, 
  selectedDatabase, 
  onSelectDatabase 
}: DatabaseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter databases based on search query
  const filteredDatabases = databases.filter(database =>
    database.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    database.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDatabaseIcon = (type: Database['type']) => {
    switch (type) {
      case 'DynamoDB':
        return (
          <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
            <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
          </div>
        );
      case 'PostgreSQL':
        return (
          <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
          </div>
        );
      case 'MySQL':
        return (
          <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
            <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div>
          </div>
        );
      case 'MongoDB':
        return (
          <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center">
            <div className="w-3 h-3 bg-slate-500 rounded-sm"></div>
          </div>
        );
    }
  };

  const getStatusDot = (status: Database['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between min-w-52 px-4 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 focus:outline-none transition-colors"
      >
        <div className="flex items-center space-x-3">
          {selectedDatabase ? (
            <>
              {getDatabaseIcon(selectedDatabase.type)}
              <div className="flex items-center space-x-2">
                <span className="text-slate-900">{selectedDatabase.name}</span>
                <div className={`w-2 h-2 rounded-full ${getStatusDot(selectedDatabase.status)}`}></div>
              </div>
            </>
          ) : (
            <>
              <span className="text-slate-500">No Database Selected</span>
            </>
          )}
        </div>
        
        <svg 
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          <div className="p-3">
            {/* Search Input */}
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search databases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {databases.length > 0 ? (
              <>
                {filteredDatabases.length > 0 ? (
                  <>
                    {filteredDatabases.map((database) => (
                  <button
                    key={database.id}
                                          onClick={() => {
                        onSelectDatabase(database);
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left hover:bg-slate-50 transition-colors ${
                      selectedDatabase?.id === database.id ? 'bg-indigo-50 border border-indigo-200' : ''
                    }`}
                  >
                    {getDatabaseIcon(database.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {database.name}
                        </p>
                        <div className={`w-2 h-2 rounded-full ${getStatusDot(database.status)}`}></div>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-slate-500">{database.type}</p>
                        <span className="text-xs text-slate-400">•</span>
                        <p className="text-xs text-slate-500">{database.tableCount} tables</p>
                        {database.region && (
                          <>
                            <span className="text-xs text-slate-400">•</span>
                            <p className="text-xs text-slate-500">{database.region}</p>
                          </>
                        )}
                      </div>
                    </div>
                                        </button>
                    ))}
                    
                    {selectedDatabase && (
                      <>
                        <div className="border-t border-slate-100 my-2"></div>
                        <button
                          onClick={() => {
                            onSelectDatabase(null);
                            setIsOpen(false);
                            setSearchQuery("");
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-slate-50 transition-colors"
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
                  </>
                ) : (
                  <div className="px-3 py-6 text-center">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">No databases found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search</p>
                  </div>
                )}
              </>
            ) : (
              <div className="px-3 py-6 text-center">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500 mb-1">No databases available</p>
                <p className="text-xs text-slate-400">Add a database to get started</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 