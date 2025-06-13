"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";

interface AddDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DatabaseType = 'DynamoDB' | 'PostgreSQL' | 'MySQL' | 'MongoDB';

interface DatabaseOption {
  type: DatabaseType;
  name: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

export default function AddDatabaseModal({ isOpen, onClose }: AddDatabaseModalProps) {
  const [selectedType, setSelectedType] = useState<DatabaseType | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Close modal on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const databaseOptions: DatabaseOption[] = [
    {
      type: 'DynamoDB',
      name: 'Amazon DynamoDB',
      description: 'Fast, flexible NoSQL database service for any scale',
      icon: (
        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
          <div className="w-6 h-6 bg-orange-500 rounded"></div>
        </div>
      ),
    },
    {
      type: 'PostgreSQL',
      name: 'PostgreSQL',
      description: 'Advanced open source relational database',
      icon: (
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <div className="w-6 h-6 bg-blue-500 rounded"></div>
        </div>
      ),
      comingSoon: true,
    },
    {
      type: 'MySQL',
      name: 'MySQL',
      description: 'Popular open source relational database',
      icon: (
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
          <div className="w-6 h-6 bg-indigo-500 rounded"></div>
        </div>
      ),
      comingSoon: true,
    },
    {
      type: 'MongoDB',
      name: 'MongoDB',
      description: 'Document-based NoSQL database',
      icon: (
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <div className="w-6 h-6 bg-green-500 rounded"></div>
        </div>
      ),
      comingSoon: true,
    },
  ];

  const handleContinue = () => {
    if (selectedType) {
      // Here you would typically navigate to the specific database setup flow
      console.log('Setting up:', selectedType);
      // For now, just close the modal
      onClose();
      setSelectedType(null);
    }
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
      setSelectedType(null);
      setIsAnimating(false);
    }, 200);
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-all duration-300 ${
          isAnimating ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden transition-all duration-300 ease-out ${
            isAnimating 
              ? 'opacity-0 scale-95 translate-y-2' 
              : 'opacity-100 scale-100 translate-y-0'
          }`}
          style={{
            animation: isAnimating ? 'animate-out 0.2s ease-in forwards' : 'animate-in 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Add Database</h2>
              <p className="text-slate-500 mt-1">Choose a database type to connect</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-2 h-auto"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {databaseOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => !option.comingSoon && setSelectedType(option.type)}
                  disabled={option.comingSoon}
                  className={`relative flex items-center space-x-4 p-4 rounded-xl border-2 text-left transition-all ${
                    selectedType === option.type
                      ? 'border-indigo-500 bg-indigo-50'
                      : option.comingSoon
                      ? 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-60'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {option.icon}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-slate-900">{option.name}</h3>
                      {option.comingSoon && (
                        <span className="px-2 py-1 text-xs font-medium bg-slate-200 text-slate-600 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{option.description}</p>
                  </div>
                  
                  {selectedType === option.type && (
                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Secure Connection</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    All database connections are encrypted and secured using industry-standard protocols. 
                    Your credentials are never stored in plain text.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-100 bg-slate-50">
            <Button
              variant="ghost"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleContinue}
              disabled={!selectedType}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 