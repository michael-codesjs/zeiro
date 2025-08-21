"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMoreVertical, FiEdit, FiTrash2, FiRefreshCw, FiExternalLink, FiDatabase, FiEye } from 'react-icons/fi';
import { Button, useDisclosure } from '@/components/ui';
import { useDeleteDatabase, useTestDatabaseConnection } from '@/hooks/use-data-sources';
import type { Database } from '@/hooks/use-data-sources';
import EditDataSourceModal from './edit-data-source-modal';

interface DataSourceCardProps {
  dataSource: Database;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onSelect?: () => void;
}

const DATABASE_ICONS: Record<string, string> = {
  PostgreSQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
  MySQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
  MongoDB: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
  Redis: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
  Elasticsearch: 'https://static-www.elastic.co/v3/assets/bltefdd0b53724fa2ce/blt6ae3d6980b5fd629/5bbca1d1af3a954c36f95ed3/logo-elastic-elasticsearch-lt.svg'
};

const getDatabaseIcon = (type: string, name: string) => {
  // For DynamoDB, use the actual DynamoDB logo
  if (type === 'DynamoDB') {
    return (
      <div className="w-14 h-14 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center p-2 shadow-sm">
        <svg viewBox="0 0 256 289" className="w-10 h-10">
          <defs>
            <linearGradient x1="0%" y1="100%" x2="100%" y2="0%" id="Gradient-0">
              <stop stopColor="#2E27AD" offset="0%"></stop>
              <stop stopColor="#527FFF" offset="100%"></stop>
            </linearGradient>
            <linearGradient x1="0%" y1="100%" x2="100%" y2="0%" id="Gradient-1">
              <stop stopColor="#F58536" offset="0%"></stop>
              <stop stopColor="#F58536" offset="100%"></stop>
            </linearGradient>
          </defs>
          <path fill="url(#Gradient-0)" d="M165,0 L256,50 L256,100 L165,150 L74,100 L74,50 L165,0 Z"></path>
          <path fill="url(#Gradient-1)" d="M165,72 L256,122 L256,172 L165,222 L74,172 L74,122 L165,72 Z"></path>
          <path fill="url(#Gradient-0)" d="M165,144 L256,194 L256,244 L165,294 L74,244 L74,194 L165,144 Z"></path>
        </svg>
      </div>
    );
  }

  // For other database types with external icons, use the image
  if (DATABASE_ICONS[type]) {
    return (
      <div className="w-14 h-14 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
        <img 
          src={DATABASE_ICONS[type]} 
          alt={type}
          className="w-9 h-9 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <FiDatabase className="w-8 h-8 text-slate-500 hidden" />
      </div>
    );
  }

  // For other database types, generate initials with colors
  const initials = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  const getColorClass = (type: string) => {
    switch (type) {
      case 'PostgreSQL':
        return 'from-blue-50 to-blue-100 text-blue-600';
      case 'MySQL':
        return 'from-green-50 to-green-100 text-green-600';
      case 'MongoDB':
        return 'from-green-50 to-green-100 text-green-600';
      case 'Redis':
        return 'from-red-50 to-red-100 text-red-600';
      case 'Cassandra':
        return 'from-purple-50 to-purple-100 text-purple-600';
      case 'InfluxDB':
        return 'from-indigo-50 to-indigo-100 text-indigo-600';
      case 'Elasticsearch':
        return 'from-yellow-50 to-yellow-100 text-yellow-600';
      default:
        return 'from-gray-50 to-gray-100 text-gray-600';
    }
  };

  return (
    <div className={`w-14 h-14 bg-gradient-to-br ${getColorClass(type)} rounded-xl flex items-center justify-center shadow-sm`}>
      <span className="text-lg font-bold">{initials}</span>
    </div>
  );
};

export default function DataSourceCard({ dataSource, isSelected = false, isSelectionMode = false, onSelect }: DataSourceCardProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const deleteDatabase = useDeleteDatabase();
  const { mutate: testConnection, isPending: isTesting } = useTestDatabaseConnection();

  const handleDelete = () => {
    deleteDatabase.mutate(dataSource.id);
    onDeleteClose();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or in selection mode
    if (isSelectionMode || e.target !== e.currentTarget && !(e.target as Element).closest('.card-content')) {
      return;
    }
    router.push(`/data-sources/${dataSource.id}`);
  };

  const getRegionInfo = () => {
    switch (dataSource.type) {
      case 'DynamoDB':
        return dataSource.connection_config.region || 'us-east-1';
      case 'PostgreSQL':
      case 'MySQL':
        return dataSource.connection_config.host ? dataSource.connection_config.host.split('.')[0] : 'Unknown';
      case 'MongoDB':
        return dataSource.connection_config.region || 'Global';
      default:
        return 'N/A';
    }
  };

  return (
    <>
      <div className={`group relative bg-white rounded-xl shadow-md transition-all duration-300 cursor-pointer ${
        isSelected ? 'ring-2 ring-indigo-500 shadow-lg' : ''
      }`}
      onClick={isSelectionMode ? onSelect : handleCardClick}>
        
        <div className="p-6">
          <div className="flex items-start justify-between">
            {/* Database Icon & Info */}
            <div className="flex items-start space-x-4 flex-1 card-content">
              {getDatabaseIcon(dataSource.type, dataSource.name)}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-slate-900 truncate">
                  {dataSource.name}
                </h3>
                
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-slate-600 font-medium">
                    {dataSource.type}
                  </span>
                  <span className="text-sm text-slate-400">•</span>
                  <span className="text-sm text-slate-600">
                    {getRegionInfo()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiMoreVertical className="w-4 h-4" />
              </Button>
            
              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 overflow-hidden">
                    <button 
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 transition-colors"
                      onClick={() => {
                        setShowDropdown(false);
                        router.push(`/data-sources/${dataSource.id}`);
                      }}
                    >
                      <FiEye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    <button 
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 transition-colors"
                      onClick={() => {
                        setShowDropdown(false);
                        // Navigate to workbench with this data source selected
                        window.location.href = `/?datasource=${dataSource.id}`;
                      }}
                    >
                      <FiExternalLink className="w-4 h-4" />
                      <span>Open in Workbench</span>
                    </button>
                    <button 
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                      onClick={() => {
                        setShowDropdown(false);
                        onDeleteOpen();
                      }}
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onDeleteClose} />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Delete Data Source</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete "<span className="font-medium">{dataSource.name}</span>"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="ghost" onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDelete}
                disabled={deleteDatabase.isPending}
              >
                {deleteDatabase.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditDataSourceModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        dataSource={dataSource}
      />
    </>
  );
} 