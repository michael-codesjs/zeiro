"use client";

import { useUserProfile } from "../../../hooks/use-user-profile";

interface UserSummaryProps {
  sidebarCollapsed: boolean;
}

export default function UserSummary({ sidebarCollapsed }: UserSummaryProps) {
  const { profile, getInitials, getDisplayName } = useUserProfile();
  
  // Fallback data while loading or if no profile
  const user = {
    name: profile ? getDisplayName() : "Loading...",
    email: profile?.email || "Loading...",
    initials: profile ? getInitials() : "?"
  };

  return (
    <div className="mt-8 p-4">
      <div className={`flex items-center space-x-3 px-3 py-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 min-w-8 min-h-8 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">{user.initials}</span>
        </div>
        {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
             <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
             <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
           </div>
        )}
      </div>
    </div>
  );
} 