"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { 
  Data, 
  ArrowDown2, 
  Add,
  TickCircle,
  SearchNormal1,
  Database1,
  CloudConnection
} from "iconsax-reactjs";
import { cn } from "@/utils/cn";
import { type DataSource } from "@/hooks/use-data-sources";

interface DataSourceSelectProps {
  dataSources: DataSource[];
  selectedDataSource: DataSource | null;
  onSelectDataSource: (dataSource: DataSource | null) => void;
  onAddDataSource: () => void;
  className?: string;
}

const getDataSourceIcon = (type: string) => {
  const iconProps = { size: 16, className: "flex-shrink-0" };
  
  switch (type.toLowerCase()) {
    case 'postgresql':
      return <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
        <span className="text-white text-xs font-bold">P</span>
      </div>;
    case 'mongodb':
      return <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
        <span className="text-white text-xs font-bold">M</span>
      </div>;
    case 'mysql':
      return <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center">
        <span className="text-white text-xs font-bold">My</span>
      </div>;
    case 'redis':
      return <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
        <span className="text-white text-xs font-bold">R</span>
      </div>;
    default:
      return <Data {...iconProps} className="text-slate-500" />;
  }
};

const getConnectionStatus = (dataSource: DataSource) => {
  // Mock status logic - replace with actual status checking
  const statuses = ['connected', 'connecting', 'error', 'idle'] as const;
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  const statusConfig = {
    connected: { color: 'bg-green-500', label: 'Connected', pulse: false },
    connecting: { color: 'bg-yellow-500', label: 'Connecting', pulse: true },
    error: { color: 'bg-red-500', label: 'Error', pulse: false },
    idle: { color: 'bg-gray-400', label: 'Idle', pulse: false }
  };
  
  return statusConfig[status] || statusConfig.connected;
};

export default function DataSourceSelect({
  dataSources,
  selectedDataSource,
  onSelectDataSource,
  onAddDataSource,
  className
}: DataSourceSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredDataSources = dataSources.filter(ds =>
    ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ds.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (dataSource: DataSource) => {
    onSelectDataSource(dataSource);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleAddNew = () => {
    onAddDataSource();
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group flex items-center space-x-2.5 px-3 py-2 bg-slate-50/50 hover:bg-slate-100/80 rounded-lg transition-all duration-200 min-w-[240px]",
          "focus:outline-none focus:bg-slate-100",
          isOpen && "bg-slate-100 shadow-sm"
        )}
      >
        {selectedDataSource ? (
          <>
            <div className="relative">
              {getDataSourceIcon(selectedDataSource.type)}
              {(() => {
                const status = getConnectionStatus(selectedDataSource);
                return (
                  <motion.div
                    className={cn("absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full", status.color)}
                    animate={status.pulse ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                );
              })()}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {selectedDataSource.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {selectedDataSource.type}
              </p>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.15 }}
              className="opacity-60 group-hover:opacity-100 transition-opacity"
            >
              <ArrowDown2 size={14} className="text-slate-500" />
            </motion.div>
          </>
        ) : (
          <>
            <div className="w-4 h-4 bg-slate-200/60 rounded-sm flex items-center justify-center">
              <Data size={12} className="text-slate-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-700">Select source</p>
              <p className="text-xs text-slate-500">{dataSources.length} available</p>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.15 }}
              className="opacity-60 group-hover:opacity-100 transition-opacity"
            >
              <ArrowDown2 size={14} className="text-slate-500" />
            </motion.div>
          </>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200/50 z-50 overflow-hidden"
          >
            {/* Search */}
            <div className="p-2">
              <div className="relative">
                <SearchNormal1 
                  size={14} 
                  className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400" 
                />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50/50 border-0 rounded-lg focus:outline-none focus:bg-white/80 transition-colors placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-64 overflow-y-auto">
              {/* Add New Data Source */}
              <motion.button
                onClick={handleAddNew}
                whileHover={{ backgroundColor: "rgb(248 250 252)" }}
                className="w-full flex items-center space-x-2.5 px-3 py-2.5 text-left hover:bg-slate-50/80 transition-colors group"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-md flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Add size={12} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">Add Source</p>
                  <p className="text-xs text-slate-500">Connect new database</p>
                </div>
              </motion.button>

              {/* Data Sources */}
              {filteredDataSources.length > 0 ? (
                filteredDataSources.map((dataSource, index) => {
                  const status = getConnectionStatus(dataSource);
                  const isSelected = selectedDataSource?.id === dataSource.id;
                  
                  return (
                    <motion.button
                      key={dataSource.id}
                      onClick={() => handleSelect(dataSource)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ backgroundColor: "rgb(248 250 252)" }}
                      className={cn(
                        "w-full flex items-center space-x-2.5 px-3 py-2.5 text-left transition-all duration-150 group",
                        "hover:bg-slate-50/80",
                        isSelected && "bg-gray-50/80"
                      )}
                    >
                      <div className="relative">
                        {getDataSourceIcon(dataSource.type)}
                        <motion.div
                          className={cn("absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full", status.color)}
                          animate={status.pulse ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-slate-800">
                            {dataSource.name}
                          </p>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-1.5 h-1.5 bg-gray-600 rounded-full flex-shrink-0"
                            />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {dataSource.type} • {dataSource.metadata?.table_count || 0} tables
                        </p>
                      </div>
                    </motion.button>
                  );
                })
              ) : (
                <div className="px-3 py-6 text-center">
                  <CloudConnection size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500 mb-1">No sources found</p>
                  <p className="text-xs text-slate-400">
                    {searchQuery ? `No results for "${searchQuery}"` : 'Add your first source to start'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
