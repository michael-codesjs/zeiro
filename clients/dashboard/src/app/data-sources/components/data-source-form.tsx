"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DataSourceType, DATA_SOURCE_TYPES } from "../../../data/data-source-types";
import { Input, Select, Button, type SelectOption } from "../../../components/ui";

// Simple form schema
const dataSourceFormSchema = z.object({
  name: z.string().min(1, "Data source name is required"),
  type: z.string().min(1, "Please select a data source type") as z.ZodType<DataSourceType>,
  description: z.string().optional(),
});

export type DataSourceFormData = z.infer<typeof dataSourceFormSchema>;

interface DataSourceFormProps {
  onSubmit: (data: DataSourceFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: {
    name: string;
    type: DataSourceType;
    description?: string;
  };
}

export default function DataSourceForm({ onSubmit, onCancel, isLoading = false, initialData }: DataSourceFormProps) {
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(dataSourceFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || ("" as DataSourceType),
      description: initialData?.description || "",
    },
  });

  const selectedType = watch("type") as DataSourceType | null;
  const selectedName = watch("name");

  // Check if form is valid for submission
  const isFormValid = selectedType && selectedName && selectedName.trim().length > 0;

  // Convert DATA_SOURCE_TYPES to SelectOption format
  const selectOptions: SelectOption[] = DATA_SOURCE_TYPES.map(type => ({
    value: type.value,
    label: type.label,
    leftIcon: (
      <div className="w-8 h-8 flex items-center justify-center">
        <img 
          src={type.image} 
          alt={type.label}
          className="w-6 h-6 object-contain"
        />
      </div>
    ),
  }));

  const handleTypeChange = (value: string) => {
    setValue("type", value as DataSourceType, { shouldValidate: true });
  };

  const handleFormSubmit = (data: DataSourceFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Data Source Type Selection */}
      <Select
        label="What type of data source are we connecting to?"
        placeholder="Select a data source type..."
        options={selectOptions}
        value={selectedType || ""}
        onValueChange={handleTypeChange}
        error={errors.type?.message}
        isRequired
        searchable
        emptyMessage="No data sources found"
      />

      {/* Data Source Name */}
      <Input
        label="What should we call this data source?"
        placeholder="Enter a descriptive name (e.g., Production PostgreSQL, Analytics MongoDB)"
        {...register("name")}
        error={errors.name?.message}
        isRequired
      />

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || !isFormValid}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}