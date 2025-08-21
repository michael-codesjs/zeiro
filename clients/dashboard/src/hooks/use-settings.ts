import { useState, useEffect } from 'react';

export interface ModelSettings {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  maxOnly?: boolean;
  provider: 'anthropic' | 'openai' | 'google' | 'meta';
}

export interface GeneralSettings {
  theme: 'light' | 'dark' | 'system';
  autoSave: boolean;
  notifications: boolean;
  maxQueryTimeout: number;
  defaultDatabase?: string;
}

export interface Settings {
  general: GeneralSettings;
  models: ModelSettings[];
}

const defaultModels: ModelSettings[] = [
  {
    id: 'claude-4-sonnet',
    name: 'Claude 4 Sonnet',
    description: 'Latest Claude model with enhanced reasoning',
    enabled: true,
    provider: 'anthropic'
  },
  {
    id: 'claude-4-opus',
    name: 'Claude 4 Opus',
    description: 'Most capable Claude model for complex tasks',
    enabled: true,
    maxOnly: true,
    provider: 'anthropic'
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Fast and capable Claude model',
    enabled: true,
    provider: 'anthropic'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Latest GPT-4 model with improved performance',
    enabled: false,
    provider: 'openai'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Multimodal GPT-4 model',
    enabled: false,
    provider: 'openai'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: 'Google\'s advanced language model',
    enabled: false,
    provider: 'google'
  }
];

const defaultSettings: Settings = {
  general: {
    theme: 'system',
    autoSave: true,
    notifications: true,
    maxQueryTimeout: 30,
    defaultDatabase: undefined
  },
  models: defaultModels
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('zeiro-settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings({
          general: { ...defaultSettings.general, ...parsedSettings.general },
          models: parsedSettings.models || defaultModels
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('zeiro-settings', JSON.stringify(settings));
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // Update general settings
  const updateGeneralSettings = (updates: Partial<GeneralSettings>) => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, ...updates }
    }));
    setHasChanges(true);
  };

  // Toggle model enabled state
  const toggleModel = (modelId: string) => {
    setSettings(prev => ({
      ...prev,
      models: prev.models.map(model =>
        model.id === modelId
          ? { ...model, enabled: !model.enabled }
          : model
      )
    }));
    setHasChanges(true);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return {
    settings,
    isLoading,
    hasChanges,
    updateGeneralSettings,
    toggleModel,
    saveSettings,
    resetToDefaults
  };
} 