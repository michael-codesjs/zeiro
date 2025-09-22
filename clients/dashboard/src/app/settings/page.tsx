"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui";
import { useSettings } from "../../hooks/use-settings";
import { WorkspaceSettings } from "./workspace";
import GeneralSettings from "./general";
import { 
  InfoCircle,
  Setting2,
  People,
  Notification,
  ColorSwatch,
  Lock,
  Cpu
} from "iconsax-reactjs";

type SettingsSection = 'general' | 'workspaces';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const { settings, isLoading, hasChanges, updateGeneralSettings, toggleModel, saveSettings, resetToDefaults } = useSettings();
  const [workspaceHasChanges, setWorkspaceHasChanges] = useState(false);

  // Initialize active section from URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('activeTab') as SettingsSection;
    if (tabFromUrl && (tabFromUrl === 'general' || tabFromUrl === 'workspaces')) {
      setActiveSection(tabFromUrl);
    }
  }, [searchParams]);

  // Update URL when active section changes
  const handleTabChange = (value: string) => {
    const newSection = value as SettingsSection;
    setActiveSection(newSection);
    
    // Update URL with new tab
    const params = new URLSearchParams(searchParams.toString());
    params.set('activeTab', newSection);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen overflow-y-scroll w-full bg-slate-50">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <Tabs value={activeSection} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="general" icon={<Setting2 size="16" />}>
              General
            </TabsTrigger>
            <TabsTrigger value="workspaces" icon={<People size="16" />}>
              Workspaces
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="bg-white rounded-xl border border-gray-200 p-6">
            <GeneralSettings />
          </TabsContent>

          <TabsContent value="workspaces" className="bg-white rounded-xl border border-gray-200 p-6">
            <WorkspaceSettings  />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 