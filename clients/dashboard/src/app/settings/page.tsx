"use client";

import { useState } from "react";
import { Button, Switch, Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui";
import { useSettings } from "../../hooks/use-settings";
import { 
  Setting2, 
  Cpu, 
  Notification, 
  ColorSwatch, 
  Security,
  InfoCircle,
  Save2,
  RefreshSquare,
  TickCircle
} from "iconsax-reactjs";

type SettingsSection = 'general' | 'models' | 'notifications' | 'appearance' | 'privacy';

const settingsSections = [
  { id: 'general' as const, label: 'General', icon: Setting2 },
  { id: 'models' as const, label: 'Models', icon: Cpu },
  { id: 'notifications' as const, label: 'Notifications', icon: Notification },
  { id: 'appearance' as const, label: 'Appearance', icon: ColorSwatch },
  { id: 'privacy' as const, label: 'Privacy', icon: Security },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const { settings, isLoading, hasChanges, updateGeneralSettings, toggleModel, saveSettings, resetToDefaults } = useSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const renderGeneralSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-6">General Preferences</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
            <div>
              <h4 className="font-medium text-slate-900">Auto-save queries</h4>
              <p className="text-sm text-slate-500 mt-1">Automatically save your queries as you type</p>
            </div>
            <Switch
              checked={settings.general.autoSave}
              onChange={(e) => updateGeneralSettings({ autoSave: e.target.checked })}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
            <div>
              <h4 className="font-medium text-slate-900">Enable notifications</h4>
              <p className="text-sm text-slate-500 mt-1">Receive notifications about query completion and errors</p>
            </div>
            <Switch
              checked={settings.general.notifications}
              onChange={(e) => updateGeneralSettings({ notifications: e.target.checked })}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Query Settings</h3>
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <label className="block font-medium text-slate-900 mb-2">
            Query Timeout
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              min="5"
              max="300"
              value={settings.general.maxQueryTimeout}
              onChange={(e) => updateGeneralSettings({ maxQueryTimeout: parseInt(e.target.value) })}
              className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-500">seconds</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Maximum time to wait for query results</p>
        </div>
      </div>
    </div>
  );

  const renderModelsSettings = () => (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">AI Models</h3>
          <p className="text-sm text-slate-500 mt-1">Choose which AI models are available for query generation and assistance</p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium">
          <InfoCircle size="14" />
          <span>Some models require MAX plan</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settings.models.map((model) => (
          <div 
            key={model.id} 
            className={`relative p-4 bg-white rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              model.enabled 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => toggleModel(model.id)}
          >
            {model.enabled && (
              <div className="absolute top-3 right-3">
                <TickCircle size="20" className="text-indigo-600" variant="Bold" />
              </div>
            )}
            
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-medium text-slate-900">{model.name}</h4>
              {model.maxOnly && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                  MAX
                </span>
              )}
            </div>
            
            {model.description && (
              <p className="text-sm text-slate-500 mb-3">{model.description}</p>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
                {model.provider}
              </span>
              <Switch
                checked={model.enabled}
                onChange={() => toggleModel(model.id)}
                size="sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 rounded-lg p-6">
        <h4 className="font-medium text-slate-900 mb-3">Model Providers</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-slate-700">Anthropic:</strong>
            <p className="text-slate-500">Claude models for reasoning and analysis</p>
          </div>
          <div>
            <strong className="text-slate-700">OpenAI:</strong>
            <p className="text-slate-500">GPT models for general tasks</p>
          </div>
          <div>
            <strong className="text-slate-700">Google:</strong>
            <p className="text-slate-500">Gemini models for multimodal capabilities</p>
          </div>
          <div>
            <strong className="text-slate-700">Meta:</strong>
            <p className="text-slate-500">Llama models for open-source solutions</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Theme</h3>
        <p className="text-sm text-slate-500 mt-1">Choose your preferred color scheme</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['light', 'dark', 'system'].map((theme) => (
          <div 
            key={theme}
            className={`relative p-4 bg-white rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              settings.general.theme === theme 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => updateGeneralSettings({ theme: theme as 'light' | 'dark' | 'system' })}
          >
            {settings.general.theme === theme && (
              <div className="absolute top-3 right-3">
                <TickCircle size="20" className="text-indigo-600" variant="Bold" />
              </div>
            )}
            
            <div className="aspect-video bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
              <div className={`w-12 h-8 rounded ${
                theme === 'light' ? 'bg-white border border-slate-200' :
                theme === 'dark' ? 'bg-slate-800' :
                'bg-gradient-to-r from-white to-slate-800'
              }`}></div>
            </div>
            
            <h4 className="font-medium text-slate-900 capitalize">{theme}</h4>
            <p className="text-sm text-slate-500">
              {theme === 'light' && 'Light appearance'}
              {theme === 'dark' && 'Dark appearance'}
              {theme === 'system' && 'Match system setting'}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          Dark mode implementation is coming soon in a future update.
        </p>
      </div>
    </div>
  );

  const renderNotificationsSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Notification Preferences</h3>
        <p className="text-sm text-slate-500 mt-1">Choose how you want to be notified</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
          <div>
            <h4 className="font-medium text-slate-900">Desktop notifications</h4>
            <p className="text-sm text-slate-500 mt-1">Show desktop notifications for query completion</p>
          </div>
          <Switch
            checked={settings.general.notifications}
            onChange={(e) => updateGeneralSettings({ notifications: e.target.checked })}
          />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 opacity-60">
          <div>
            <h4 className="font-medium text-slate-900">Email notifications</h4>
            <p className="text-sm text-slate-500 mt-1">Receive email updates about your account</p>
          </div>
          <Switch checked={false} disabled />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 opacity-60">
          <div>
            <h4 className="font-medium text-slate-900">Push notifications</h4>
            <p className="text-sm text-slate-500 mt-1">Receive push notifications on mobile devices</p>
          </div>
          <Switch checked={false} disabled />
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          Additional notification settings are coming soon in a future update.
        </p>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Privacy & Security</h3>
        <p className="text-sm text-slate-500 mt-1">Control your data and privacy settings</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 opacity-60">
          <div>
            <h4 className="font-medium text-slate-900">Analytics</h4>
            <p className="text-sm text-slate-500 mt-1">Help improve Zeiro by sharing anonymous usage data</p>
          </div>
          <Switch checked={false} disabled />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 opacity-60">
          <div>
            <h4 className="font-medium text-slate-900">Error reporting</h4>
            <p className="text-sm text-slate-500 mt-1">Automatically send error reports to help fix issues</p>
          </div>
          <Switch checked={false} disabled />
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-sm text-slate-600">
          Privacy settings are currently being developed and will be available soon.
        </p>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 h-16 bg-white border-b border-slate-200">
        <div className="w-full h-full mx-auto px-8">
          <div className="flex items-center justify-between h-full">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            </div>
            
            {/* Save Controls in Header */}
            {hasChanges && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-amber-600">
                  <InfoCircle size="16" />
                  <span className="text-sm font-medium">Unsaved changes</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetToDefaults}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={saveSettings}
                  >
                    Save changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-6">
          {/* Tabs */}
          <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as SettingsSection)}>
            <TabsList className="w-full mb-8">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    icon={<Icon size="16" />}
                  >
                    {section.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="general">
              {renderGeneralSettings()}
            </TabsContent>

            <TabsContent value="models">
              {renderModelsSettings()}
            </TabsContent>

            <TabsContent value="notifications">
              {renderNotificationsSettings()}
            </TabsContent>

            <TabsContent value="appearance">
              {renderAppearanceSettings()}
            </TabsContent>

            <TabsContent value="privacy">
              {renderPrivacySettings()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 