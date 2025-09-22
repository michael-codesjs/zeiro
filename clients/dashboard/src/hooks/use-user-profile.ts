"use client";

import { useState, useEffect } from 'react';
import { getCurrentUser, updateUserAttributes } from 'aws-amplify/auth';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  phone_number?: string;
  picture?: string;
  email_verified?: boolean;
  phone_number_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateUserProfileData {
  given_name?: string;
  family_name?: string;
  name?: string;
  phone_number?: string;
  picture?: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await getCurrentUser();
      
      // Transform Amplify user to our profile format
      const userProfile: UserProfile = {
        id: user.userId,
        username: user.username,
        email: user.signInDetails?.loginId || '',
        given_name: user.signInDetails?.loginId?.split('@')[0] || '', // Fallback from email
        family_name: '',
        name: user.signInDetails?.loginId?.split('@')[0] || '',
        phone_number: '',
        picture: '',
        email_verified: false,
        phone_number_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setProfile(userProfile);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates: UpdateUserProfileData) => {
    if (!profile) return;

    try {
      setIsUpdating(true);
      setError(null);

      // Update user attributes in Cognito
      const attributesToUpdate: Record<string, string> = {};
      
      if (updates.given_name !== undefined) {
        attributesToUpdate.given_name = updates.given_name;
      }
      if (updates.family_name !== undefined) {
        attributesToUpdate.family_name = updates.family_name;
      }
      if (updates.name !== undefined) {
        attributesToUpdate.name = updates.name;
      }
      if (updates.phone_number !== undefined) {
        attributesToUpdate.phone_number = updates.phone_number;
      }
      if (updates.picture !== undefined) {
        attributesToUpdate.picture = updates.picture;
      }

      await updateUserAttributes({
        userAttributes: attributesToUpdate,
      });

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        ...updates,
        updated_at: new Date().toISOString(),
      } : null);

      return true;
    } catch (err) {
      console.error('Failed to update user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Generate initials from name
  const getInitials = (profile: UserProfile | null): string => {
    if (!profile) return '';
    
    if (profile.given_name && profile.family_name) {
      return `${profile.given_name[0]}${profile.family_name[0]}`.toUpperCase();
    }
    
    if (profile.name) {
      const nameParts = profile.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
      }
      return profile.name[0].toUpperCase();
    }
    
    if (profile.email) {
      return profile.email[0].toUpperCase();
    }
    
    return profile.username[0].toUpperCase();
  };

  // Get display name
  const getDisplayName = (profile: UserProfile | null): string => {
    if (!profile) return '';
    
    if (profile.name) return profile.name;
    if (profile.given_name && profile.family_name) {
      return `${profile.given_name} ${profile.family_name}`;
    }
    if (profile.given_name) return profile.given_name;
    if (profile.email) return profile.email.split('@')[0];
    return profile.username;
  };

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    isLoading,
    isUpdating,
    error,
    updateProfile,
    refetchProfile: fetchProfile,
    getInitials: () => getInitials(profile),
    getDisplayName: () => getDisplayName(profile),
  };
}
