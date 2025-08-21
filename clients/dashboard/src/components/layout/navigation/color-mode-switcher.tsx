"use client";

import { useState, useEffect } from "react";
import { Moon, Sun1 } from "iconsax-reactjs";
import { Button } from "../../ui/button";

interface ColorModeSwitcherProps {
  sidebarCollapsed: boolean;
}

export default function ColorModeSwitcher({ sidebarCollapsed }: ColorModeSwitcherProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleColorMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (sidebarCollapsed) {
    // Simple icon button when sidebar is collapsed
    return (
      <div className="relative group">
        <Button
          onClick={toggleColorMode}
          variant="ghost"
          size="sm"
          className="w-full h-10 p-0"
        >
          {isDark ? (
            <Sun1 variant="Bold" className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon variant="Bold" className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          )}
        </Button>
        
        {/* Tooltip for collapsed sidebar */}
        <div className="absolute z-50 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none left-full ml-2 top-1/2 transform -translate-y-1/2">
          {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          <div className="absolute w-1.5 h-1.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 transform rotate-45 left-0 top-1/2 -translate-y-1/2 -translate-x-0.5 border-r border-b"></div>
        </div>
      </div>
    );
  }

  // Toggle switch when sidebar is expanded
  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-start">
        {/* Toggle Switch */}
        <button
          onClick={toggleColorMode}
          className="relative inline-flex h-12 w-24 items-center rounded-full transition-all duration-300 focus:outline-none bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 shadow-sm"
        >
          {/* Left Circle - Light Mode */}
          <div className={`absolute left-1 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            !isDark 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
              : 'bg-transparent'
          }`}>
            <Sun1 variant="Bold" className={`w-6 h-6 transition-colors duration-300 ${
              !isDark ? 'text-white' : 'text-slate-400 dark:text-slate-500'
            }`} />
          </div>
          
          {/* Right Circle - Dark Mode */}
          <div className={`absolute right-1 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            isDark 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
              : 'bg-transparent'
          }`}>
            <Moon variant="Bold" className={`w-6 h-6 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-slate-400 dark:text-slate-500'
            }`} />
          </div>
        </button>
      </div>
    </div>
  );
} 