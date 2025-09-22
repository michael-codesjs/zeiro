"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { 
  ArrowDown2, 
  Add,
  SearchNormal1,
  Data
} from "iconsax-reactjs";
import { cn } from "@/utils/cn";
import { type DataSource } from "@/hooks/use-data-sources";

interface CompactDataSourceSelectProps {
  dataSources: DataSource[];
  selectedDataSource: DataSource | null;
  onSelectDataSource: (dataSource: DataSource | null) => void;
  className?: string;
}

const getDataSourceIcon = (type: string) => {
  const iconProps = { size: 12, className: "flex-shrink-0" };
  
  switch (type.toLowerCase()) {
    case 'postgresql':
      return <div className="w-3 h-3 bg-blue-500 rounded-sm flex items-center justify-center">
        <span className="text-white text-[8px] font-bold leading-none">P</span>
      </div>;
    case 'mongodb':
      return <div className="w-3 h-3 bg-green-500 rounded-sm flex items-center justify-center">
        <span className="text-white text-[8px] font-bold leading-none">M</span>
      </div>;
    case 'mysql':
      return <div className="w-3 h-3 bg-orange-500 rounded-sm flex items-center justify-center">
        <span className="text-white text-[8px] font-bold leading-none">My</span>
      </div>;
    case 'redis':
      return <div className="w-3 h-3 bg-red-500 rounded-sm flex items-center justify-center">
        <span className="text-white text-[8px] font-bold leading-none">R</span>
      </div>;
    default:
      return <Data {...iconProps} className="text-slate-500" />;
  }
};

const getConnectionStatus = (dataSource: DataSource) => {
  // Mock status logic - replace with actual status checking
  const statuses = ['connected', 'connecting', 'error'] as const;
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  const statusConfig = {
    connected: { color: 'bg-green-500', pulse: false },
    connecting: { color: 'bg-yellow-500', pulse: true },
    error: { color: 'bg-red-500', pulse: false }
  };
  
  return statusConfig[status] || statusConfig.connected;
};

export default function CompactDataSourceSelect({
  dataSources,
  selectedDataSource,
  onSelectDataSource,
  className
}: CompactDataSourceSelectProps) {
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

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Compact Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ backgroundColor: "rgb(241 245 249)" }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group flex items-center space-x-2 px-3 py-1.5 bg-slate-50/50 hover:bg-slate-100/80 rounded-lg transition-all duration-150 min-w-[180px]",
          "focus:outline-none focus:bg-slate-100",
          isOpen && "bg-slate-100"
        )}
      >
        {selectedDataSource ? (
          <>
            <div className="relative flex-shrink-0">
              {getDataSourceIcon(selectedDataSource.type)}
              {(() => {
                const status = getConnectionStatus(selectedDataSource);
                return (
                  <motion.div
                    className={cn("absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full", status.color)}
                    animate={status.pulse ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                );
              })()}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {selectedDataSource.name}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-3 h-3 bg-slate-200/60 rounded-sm flex items-center justify-center flex-shrink-0">
              <Data size={8} className="text-slate-400" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm text-slate-600">Select source</p>
            </div>
          </>
        )}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0"
        >
          <ArrowDown2 size={12} className="text-slate-500" />
        </motion.div>
      </motion.button>

      {/* Compact Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-xl rounded-lg shadow-xl border border-slate-200/50 z-50 overflow-hidden"
          >
            {/* Compact Search */}
            <div className="p-2">
              <div className="relative">
                <SearchNormal1 
                  size={12} 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" 
                />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-6 pr-2 py-1 text-xs bg-slate-50/50 border-0 rounded-md focus:outline-none focus:bg-white/80 transition-colors placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Compact Options */}
            <div className="max-h-48 overflow-y-auto">
              {filteredDataSources.length > 0 ? (
                filteredDataSources.map((dataSource, index) => {
                  const status = getConnectionStatus(dataSource);
                  const isSelected = selectedDataSource?.id === dataSource.id;
                  
                  return (
                    <motion.button
                      key={dataSource.id}
                      onClick={() => handleSelect(dataSource)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ backgroundColor: "rgb(248 250 252)" }}
                      className={cn(
                        "w-full flex items-center space-x-2 px-3 py-2 text-left transition-all duration-100 group",
                        "hover:bg-slate-50/80",
                        isSelected && "bg-gray-50/80"
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        {getDataSourceIcon(dataSource.type)}
                        <motion.div
                          className={cn("absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full", status.color)}
                          animate={status.pulse ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900 truncate group-hover:text-slate-800">
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
                      </div>
                    </motion.button>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-slate-500">
                    {searchQuery ? `No results for "${searchQuery}"` : 'No sources found'}
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
