"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "../../components/ui/modals/modal";
import { CloseCircle } from "iconsax-react";
import DataSourceForm, { DataSourceFormData } from "./components/data-source-form";
import ConnectionDetailsForm, { ConnectionData } from "./components/connection-details-form";
import { useCreateDataSource, useUpdateDataSource, type DataSourceType } from "../../hooks/use-data-sources";

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  description?: string;
  connection_details?: ConnectionData;
}

export interface UpsertDataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataSource?: DataSource;
}

type Step = 'basic' | 'connection';

export default function UpsertDataSourceModal({
  isOpen,
  onClose,
  dataSource
}: UpsertDataSourceModalProps) {
  
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [basicFormData, setBasicFormData] = useState<DataSourceFormData | null>(null);

  const isEditMode = !!dataSource;
  
  // Use the hooks for create and update operations
  const { mutateAsync: createDataSource, isPending: isCreating } = useCreateDataSource();
  const updateDataSourceMutation = useUpdateDataSource();

  // Check if the selected data source type is supported for connection details
  const isSupportedDataSource = (type: DataSourceType): boolean => {
    return ['PostgreSQL', 'MySQL', 'DynamoDB'].includes(type);
  };

  const handleBasicFormSubmit = async (data: DataSourceFormData) => {
    // For edit mode, we can submit immediately since we're only updating basic info
    if (isEditMode && dataSource) {
      setIsSubmitting(true);
      try {
        await updateDataSourceMutation.mutateAsync({
          id: dataSource.id,
          data: {
            name: data.name,
            type: data.type,
            description: data.description,
          }
        });
        handleClose();
      } catch (error) {
        console.error("Failed to update data source:", error);
        // Error handling is done by the hook (shows toast)
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // For create mode, check if connection details are supported
    if (!isSupportedDataSource(data.type)) {
      alert(`Connection details for ${data.type} are not yet supported. Please select PostgreSQL, MySQL, or DynamoDB.`);
      return;
    }
    
    setBasicFormData(data);
    setCurrentStep('connection');
  };

  const handleConnectionFormSubmit = async (connectionData: ConnectionData) => {
    if (!basicFormData) return;
    
    setIsSubmitting(true);
    try {
      await createDataSource({
        name: basicFormData.name,
        type: basicFormData.type,
        connection_details: connectionData,
        description: basicFormData.description,
      });
      handleClose();
    } catch (error) {
      console.error("Failed to create data source:", error);
      // Error handling is done by the hook (shows toast)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setCurrentStep('basic');
  };

  const handleClose = () => {
    const isLoading = isSubmitting || isCreating || updateDataSourceMutation.isPending;
    if (!isLoading) {
      setCurrentStep('basic');
      setBasicFormData(null);
      onClose();
    }
  };

  const getStepTitle = () => {
    if (isEditMode) {
      return 'Edit Data Source';
    }
    
    switch (currentStep) {
      case 'basic':
        return 'Add New Data Source';
      case 'connection':
        return 'Connection Details';
      default:
        return 'Add New Data Source';
    }
  };

  const getStepDescription = () => {
    if (isEditMode) {
      return 'Update your data source information';
    }
    
    switch (currentStep) {
      case 'basic':
        return 'Connect to your database or data store';
      case 'connection':
        return 'Configure your connection settings';
      default:
        return 'Connect to your database or data store';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center justify-between">
                <div>
              <h2 className="text-xl font-semibold text-slate-900">{getStepTitle()}</h2>
              <p className="text-sm text-slate-600 mt-1">{getStepDescription()}</p>
            </div>
            <div className="flex items-center gap-4">
            <button
              onClick={handleClose}
                disabled={isSubmitting || isCreating || updateDataSourceMutation.isPending}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            >
                <CloseCircle size={20} color="currentColor" />
            </button>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          {currentStep === 'basic' && (
            <DataSourceForm 
              onSubmit={handleBasicFormSubmit}
              onCancel={handleClose}
              isLoading={isSubmitting || isCreating || updateDataSourceMutation.isPending}
              initialData={dataSource ? {
                name: dataSource.name,
                type: dataSource.type,
                description: dataSource.description
              } : undefined}
            />
          )}
          
          {currentStep === 'connection' && basicFormData && !isEditMode && (
            <ConnectionDetailsForm
              dataSourceType={basicFormData.type}
              dataSourceName={basicFormData.name}
              onSubmit={handleConnectionFormSubmit}
              onBack={handleBack}
              isLoading={isSubmitting || isCreating}
            />
            )}
          </ModalBody>
      </ModalContent>
    </Modal>
  );
}