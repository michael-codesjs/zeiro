"use client";

import { useState, useMemo } from "react";
import { Button, Input, Popover, ErrorState, ConfirmationModal } from "../../../components/ui";
import { useCredentials, CredentialType, CredentialStatus, CreateCredentialInput, UpdateCredentialInput, Credential } from "../../../data/credentials";
import { CredentialsSkeleton, CredentialsTableSkeleton } from "./skeleton-loader";
import UpsertCredentialModal from "./upsert-credential-modal";
import { 
  Add,
  SearchNormal1,
  Filter,
  Edit2,
  Trash,
  Key,
  TickCircle,
  CloseCircle,
  Clock,
  TickSquare
} from "iconsax-reactjs";

type FilterType = 'all' | CredentialType;

const getStatusIcon = (status: CredentialStatus) => {
  switch (status) {
    case 'active':
      return <TickCircle size="16" className="text-green-500" />;
    case 'inactive':
      return <CloseCircle size="16" className="text-gray-500" />;
    case 'expired':
      return <Clock size="16" className="text-red-500" />;
    default:
      return <CloseCircle size="16" className="text-gray-500" />;
  }
};

const getStatusText = (status: CredentialStatus) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'expired':
      return 'Expired';
    default:
      return 'Unknown';
  }
};

const getStatusColor = (status: CredentialStatus) => {
  switch (status) {
    case 'active':
      return 'text-green-700 bg-green-50';
    case 'inactive':
      return 'text-gray-700 bg-gray-50';
    case 'expired':
      return 'text-red-700 bg-red-50';
    default:
      return 'text-gray-700 bg-gray-50';
  }
};

export default function CredentialsSettings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<string | null>(null);
  const [credentialToEdit, setCredentialToEdit] = useState<Credential | null>(null);

  // Fetch credentials from API
  const { 
    credentials, 
    loading, 
    error, 
    refetch,
    createCredential: createCredentialMutation,
    updateCredential: updateCredentialMutation,
    deleteCredential: deleteCredentialMutation,
    isCreating,
    isUpdating,
    isDeleting
  } = useCredentials({
    type: filterType === "all" ? undefined : filterType,
    limit: 100, // Get all credentials for now, we can add pagination later
  });

  // Filter credentials based on search query (API filtering by type is handled in the hook)
  const filteredCredentials = useMemo(() => {
    if (!searchQuery) return credentials;
    
    return credentials.filter(credential => 
      credential.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [credentials, searchQuery]);

  const handleAddCredential = () => {
    setShowAddModal(true);
  };

  const handleCreateCredential = async (data: CreateCredentialInput) => {
    try {
      await createCredentialMutation(data);
      console.log("Credential created successfully");
    } catch (error) {
      console.error("Failed to create credential:", error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  const handleEditCredential = (credential: Credential) => {
    setCredentialToEdit(credential);
    setShowEditModal(true);
  };

  const handleUpdateCredential = async (id: string, data: UpdateCredentialInput) => {
    try {
      await updateCredentialMutation(id, data);
      console.log("Credential updated successfully");
    } catch (error) {
      console.error("Failed to update credential:", error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  const handleDeleteCredential = (id: string) => {
    setCredentialToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteCredential = async () => {
    if (!credentialToDelete) return;
    
    try {
      await deleteCredentialMutation(credentialToDelete);
      console.log("Credential deleted successfully");
      setShowDeleteModal(false);
      setCredentialToDelete(null);
    } catch (error) {
      console.error("Failed to delete credential:", error);
    }
  };

  const cancelDeleteCredential = () => {
    setShowDeleteModal(false);
    setCredentialToDelete(null);
  };


  // Controls component that's always shown
  const renderControls = () => (
    <div className="flex items-center gap-3">
      {/* Search Input */}
      <div className="flex-1 max-w-md">
        <Input
          type="search"
          placeholder="Search credentials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<SearchNormal1 size="16" />}
          onClear={() => setSearchQuery("")}
        />
      </div>

      {/* Filter Popover */}
      <Popover
        trigger={
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="text-sm font-medium text-slate-700">Filters</span>
            {filterType !== "all" && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-gray-900 rounded-full">
                1
              </span>
            )}
            <Filter size="16" className="text-slate-600" />
          </button>
        }
        align="start"
        contentClassName="w-64 p-4"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-900 mb-3">Filter by Type</h3>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Types" },
                    { value: "aws_access_keys", label: "AWS Access Keys" },
                    { value: "database_connection", label: "Database Connection" }
                  ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="filterType"
                      value={option.value}
                      checked={filterType === option.value}
                      onChange={(e) => setFilterType(e.target.value as FilterType)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded-full transition-colors ${
                      filterType === option.value 
                        ? 'border-gray-900 bg-gray-900' 
                        : 'border-slate-300'
                    }`}>
                      {filterType === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          {filterType !== "all" && (
            <div className="pt-3 border-t border-slate-200">
              <button
                onClick={() => setFilterType("all")}
                className="text-sm text-gray-900 hover:text-gray-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </Popover>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Add Button */}
      <Button
        onClick={handleAddCredential}
        rightIcon={<Add size="16" />}
        variant="primary"
        size="md"
      >
        Add Credential
      </Button>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Section Header - Always show */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Credentials</h2>
          <p className="text-sm text-slate-600 mt-1">Manage your API keys, database connections, and other credentials</p>
        </div>

        {/* Controls Section - Always show */}
        {renderControls()}

        {/* Table Section - Show skeleton */}
        <CredentialsTableSkeleton />

        {/* Results Summary - Show skeleton */}
        <div className="text-center animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        {/* Section Header - Always show */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Credentials</h2>
          <p className="text-sm text-slate-600 mt-1">Manage your API keys, database connections, and other credentials</p>
        </div>
        
        {/* Controls Section - Always show */}
        {renderControls()}
        
        <ErrorState
          title="Failed to load credentials"
          message={error}
          variant="compact"
          onRetry={refetch}
          retryText="Try Again"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Credentials</h2>
        <p className="text-sm text-slate-600 mt-1">Manage your API keys, database connections, and other credentials</p>
      </div>

      {/* Controls Section */}
      {renderControls()}

      {/* Credentials Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredCredentials.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 text-slate-400">
                <Key size="48" />
              </div>
              <h3 className="text-sm font-medium text-slate-900">
                {searchQuery || filterType !== "all" ? "No credentials found" : "No credentials yet"}
              </h3>
              <p className="text-sm text-slate-500">
                {searchQuery || filterType !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by adding your first credential."
                }
              </p>
              {!searchQuery && filterType === "all" && (
                <Button
                  onClick={handleAddCredential}
                  rightIcon={<Add size="16" />}
                  variant="outline"
                  size="sm"
                >
                  Add Credential
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCredentials.map((credential) => (
                  <tr key={credential.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {credential.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {credential.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(credential.status as CredentialStatus)}`}>
                        {getStatusIcon(credential.status as CredentialStatus)}
                        <span className="ml-1">{getStatusText(credential.status as CredentialStatus)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(credential.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {credential.last_used ? new Date(credential.last_used).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditCredential(credential)}
                          className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                          title="Edit credential"
                        >
                          <Edit2 size="16" />
                        </button>
                        <button
                          onClick={() => handleDeleteCredential(credential.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete credential"
                        >
                          <Trash size="16" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

        {/* Results Summary */}
        {filteredCredentials.length > 0 && (
          <div className="text-sm text-slate-500 text-center">
            Showing {filteredCredentials.length} of {credentials.length} credentials
          </div>
        )}

        {/* Add/Edit Credential Modal */}
        <UpsertCredentialModal
          isOpen={showAddModal || showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setCredentialToEdit(null);
          }}
          onSubmit={handleCreateCredential}
          onUpdate={handleUpdateCredential}
          credential={credentialToEdit}
          isLoading={isCreating || isUpdating}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={cancelDeleteCredential}
          onConfirm={confirmDeleteCredential}
          title="Delete Credential"
          message="Are you sure you want to delete this credential? This action cannot be undone and may affect any applications using this credential."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={isDeleting}
        />
    </div>
  );
}
