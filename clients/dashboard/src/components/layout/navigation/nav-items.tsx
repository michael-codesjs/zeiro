"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  KeySquare, 
  Activity, 
  MonitorRecorder, 
  Data, 
  Setting2,
  ChartSquare,
  Box1,
  People
} from "iconsax-reactjs";

interface NavItemsProps {
  sidebarCollapsed: boolean;
}

export default function NavItems({ sidebarCollapsed }: NavItemsProps) {
  const pathname = usePathname();

  const navigationItems = [
    { id: "workbench", label: "Workbench", path: "/", icon: Home, enabled: true },
    { id: "data-sources", label: "Data Sources", path: "/data-sources", icon: Box1, enabled: true },
    { id: "credentials", label: "Credentials", path: "/credentials", icon: KeySquare, enabled: true },
    { id: "dashboards", label: "Dashboards", path: "/dashboards", icon: ChartSquare, enabled: false },
    { id: "migration-agent", label: "Migration Agent", path: "/migration-agent", icon: Data, enabled: false },
    { id: "settings", label: "Settings", path: "/settings", icon: Setting2, enabled: true },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="space-y-0.5">
      {navigationItems.map((item) => (
        <div key={item.id} className="relative group">
          {item.enabled ? (
            <Link
              href={item.path}
              className={`w-full flex items-center h-11 px-2 py-2.5 font-medium text-sm rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900/40'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              } ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'}`}
            >
              <item.icon 
                variant={isActive(item.path) ? "Bold" : "Outline"} 
                className={`w-5 h-5 flex-shrink-0 ${!sidebarCollapsed ? 'mr-3' : ''}`} 
              />
              {!sidebarCollapsed && (
                <span className="font-medium text-sm tracking-[-0.01em] truncate">
                  {item.label}
                </span>
              )}
            </Link>
          ) : (
            <div
              className={`w-full flex items-center h-11 px-3 py-2.5 font-medium text-sm rounded-xl text-slate-400 dark:text-slate-500 opacity-60 cursor-not-allowed ${
                sidebarCollapsed ? 'justify-center px-2' : 'justify-start'
              }`}
            >
              <item.icon 
                variant="Outline" 
                className={`w-5 h-5 flex-shrink-0 ${!sidebarCollapsed ? 'mr-3' : ''}`} 
              />
              {!sidebarCollapsed && (
                <span className="font-medium text-sm tracking-[-0.01em] truncate">
                  {item.label}
                </span>
              )}
            </div>
          )}
          
          {/* Custom Tooltip for Coming Soon Items */}
          {!item.enabled && (
                         <div className={`absolute z-50 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
               sidebarCollapsed 
                 ? 'left-full ml-2 top-1/2 transform -translate-y-1/2' 
                 : 'bottom-full mb-2 left-1/2 transform -translate-x-1/2'
             }`}>
              Coming Soon
                             <div className={`absolute w-1.5 h-1.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 transform rotate-45 ${
                 sidebarCollapsed 
                   ? 'left-0 top-1/2 -translate-y-1/2 -translate-x-0.5 border-r border-b' 
                   : 'top-full left-1/2 -translate-x-1/2 -translate-y-0.5 border-l border-t'
               }`}></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 