import React from 'react';
import { ArrowDown2 } from 'iconsax-reactjs';
import { Model } from '../types';

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
    <div className="relative mt-1 model-selector">
      <button
        onClick={onToggle}
        className="flex items-center space-x-1 text-xs transition-colors"
      >
        <span className="text-slate-700 text-xs max-w-28 truncate">
          {selectedModel ? selectedModel.name : 'Model'}
        </span>
        <ArrowDown2 
          size={12} 
          className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          <div className="p-1">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onSelect(model);
                  onToggle();
                }}
                className={`w-full flex items-start space-x-3 px-3 py-2 rounded-lg text-left hover:bg-slate-50 transition-colors ${
                  selectedModel?.id === model.id ? 'bg-indigo-50 border border-indigo-200' : ''
                }`}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {model.name}
                    </p>
                    <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {model.provider}
                    </span>
                  </div>
                  {model.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{model.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 