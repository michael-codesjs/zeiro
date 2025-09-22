"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { forwardRef, useState, useRef } from "react";

const fileInputVariants = cva(
  "relative w-full border-2 border-dashed rounded-lg transition-all duration-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-gray-500 focus-within:border-gray-500",
  {
    variants: {
      variant: {
        default: "border-slate-300 hover:border-slate-400 bg-white",
        filled: "border-slate-200 bg-slate-50 hover:bg-white",
        primary: "border-gray-300 bg-gray-50 hover:border-gray-400",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      state: {
        default: "",
        error: "border-red-300 bg-red-50 focus-within:border-red-500 focus-within:ring-red-500",
        success: "border-green-300 bg-green-50 focus-within:border-green-500 focus-within:ring-green-500",
        dragOver: "border-gray-500 bg-gray-100 scale-[1.02]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default",
    },
  }
);

export interface FileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof fileInputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  isRequired?: boolean;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  onFileSelect?: (files: FileList | null) => void;
  showPreview?: boolean;
  dragDropText?: string;
  browseText?: string;
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  ({
    className,
    variant,
    size,
    state,
    label,
    helperText,
    error,
    isRequired = false,
    maxSize,
    allowedTypes,
    onFileSelect,
    showPreview = false,
    dragDropText = "Drag and drop files here, or click to browse",
    browseText = "Browse files",
    ...props
  }, ref) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const inputState = error ? "error" : isDragOver ? "dragOver" : state;

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      const files = Array.from(e.dataTransfer.files);
      handleFileSelection(files);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      handleFileSelection(files);
      onFileSelect?.(e.target.files);
    };

    const handleFileSelection = (files: File[]) => {
      let validFiles = files;

      // Filter by allowed types
      if (allowedTypes && allowedTypes.length > 0) {
        validFiles = files.filter(file => 
          allowedTypes.some(type => file.type.includes(type) || file.name.toLowerCase().endsWith(type))
        );
      }

      // Filter by max size
      if (maxSize) {
        validFiles = validFiles.filter(file => file.size <= maxSize * 1024 * 1024);
      }

      setSelectedFiles(validFiles);
    };

    const handleBrowseClick = () => {
      inputRef.current?.click();
    };

    const removeFile = (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);
    };

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className={cn(
            "block text-sm font-medium text-slate-700 mb-2",
            error && "text-red-600",
            isRequired && "after:content-['*'] after:ml-1 after:text-red-500"
          )}>
            {label}
          </label>
        )}

        {/* File Input Container */}
        <div
          className={cn(fileInputVariants({ variant, size, state: inputState }), className)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={ref || inputRef}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            {...props}
          />

          <div className="text-center">
            {/* Upload Icon */}
            <div className="mx-auto mb-4 w-12 h-12 text-slate-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <p className="text-sm text-slate-600 font-medium">
                {dragDropText}
              </p>
              <button
                type="button"
                onClick={handleBrowseClick}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                {browseText}
              </button>
            </div>

            {/* File Type & Size Info */}
            {(allowedTypes || maxSize) && (
              <div className="mt-3 text-xs text-slate-500 space-y-1">
                {allowedTypes && (
                  <p>Supported: {allowedTypes.join(', ')}</p>
                )}
                {maxSize && (
                  <p>Max size: {maxSize}MB</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* File Preview */}
        {showPreview && selectedFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 w-6 h-6 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Helper Text / Error */}
        {(error || helperText) && (
          <p className={cn(
            "mt-1 text-xs",
            error ? "text-red-600" : "text-slate-500"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

FileInput.displayName = "FileInput";

export { FileInput };
