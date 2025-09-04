import React from 'react';
import { Button } from '../../../ui';
import { Model } from '../types';
import { ArrowDown2 } from 'iconsax-reactjs';

interface ModelSelectorProps {
  selectedModel: Model | null;
  models: Model[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (model: Model) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  models,
  isOpen,
  onToggle,
  onSelect
}) => {
  return (
    <div className="relative model-selector">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="p-0 h-auto text-xs text-slate-500 hover:text-slate-700"
      >
        <span className="flex items-center space-x-1">
          <span>{selectedModel?.name || 'Select model'}</span>
          <ArrowDown2 className="w-3 h-3" />
        </span>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          <div className="p-2 space-y-1">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onSelect(model);
                  onToggle();
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-slate-100 ${
                  selectedModel?.id === model.id ? 'bg-slate-100' : ''
                }`}
              >
                <div className="font-medium">{model.name}</div>
                <div className="text-xs text-slate-500">{model.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
