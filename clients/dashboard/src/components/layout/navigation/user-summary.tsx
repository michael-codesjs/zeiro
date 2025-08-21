"use client";

interface UserSummaryProps {
  sidebarCollapsed: boolean;
}

export default function UserSummary({ sidebarCollapsed }: UserSummaryProps) {
  // TODO: Replace with actual user data from auth context or API
  const user = {
    name: "Michael Phiri",
    email: "michael@zeiro.com",
    initials: "MP"
  };

  return (
    <div className="mt-8 p-4 border-t border-slate-200 dark:border-slate-700">
      <div className={`flex items-center space-x-3 px-3 py-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
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