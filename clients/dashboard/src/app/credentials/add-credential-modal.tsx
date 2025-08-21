"use client";

import { useState } from 'react';
import { FiEye, FiEyeOff, FiUser, FiKey, FiLock, FiGlobe, FiHash } from 'react-icons/fi'
import {
  UsersProfileLinear,
  SecurityKeyLinear,
  SecurityLockLinear,
  SecurityEyeLinear,
  SecurityEyeSlashLinear,
  SecuritySecurityUserLinear
} from 'react-icons-sax'
import { 
  Button, 
  Input, 
  Select, 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ModalCloseButton 
} from '@/components/ui';
import { toast } from 'react-hot-toast';
import { useCreateCredential, type Credential } from '@/hooks/use-credentials';

interface AddCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddCredentialModal({ isOpen, onClose, onSuccess }: AddCredentialModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'aws',
    provider: 'aws',
    access_key_id: '',
    secret_access_key: '',
    account_id: ''
  });

  const [showSecret, setShowSecret] = useState(false);
  const createCredentialMutation = useCreateCredential();

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCredentialMutation.mutateAsync({
        name: formData.name,
        type: formData.type,
        provider: formData.provider,
        access_key_id: formData.access_key_id,
        secret_access_key: formData.secret_access_key,
        account_id: formData.account_id,
        status: 'active'
      });
      
      setFormData({ 
        name: '', 
        type: 'aws', 
        provider: 'aws',
        access_key_id: '', 
        secret_access_key: '', 
        account_id: ''
      });
      
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error adding credentials:', error);
      toast.error('Failed to add credentials. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Add AWS Credentials</h2>
          <p className="text-slate-500 mt-1">Securely store your AWS access credentials</p>
        </div>
        <ModalCloseButton onClose={onClose} />
      </ModalHeader>

      <form onSubmit={handleAddCredential}>
        <ModalBody>
          <div className="space-y-5">
            <Input
              id="credential-name"
              label="Credential Name"
              placeholder="e.g., Production AWS Account"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              leftIcon={<UsersProfileLinear size={18}/>}
              isRequired
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="account-id"
                label="Account ID"
                placeholder="123456789012"
                value={formData.account_id}
                onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                leftIcon={<SecuritySecurityUserLinear size={18} />}
                isRequired
                required
              />
              
              <Input
                id="access-key-id"
                label="Access Key ID"
                placeholder="AKIA..."
                value={formData.access_key_id}
                onChange={(e) => setFormData({ ...formData, access_key_id: e.target.value })}
                leftIcon={<SecurityKeyLinear size={18} />}
                isRequired
                required
              />
            </div>
            
            <Input
              id="secret-access-key"
              label="Secret Access Key"
              type={showSecret ? "text" : "password"}
              placeholder="Enter your secret access key"
              value={formData.secret_access_key}
              onChange={(e) => setFormData({ ...formData, secret_access_key: e.target.value })}
              leftIcon={<SecurityLockLinear size={18} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showSecret ? <SecurityEyeLinear size={18} /> : <SecurityEyeSlashLinear size={18} />}
                </button>
              }
              isRequired
              required
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Security Notice</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your credentials are encrypted and stored securely. We recommend using IAM roles with minimal required permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={createCredentialMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={createCredentialMutation.isPending}
            disabled={createCredentialMutation.isPending}
          >
            Add Credentials
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
} 