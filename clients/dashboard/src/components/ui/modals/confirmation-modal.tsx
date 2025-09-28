"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "./modal";
import { Button } from "../buttons/button";
import { Warning2, InfoCircle } from "iconsax-reactjs";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'danger',
  isLoading = false
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
      case 'warning':
        return <Warning2 size="24" className="text-red-500" />;
      default:
        return <InfoCircle size="24" className="text-blue-500" />;
    }
  };

  const getConfirmVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger' as const;
      case 'warning':
        return 'danger' as const;
      default:
        return 'primary' as const;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>
        </ModalHeader>
        
        <ModalBody>
          <p className="text-sm text-slate-600">{message}</p>
        </ModalBody>
        
        <ModalFooter>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={getConfirmVariant()}
              onClick={onConfirm}
              loading={isLoading}
              disabled={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
