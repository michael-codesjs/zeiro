import { createContext, useContext, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface TabsContextValue {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ activeTab: value, onTabChange: onValueChange }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn(
      "flex h-10 items-center rounded-lg bg-slate-100 p-1 text-slate-500",
      className
    )}>
      {children}
    </div>
  );
}

function TabsTrigger({ value, children, className, icon }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component");
  }

  const { activeTab, onTabChange } = context;
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => onTabChange(value)}
      className={cn(
        "flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white text-slate-950 shadow-sm"
          : "text-slate-500 hover:text-slate-900",
        className
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}

function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsContent must be used within a Tabs component");
  }

  const { activeTab } = context;
  
  if (activeTab !== value) {
    return null;
  }

  return (
    <div className={cn("mt-6 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2", className)}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent }; 