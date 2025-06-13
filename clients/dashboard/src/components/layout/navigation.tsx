"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navigation() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    { id: "workbench", label: "Workbench", path: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", enabled: true },
    { id: "performance", label: "Performance", path: "/performance", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", enabled: false },
    { id: "monitoring", label: "Monitoring", path: "/monitoring", icon: "M13 10V3L4 14h7v7l9-11h-7z", enabled: false },
    { id: "migration-agent", label: "Migration Agent", path: "/migration-agent", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", enabled: false },
    { id: "settings", label: "Settings", path: "/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", enabled: true },
  ];

  const handleNavigation = (item: typeof navigationItems[0]) => {
    if (item.enabled) {
      router.push(item.path);
    }
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <div className={`bg-white flex flex-col border-r border-slate-200 transition-all duration-300 ease-in-out ${
      sidebarCollapsed ? 'w-24' : 'w-64'
    }`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 space-x-2 border-b border-slate-200 h-16 min-h-16">
        <div className={`flex items-center space-x-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Z</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-lg"
        >
          <svg 
            className={`w-4 h-4 text-slate-600 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 h-full">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <div key={item.id} className="relative group">
              <button
                onClick={() => handleNavigation(item)}
                disabled={!item.enabled}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-colors ${
                  item.enabled && isActive(item.path)
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : item.enabled
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-slate-500 cursor-not-allowed opacity-70'
                } ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {!sidebarCollapsed && (
                  <span className="font-medium overflow-x-hidden inline-block">{item.label}</span>
                )}
              </button>
              
              {/* Custom Tooltip for Coming Soon Items */}
              {!item.enabled && (
                <div className={`absolute z-50 px-2 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
                  sidebarCollapsed 
                    ? 'left-full ml-2 top-1/2 transform -translate-y-1/2' 
                    : 'bottom-full mb-2 left-1/2 transform -translate-x-1/2'
                }`}>
                  Coming Soon
                  <div className={`absolute w-1.5 h-1.5 bg-white border-slate-200 transform rotate-45 ${
                    sidebarCollapsed 
                      ? 'left-0 top-1/2 -translate-y-1/2 -translate-x-0.5 border-r border-b' 
                      : 'top-full left-1/2 -translate-x-1/2 -translate-y-0.5 border-l border-t'
                  }`}></div>
                </div>
              )}
            </div>
          ))}
                  </div>

          {/* Recent Connections */}
          <div className="mt-4">
                <div className="space-y-1">
                <div className={`flex items-center rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
                  sidebarCollapsed ? 'justify-center px-3 py-2' : 'space-x-3 px-3 py-2'
                }`}>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-600">ED</span>
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">Ecommerce Data</p>
                      <p className="text-xs text-slate-500 truncate">PostgreSQL • 12 tables</p>
                    </div>
                  )}
                </div>
                <div className={`flex items-center rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
                  sidebarCollapsed ? 'justify-center px-3 py-2' : 'space-x-3 px-3 py-2'
                }`}>
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-semibold text-orange-600">UA</span>
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">User Analytics</p>
                      <p className="text-xs text-slate-500 truncate">MySQL • 8 tables</p>
                    </div>
                  )}
                </div>
                <div className={`flex items-center rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
                  sidebarCollapsed ? 'justify-center px-3 py-2' : 'space-x-3 px-3 py-2'
                }`}>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-semibold text-green-600">IM</span>
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">Inventory Management</p>
                      <p className="text-xs text-slate-500 truncate">MongoDB • 15 collections</p>
                    </div>
                  )}
                </div>
                <div className={`flex items-center rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
                  sidebarCollapsed ? 'justify-center px-3 py-2' : 'space-x-3 px-3 py-2'
                }`}>
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-semibold text-purple-600">CR</span>
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">Customer Relations</p>
                      <p className="text-xs text-slate-500 truncate">PostgreSQL • 7 tables</p>
                    </div>
                  )}
                </div>
                <div className={`flex items-center rounded-lg hover:bg-slate-50 transition-colors cursor-pointer ${
                  sidebarCollapsed ? 'justify-center px-3 py-2' : 'space-x-3 px-3 py-2'
                }`}>
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-semibold text-red-600">LG</span>
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">Logs & Events</p>
                      <p className="text-xs text-slate-500 truncate">ClickHouse • 3 tables</p>
                    </div>
                  )}
                </div>
              </div>
          </div>
          
       </nav>
      <div className="mt-8 p-4 border-t border-slate-200">
          <div className={`flex items-center space-x-3 px-3 py-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">MP</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">Michael Phiri</p>
                <p className="text-xs text-slate-500 truncate">michael@zeiro.com</p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
} 