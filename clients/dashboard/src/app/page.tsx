"use client";

import { useState } from "react";
import DatabaseSelector from "./(workbench)/database-selector";
import AddDatabaseModal from "./(workbench)/add-database-modal";
import AiChat from "./(workbench)/ai-chat";
import { Button } from "../components/ui";

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

export default function Dashboard() {
  const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  
  // Sample databases - in real app this would come from API
  const [databases] = useState<Database[]>([
    {
      id: '1',
      name: 'Production DynamoDB',
      type: 'DynamoDB',
      status: 'connected',
      lastAccessed: '2 hours ago',
      tableCount: 12,
      region: 'us-east-1',
      accountId: '123456789012'
    },
    {
      id: '2',
      name: 'Analytics Warehouse',
      type: 'PostgreSQL',
      status: 'connected',
      lastAccessed: '1 day ago',
      tableCount: 45,
    },
    {
      id: '3',
      name: 'User Data Store',
      type: 'MongoDB',
      status: 'disconnected',
      lastAccessed: '3 days ago',
      tableCount: 8,
    }
  ]);

  return (
    <div className="flex h-screen w-full">
      <div className="w-full h-full flex flex-col">
        {/* Header with Database Selector and Add Button */}
        <div className="flex items-center justify-between h-16 max-h-16 px-6 overflow-y-hidden border-b border-slate-200 bg-white">
          
          <div className="w-full"></div>
          <div className="flex items-center space-x-3">
            <DatabaseSelector
              databases={databases}
              selectedDatabase={selectedDatabase}
              onSelectDatabase={setSelectedDatabase}
            />
            <Button
              variant="primary"
              onClick={() => setIsAddModalOpen(true)}
              className="w-40"
            >
              Add Database
            </Button>
          </div>
        </div>

        {/* Main Content with AI Chat */}
        <div className="flex-1 flex">
          {/* Main Content Area */}
          <div className="flex-1 flex items-center justify-center p-6">
          {selectedDatabase ? (
            // Database Selected State - We'll build this out later
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                {selectedDatabase.name}
              </h2>
              <p className="text-slate-600">
                Database workstation content will appear here
              </p>
            </div>
          ) : (
            // Empty State - No Database Selected
            <div className="text-center max-w-lg">
              {/* Modern Icon Container */}
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl flex items-center justify-center mx-auto border border-indigo-100/50 shadow-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-1 -left-3 w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-300"></div>
              </div>

              {/* Content */}
              <div className="space-y-4 mb-8">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Ready to dive in?
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed max-w-md mx-auto">
                  Select a database from above to start exploring your data, or connect a new database to get started.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={() => setIsAddModalOpen(true)}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  Connect Database
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                >
                  Learn More
                </Button>
              </div>

              {/* Feature Highlights */}
              <div className="mt-12 grid grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">Secure</h3>
                  <p className="text-xs text-slate-500">End-to-end encryption</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">Fast</h3>
                  <p className="text-xs text-slate-500">Lightning quick queries</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">Simple</h3>
                  <p className="text-xs text-slate-500">Zero learning curve</p>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Add Database Modal */}
        <AddDatabaseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </div>

        {/* AI Chat */}
        <AiChat
          isCollapsed={isChatCollapsed}
          onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
        />

    </div>
  );
}
