"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarLeft } from "iconsax-reactjs";
import NavItems from "./nav-items";
import UserSummary from "./user-summary";
import RecentDatabaseConnections from "./recent-data-sources";
import { type Database } from "@/hooks/use-data-sources";

export default function Navigation() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const router = useRouter();

  return (
    <div className={`bg-white dark:bg-slate-900 overflow-hidden flex flex-col border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out ${
      sidebarCollapsed ? 'w-[76px]' : 'w-60'
    }`}>
      {/* Sidebar Header */}
      <div className={`flex items-center border-b border-slate-200 dark:border-slate-700 h-16 min-h-16 w-full ${
         sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4 space-x-2'
       }`}>
        <div 
          className={`flex items-center ${sidebarCollapsed ? 'cursor-pointer' : 'space-x-3'}`}
          onClick={sidebarCollapsed ? () => setSidebarCollapsed(false) : undefined}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Z</span>
          </div>
        </div>
        {!sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg"
          >
           <SidebarLeft />
          </button>
        )}
      </div>

      {/* Navigation Content */}
      <nav className="px-4 pt-6 pb-4 h-full flex flex-col">
        
        {/* Main Navigation Items */}
        <NavItems sidebarCollapsed={sidebarCollapsed} />

        {/* Recent Database Connections */}
        {/* <div className="mt-8 flex-1">
          <RecentDatabaseConnections 
            sidebarCollapsed={sidebarCollapsed}
            onDataSourceSelect={(database: Database) => {
              // Navigate to workbench with selected database
              router.push('/');
              // TODO: You might want to emit an event or use a context to pass the selected database to the workbench
            }}
          />
        </div> */}
      </nav>

      {/* User Summary */}
      <UserSummary sidebarCollapsed={sidebarCollapsed} />
    </div>
  );
} 