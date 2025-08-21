"use client";

import { FiKey, FiPlus } from 'react-icons/fi';
import { Button, useDisclosure } from '@/components/ui';
import { useCredentials } from '@/hooks/use-credentials';
import { AddCredentialModal } from './add-credential-modal';
import { CredentialCard } from './CredentialCard';
import QueryProvider from '@/providers/query-client-provider';

function CredentialsPageContent() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // React Query hooks
  const { data: credentials = [], isLoading, error } = useCredentials();

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Credentials</h1>
              <p className="text-slate-600 mt-2">Manage your database connection credentials securely</p>
            </div>
            <Button
              onClick={onOpen}
              variant="primary"
              leftIcon={<FiPlus />}
              className="shadow-lg"
            >
              Add Credentials
            </Button>
          </div>
        </div>

        {/* Credentials Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-5 bg-slate-200 rounded w-32"></div>
                      <div className="h-5 bg-slate-200 rounded-full w-16"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                        <div className="h-6 bg-slate-200 rounded w-24"></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 bg-slate-200 rounded w-16"></div>
                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                      </div>
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="h-3 bg-slate-200 rounded w-24"></div>
                        <div className="h-3 bg-slate-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-red-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Failed to load credentials</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
          </div>
        ) : credentials.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiKey className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No credentials yet</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Add your first set of credentials to start connecting to your databases and cloud services.
            </p>
            <Button
              onClick={onOpen}
              variant="primary"
              leftIcon={<FiPlus />}
            >
              Add Your First Credentials
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {credentials.map((credential) => (
              <CredentialCard
                key={credential.id}
                credential={credential}
              />
            ))}
          </div>
        )}

        {/* Coming Soon Section */}
        <div className="mt-12">
          <h3 className="text-lg font-medium text-slate-900 mb-6">More providers coming soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Google Cloud Platform', icon: '☁️', description: 'Service account keys and OAuth' },
              { name: 'Microsoft Azure', icon: '🔷', description: 'Service principals and managed identities' },
              { name: 'Database Direct', icon: '🗄️', description: 'Direct database username/password' }
            ].map((provider) => (
              <div key={provider.name} className="bg-white rounded-lg p-6 border border-slate-200 opacity-60">
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">{provider.icon}</span>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">{provider.name}</h4>
                    <p className="text-sm text-slate-500 mb-3">{provider.description}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <AddCredentialModal
          isOpen={isOpen}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

export default function CredentialsPage() {
  return (
    <QueryProvider>
      <CredentialsPageContent />
    </QueryProvider>
  );
} 