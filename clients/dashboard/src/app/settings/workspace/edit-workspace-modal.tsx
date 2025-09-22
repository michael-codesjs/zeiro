"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Input, Textarea, Modal, ModalHeader, ModalBody, ModalFooter, ModalContent } from "@/components/ui";
import { type UseDisclosureReturn } from "@/hooks/use-disclosure";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useWorkspaces } from "@/data/workspaces";
import { Edit2 } from "iconsax-reactjs";

interface EditWorkspaceModalProps {
  disclosure: UseDisclosureReturn;
  workspace: {
    id: string;
    name: string;
    description?: string;
    logo?: string;
  };
  onWorkspaceUpdated?: () => void;
}

interface EditFormData {
  name: string;
  description: string;
  logo?: File | null;
  logoPreview?: string;
}

export function EditWorkspaceModal({ disclosure, workspace, onWorkspaceUpdated }: EditWorkspaceModalProps) {
  const { updateWorkspace, isUpdatingWorkspace } = useWorkspaces();
  const [editForm, setEditForm] = useState<EditFormData>({
    name: workspace.name,
    description: workspace.description || "",
    logo: null,
    logoPreview: undefined
  });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadModalDisclosure = useDisclosure();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setEditForm(prev => ({
        ...prev,
        logo: file,
        logoPreview: previewUrl
      }));
      uploadModalDisclosure.onClose();
    }
  };

  const handleRemoveLogo = () => {
    setEditForm(prev => ({
      ...prev,
      logo: null,
      logoPreview: undefined
    }));
    uploadModalDisclosure.onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Initialize form when workspace changes or modal opens
  useEffect(() => {
    if (workspace && disclosure.isOpen) {
      setEditForm({
        name: workspace.name,
        description: workspace.description || "",
        logo: null,
        logoPreview: workspace.logo
      });
    }
  }, [workspace, disclosure.isOpen]);

  const handleUpdateWorkspace = async () => {
    if (!workspace?.id || !editForm.name.trim()) return;
    
    try {
      setError(null);
      
      // Prepare update data
      const updateData: { name?: string; description?: string; metadata?: Record<string, any> } = {};
      
      if (editForm.name.trim() !== workspace.name) {
        updateData.name = editForm.name.trim();
      }
      
      if (editForm.description !== (workspace.description || "")) {
        updateData.description = editForm.description;
      }
      
      // For now, we'll skip logo upload functionality and focus on name/description
      // TODO: Implement logo upload to S3 and include URL in metadata
      
      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        disclosure.onClose();
        return;
      }
      
      await updateWorkspace(workspace.id, updateData);
      
      disclosure.onClose();
      onWorkspaceUpdated?.();
    } catch (err) {
      console.error("Failed to update workspace:", err);
      setError(err instanceof Error ? err.message : "Failed to update workspace. Please try again.");
    }
  };

  const handleClose = () => {
    // Clean up any preview URLs
    if (editForm.logoPreview && editForm.logoPreview !== workspace.logo) {
      URL.revokeObjectURL(editForm.logoPreview);
    }
    
    // Reset form when closing
    setEditForm({
      name: workspace.name,
      description: workspace.description || "",
      logo: null,
      logoPreview: workspace.logo
    });
    setError(null);
    disclosure.onClose();
  };

  return (
    <Modal disclosure={disclosure}>
      <ModalContent>
        <ModalHeader disclosure={disclosure}>Edit Workspace</ModalHeader>
        <ModalBody>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="space-y-6">
            {/* Logo Section */}
            <div className="flex flex-col items-center space-y-4">
              
              {/* Social Media Style Profile Picture */}
              <div className="relative">
                <button
                  type="button"
                  onClick={uploadModalDisclosure.onOpen}
                  disabled={isUpdatingWorkspace}
                  className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 hover:bg-gray-200 transition-colors border-4 border-white shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editForm.logoPreview ? (
                    <img 
                      src={editForm.logoPreview} 
                      alt="Workspace logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {workspace.name ? workspace.name.charAt(0).toUpperCase() : 'W'}
                      </span>
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Click to upload a new logo
              </p>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workspace Name *
              </label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workspace name"
                disabled={isUpdatingWorkspace}
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter workspace description (optional)"
                rows={3}
                disabled={isUpdatingWorkspace}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClose} disabled={isUpdatingWorkspace}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleUpdateWorkspace}
              disabled={!editForm.name.trim() || isUpdatingWorkspace}
            >
              {isUpdatingWorkspace ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Modal */}
      <Modal disclosure={uploadModalDisclosure}>
        <ModalContent>
          <ModalHeader disclosure={uploadModalDisclosure}>Update Logo</ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Drag and Drop Area */}
              <div 
                onClick={triggerFileInput}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                    <Button variant="outline" size="sm" type="button">
                      Browse files
                    </Button>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Recommended: Square image, max 2MB, PNG or JPG
              </p>
              
              {/* Remove Option */}
              {editForm.logoPreview && (
                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRemoveLogo}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove current logo
                  </Button>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={uploadModalDisclosure.onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Modal>
  );
}

interface EditWorkspaceButtonProps {
  workspace: {
    membership: {
      role: string;
    };
  };
  onOpen: () => void;
}

export function EditWorkspaceButton({ workspace, onOpen }: EditWorkspaceButtonProps) {
  // Only workspace owners can edit workspace details
  if (!workspace.membership || workspace.membership.role !== "owner") {
    return null;
  }

  return (
    <Button
      onClick={onOpen}
      variant="outline"
      size="sm"
      leftIcon={<Edit2 size="16" />}
    >
      Edit
    </Button>
  );
}
