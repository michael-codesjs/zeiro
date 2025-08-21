"use client";

import { useState } from 'react';
import { FiKey, FiEdit2, FiTrash2, FiCopy, FiCheck } from 'react-icons/fi';
import { Button } from '@/components/ui';
import { useDeleteCredential, type Credential } from '@/hooks/use-credentials';

interface CredentialCardProps {
  credential: Credential;
  onSuccess?: () => void;
}

export function CredentialCard({ credential, onSuccess }: CredentialCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);
  const deleteCredentialMutation = useDeleteCredential();

  const handleCopy = async () => {
    if (credential.connection_details?.access_key_id) {
      await navigator.clipboard.writeText(credential.connection_details.access_key_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteCredential = () => {
    deleteCredentialMutation.mutate(credential.id, {
      onSuccess: () => {
        onSuccess?.();
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-200 group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
            <FiKey size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-slate-900">{credential.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(credential.status)}`}>
                {credential.status}
              </span>
            </div>
            <div className="space-y-1">
              {credential.connection_details?.access_key_id && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-500">Access Key:</span>
                  <code className="text-sm font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    {credential.connection_details.access_key_id}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {copied ? <FiCheck size={14} className="text-green-600" /> : <FiCopy size={14} />}
                  </button>
                </div>
              )}
              {credential.connection_details?.region && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-500">Region:</span>
                  <span className="text-sm text-slate-700">{credential.connection_details.region}</span>
                </div>
              )}
              <div className="flex items-center space-x-4 text-xs text-slate-500 mt-3">
                <span>Created: {new Date(credential.created_at).toLocaleDateString()}</span>
                <span>Last used: {credential.last_used ? new Date(credential.last_used).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`flex items-center space-x-2 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-auto"
          >
            <FiEdit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDeleteCredential}
            disabled={deleteCredentialMutation.isPending}
            loading={deleteCredentialMutation.isPending}
          >
            <FiTrash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 