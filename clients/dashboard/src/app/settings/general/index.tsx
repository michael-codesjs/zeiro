"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select, ErrorState } from "../../../components/ui";
import { useUser } from "../../../data/user";
import { useSettings } from "../../../hooks/use-settings";
import { 
  User, 
  Setting2, 
  Notification, 
  Moon, 
  Sun, 
  Monitor,
  Lock,
  Camera,
  DocumentDownload
} from "iconsax-reactjs";

// Form validation schema
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function ProfileSection() {
  const { user, isUpdating, updateUser } = useUser();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name,
      email: user?.email,
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateUser(data);
      reset(data); // Reset form state to mark as not dirty
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const getInitials = () => {
    if (!user) return '';
    if (user.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    if (user.email) return user.email[0].toUpperCase();
    return 'U';
  };

  const getDisplayName = () => {
    if (!user) return '';
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Information</h1>
              <p className="text-gray-600 mt-1">Update your personal information and profile details</p>
            </div>
          </div>
          
          {isDirty && (
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isUpdating}
              loading={isUpdating}
              leftIcon={<DocumentDownload size="16" />}
            >
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center space-x-6 p-6 bg-white border border-gray-200 rounded-lg">
        <div className="relative">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-semibold">{getInitials()}</span>
            </div>
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Camera size="16" className="text-gray-600" />
          </button>
        </div>
        
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-900">{getDisplayName()}</h4>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500">
                Email verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Name"
          {...register('name')}
          placeholder="Enter your full name"
          helperText="This is how your name will appear to others"
          error={errors.name?.message}
        />
        
        <Input
          label="Email Address"
          type="email"
          {...register('email')}
          placeholder="Enter your email address"
          error={errors.email?.message}
        />
      </div>
    </form>
  );
}

interface PreferencesSectionProps {
  settings: any;
  updateGeneralSettings: (updates: any) => void;
  hasChanges: boolean;
  saveSettings: () => void;
}

function PreferencesSection({ settings, updateGeneralSettings, hasChanges, saveSettings }: PreferencesSectionProps) {
  const themeOptions = [
    { value: 'light', label: 'Light', icon: <Sun size="16" /> },
    { value: 'dark', label: 'Dark', icon: <Moon size="16" /> },
    { value: 'system', label: 'System', icon: <Monitor size="16" /> },
  ];

  const timeoutOptions = [
    { value: '15', label: '15 seconds' },
    { value: '30', label: '30 seconds' },
    { value: '60', label: '1 minute' },
    { value: '120', label: '2 minutes' },
    { value: '300', label: '5 minutes' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Setting2 size="20" className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Preferences</h3>
            <p className="text-sm text-slate-500">Customize your application experience</p>
          </div>
        </div>
        
        {hasChanges && (
          <Button
            variant="primary"
            size="sm"
            onClick={saveSettings}
            leftIcon={<DocumentDownload size="16" />}
          >
            Save Preferences
          </Button>
        )}
      </div>

      {/* Preferences Form */}
      <div className="space-y-6">
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Theme Preference
          </label>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateGeneralSettings({ theme: option.value })}
                className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                  settings.general.theme === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                {option.icon}
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Auto-save Toggle */}
        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-slate-900">Auto-save</h4>
            <p className="text-sm text-slate-500">Automatically save your work as you type</p>
          </div>
          <button
            onClick={() => updateGeneralSettings({ autoSave: !settings.general.autoSave })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.general.autoSave ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.general.autoSave ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Notifications Toggle */}
        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Notification size="20" className="text-slate-500" />
            <div>
              <h4 className="text-sm font-medium text-slate-900">Notifications</h4>
              <p className="text-sm text-slate-500">Receive notifications about important updates</p>
            </div>
          </div>
          <button
            onClick={() => updateGeneralSettings({ notifications: !settings.general.notifications })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.general.notifications ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.general.notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Query Timeout */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Query Timeout
          </label>
          <Select
            value={settings.general.maxQueryTimeout.toString()}
            onValueChange={(value) => updateGeneralSettings({ maxQueryTimeout: parseInt(value) })}
            options={timeoutOptions}
            placeholder="Select timeout duration"
          />
          <p className="text-sm text-slate-500 mt-1">
            Maximum time to wait for query results before timing out
          </p>
        </div>
      </div>
    </div>
  );
}

function SecuritySection() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <Lock size="20" className="text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Security</h3>
          <p className="text-sm text-slate-500">Manage your account security settings</p>
        </div>
      </div>

      {/* Security Options */}
      <div className="space-y-4">
        {/* Change Password */}
        <div className="p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-slate-900">Password</h4>
              <p className="text-sm text-slate-500">Last changed 3 months ago</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingPassword(true)}
            >
              Change Password
            </Button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-slate-900">Two-Factor Authentication</h4>
              <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">Disabled</span>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="p-4 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-slate-900">Active Sessions</h4>
              <p className="text-sm text-slate-500">Manage devices that are signed into your account</p>
            </div>
            <Button variant="outline" size="sm">
              View Sessions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GeneralSettings() {

  const { user, loading, error } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Error loading profile"
        message={error}
        variant="compact"
        onRetry={() => window.location.reload()}
        retryText="Reload Page"
      />
    );
  }

  return (
    <div className="space-y-8 overflow-y-scroll">
      {/* Profile Section */}
      <ProfileSection />
    </div>
  );
}
