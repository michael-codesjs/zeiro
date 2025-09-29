"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "../../../components/ui/modals/modal";
import { Button, Input, Select } from "../../../components/ui";
import { CreateCredentialInput, UpdateCredentialInput, CredentialType, Credential } from "../../../data/credentials";
import { CloseCircle, ArrowLeft, ArrowRight } from "iconsax-reactjs";

type Step = 'basic' | 'details';

// Form validation schemas
const baseCredentialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["iam_access_keys", "connection_details"]),
});

const iamAccessKeysSchema = baseCredentialSchema.extend({
  type: z.literal("iam_access_keys"),
  account_id: z.string().min(12, "AWS Account ID must be 12 digits").max(12, "AWS Account ID must be 12 digits").regex(/^\d+$/, "AWS Account ID must contain only numbers"),
  access_key_id: z.string().min(1, "Access Key ID is required"),
  secret_access_key: z.string().min(1, "Secret Access Key is required"),
  region: z.string().optional(),
});

const connectionDetailsSchema = baseCredentialSchema.extend({
  type: z.literal("connection_details"),
  host: z.string().min(1, "Host is required"),
  port: z.number().min(1, "Port must be a valid number").max(65535, "Port must be less than 65536"),
  database: z.string().min(1, "Database name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  ssl: z.boolean().optional(),
});

// Create a more flexible schema that doesn't enforce discriminated union during form editing
const credentialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["iam_access_keys", "service_account_keys", "service_principals", "connection_details"]),
  // IAM Access Keys fields (optional when not IAM type)
  account_id: z.string().optional(),
  access_key_id: z.string().optional(),
  secret_access_key: z.string().optional(),
  region: z.string().optional(),
  // Connection Details fields (optional when not connection details type)
  host: z.string().optional(),
  port: z.number().optional(),
  database: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  ssl: z.boolean().optional(),
}).refine((data) => {
  // Validate IAM Access Keys fields when type is iam_access_keys
  if (data.type === "iam_access_keys") {
    return data.account_id && 
           data.account_id.length === 12 && 
           /^\d+$/.test(data.account_id) &&
           data.access_key_id;
           // Note: secret_access_key is optional in edit mode, handled by isRequired prop
  }
  // Validate connection details fields when type is connection_details
  if (data.type === "connection_details") {
    return data.host && 
           data.port && 
           data.port > 0 && 
           data.port <= 65535 &&
           data.database && 
           data.username;
           // Note: password is optional in edit mode, handled by isRequired prop
  }
  return true;
}, {
  message: "Please fill in all required fields for the selected credential type",
});

type CredentialFormData = z.infer<typeof credentialSchema>;

export interface UpsertCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCredentialInput) => Promise<void>;
  onUpdate?: (id: string, data: UpdateCredentialInput) => Promise<void>;
  credential?: Credential | null; // If provided, we're in edit mode
  isLoading?: boolean;
}

export default function UpsertCredentialModal({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  credential,
  isLoading = false
}: UpsertCredentialModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [selectedType, setSelectedType] = useState<CredentialType>("connection_details");
  
  // Determine if we're in edit mode
  const isEditMode = !!credential;

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, },
    reset,
    setValue,
    trigger
  } = useForm<CredentialFormData>({
    resolver: zodResolver(credentialSchema),
    mode: 'onTouched', // Only validate after user touches the field
    defaultValues: {
      name: "",
      type: "connection_details",
      // AWS fields
      account_id: "",
      access_key_id: "",
      secret_access_key: "",
      region: "",
      // Database fields
      host: "",
      port: undefined,
      database: "",
      username: "",
      password: "",
      ssl: false,
    },
  });

  // Pre-fill form when credential changes (edit mode)
  useEffect(() => {
    if (!isOpen) return;

    if (credential) {
      setSelectedType(credential.type as CredentialType);
      
      // Build form data object
      const formData: Partial<CredentialFormData> = {
        name: credential.name,
        type: credential.type as CredentialType,
      };

      // Add type-specific fields based on credential type
      if (credential.type === 'iam_access_keys') {
        const iamCredential = credential as any;
        formData.account_id = iamCredential.account_id || "";
        formData.access_key_id = iamCredential.access_key_id || "";
        formData.secret_access_key = ""; // Don't pre-fill sensitive data
        formData.region = iamCredential.region || "";
        // Clear connection details fields
        formData.host = "";
        formData.port = undefined;
        formData.database = "";
        formData.username = "";
        formData.password = "";
        formData.ssl = false;
      } else if (credential.type === 'connection_details') {
        const dbCredential = credential as any;
        formData.host = dbCredential.host || "";
        formData.port = dbCredential.port || undefined;
        formData.database = dbCredential.database || "";
        formData.username = dbCredential.username || "";
        formData.password = ""; // Don't pre-fill sensitive data
        formData.ssl = dbCredential.ssl || false;
        // Clear IAM fields
        formData.account_id = "";
        formData.access_key_id = "";
        formData.secret_access_key = "";
        formData.region = "";
      }

      reset(formData);
    } else {
      // Reset to default values for add mode
      const defaultData = {
        name: "",
        type: "connection_details" as CredentialType,
        account_id: "",
        access_key_id: "",
        secret_access_key: "",
        region: "",
        host: "",
        port: undefined,
        database: "",
        username: "",
        password: "",
        ssl: false,
      };
      reset(defaultData);
      setSelectedType("connection_details");
    }
  }, [credential, isOpen, reset]);

  const handleTypeChange = (type: CredentialType) => {
    setSelectedType(type);
    setValue("type", type);
    // Form values are preserved, just update the type
  };

  const handleFormSubmit = async (data: CredentialFormData) => {
    try {
      if (isEditMode && credential && onUpdate) {
        // Edit mode - only include fields that have values (don't send empty strings for sensitive fields)
        const updateData: UpdateCredentialInput = {
          name: data.name,
          type: data.type,
        };

        if (data.type === "iam_access_keys") {
          if (data.account_id) updateData.account_id = data.account_id;
          if (data.access_key_id) updateData.access_key_id = data.access_key_id;
          if (data.secret_access_key) updateData.secret_access_key = data.secret_access_key;
          if (data.region) updateData.region = data.region;
        } else if (data.type === "connection_details") {
          if (data.host) updateData.host = data.host;
          if (data.port) updateData.port = data.port;
          if (data.database) updateData.database = data.database;
          if (data.username) updateData.username = data.username;
          if (data.password) updateData.password = data.password;
          updateData.ssl = data.ssl;
        }

        await onUpdate(credential.id, updateData);
      } else {
        // Create mode
        await onSubmit(data as CreateCredentialInput);
      }
      
      reset();
      onClose();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} credential:`, error);
    }
  };

  const handleClose = () => {
    // Only reset form when actually closing the modal
    reset();
    setCurrentStep("basic");
    setSelectedType("connection_details");
    onClose();
  };

  const handleNext = async () => {
    // Validate basic fields before proceeding
    const isValid = await trigger(['name', 'type']);
    if (isValid) {
      setCurrentStep("details");
    }
  };

  const handleBack = () => {
    // Just navigate back, don't reset any form data
    setCurrentStep("basic");
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'basic':
        return isEditMode ? 'Edit Credential' : 'Add New Credential';
      case 'details':
        return `Configure ${selectedType === 'iam_access_keys' ? 'IAM Access Keys' : 'Connection Details'}`;
      default:
        return isEditMode ? 'Edit Credential' : 'Add New Credential';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'basic':
        return isEditMode ? 'Update basic information about your credential' : 'Enter basic information about your credential';
      case 'details':
        return isEditMode ? 'Update the specific details for your credential' : 'Configure the specific details for your credential';
      default:
        return '';
    }
  };

  // Helper function to determine if we should show an error for a field
  const shouldShowError = (fieldName: keyof CredentialFormData) => {
    return errors[fieldName] && touchedFields[fieldName];
  };

  const credentialTypeOptions = [
    { value: "connection_details", label: "Database Connection" },
    { value: "iam_access_keys", label: "IAM Access Keys" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{getStepTitle()}</h2>
              <p className="text-sm text-slate-600 mt-1">{getStepDescription()}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <CloseCircle size="20" />
            </button>
          </div>
          
        </ModalHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalBody className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 'basic' && (
              <div className="space-y-4">
                <Input
                  label="Credential Name"
                  placeholder="Enter a descriptive name"
                  {...register("name")}
                  error={shouldShowError('name') ? errors.name?.message : undefined}
                  isRequired
                />

                <Select
                  label="Credential Type"
                  value={selectedType}
                  onValueChange={handleTypeChange}
                  options={credentialTypeOptions}
                  isRequired
                  disabled={isEditMode} // Don't allow changing type when editing
                />
              </div>
            )}

            {/* Step 2: Type-specific Configuration */}
            {currentStep === 'details' && selectedType === "iam_access_keys" && (
              <div className="space-y-4">
                <Input
                  label="AWS Account ID"
                  placeholder="123456789012"
                  {...register("account_id")}
                  error={shouldShowError('account_id') ? errors.account_id?.message : undefined}
                  isRequired
                  maxLength={12}
                />

                <Input
                  label="Access Key ID"
                  placeholder="AKIA..."
                  {...register("access_key_id")}
                  error={shouldShowError('access_key_id') ? errors.access_key_id?.message : undefined}
                  isRequired
                />

                <Input
                  label="Secret Access Key"
                  type="password"
                  placeholder={isEditMode ? "Leave empty to keep current value" : "Enter your secret access key"}
                  {...register("secret_access_key")}
                  error={shouldShowError('secret_access_key') ? errors.secret_access_key?.message : undefined}
                  isRequired={!isEditMode} // Not required in edit mode
                />

                <Input
                  label="Region (Optional)"
                  placeholder="us-east-1"
                  {...register("region")}
                  error={shouldShowError('region') ? errors.region?.message : undefined}
                />
              </div>
            )}

            {currentStep === 'details' && selectedType === "connection_details" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Host"
                    placeholder="localhost"
                    {...register("host")}
                    error={shouldShowError('host') ? errors.host?.message : undefined}
                    isRequired
                  />

                  <Input
                    label="Port"
                    type="number"
                    placeholder="5432"
                    {...register("port", { valueAsNumber: true })}
                    error={shouldShowError('port') ? errors.port?.message : undefined}
                    isRequired
                  />
                </div>

                <Input
                  label="Database Name"
                  placeholder="myapp_production"
                  {...register("database")}
                  error={shouldShowError('database') ? errors.database?.message : undefined}
                  isRequired
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Username"
                    placeholder="db_user"
                    {...register("username")}
                    error={shouldShowError('username') ? errors.username?.message : undefined}
                    isRequired
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder={isEditMode ? "Leave empty to keep current value" : "Enter password"}
                    {...register("password")}
                    error={shouldShowError('password') ? errors.password?.message : undefined}
                    isRequired={!isEditMode} // Not required in edit mode
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ssl"
                    {...register("ssl")}
                    className="h-4 w-4 text-gray-900 border-slate-300 rounded focus:ring-gray-500"
                  />
                  <label htmlFor="ssl" className="text-sm text-slate-700">
                    Enable SSL connection
                  </label>
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <div className="flex w-full gap-3 justify-between items-between">
              <div>
                {currentStep === 'details' && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    disabled={isLoading}
                    leftIcon={<ArrowLeft size="16" />}
                  >
                    Back
                  </Button>
                )}
              </div>
              
              <div className="flex gap-3">
                
                {currentStep === 'basic' ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNext}
                    rightIcon={<ArrowRight size="16" />}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    {isEditMode ? 'Update Credential' : 'Create Credential'}
                  </Button>
                )}
              </div>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
