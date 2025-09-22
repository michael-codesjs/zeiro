"use client";

import { motion } from "framer-motion";
import { 
  Data, 
  Chart, 
  Activity, 
  Profile2User, 
  TrendUp, 
  Clock,
  TickCircle,
  Warning2,
  ArrowRight2,
  Refresh
} from "iconsax-reactjs";
import { cn } from "@/utils/cn";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  color?: string;
  delay?: number;
}

interface ActivityItem {
  id: string;
  type: 'query' | 'connection' | 'alert' | 'sync';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const MetricCard = ({ title, value, change, trend, icon: Icon, color = 'bg-gray-500', delay = 0 }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.4, type: "spring" }}
    whileHover={{ y: -4, scale: 1.02 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
        {change && (
          <div className={cn(
            "flex items-center text-sm font-medium",
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-600'
          )}>
            <TrendUp size={14} className={cn(
              "mr-1",
              trend === 'down' && 'rotate-180'
            )} />
            {change}
          </div>
        )}
      </div>
      <motion.div 
        className={cn("p-3 rounded-xl", color)}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <Icon size={24} className="text-white" />
      </motion.div>
    </div>
  </motion.div>
);

const ActivityCard = ({ activities, delay = 0 }: { activities: ActivityItem[], delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
      <motion.button 
        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
        whileHover={{ rotate: 180 }}
        transition={{ duration: 0.3 }}
      >
        <Refresh size={18} />
      </motion.button>
    </div>
    
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + (index * 0.1) }}
          className="flex items-start space-x-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
        >
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            activity.status === 'success' ? 'bg-green-100 text-green-600' :
            activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
            activity.status === 'error' ? 'bg-red-100 text-red-600' :
            'bg-blue-100 text-blue-600'
          )}>
            {activity.type === 'query' && <Chart size={16} />}
            {activity.type === 'connection' && <Data size={16} />}
            {activity.type === 'alert' && <Warning2 size={16} />}
            {activity.type === 'sync' && <Refresh size={16} />}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{activity.title}</p>
            <p className="text-xs text-slate-500 truncate">{activity.description}</p>
            <p className="text-xs text-slate-400 mt-1">{activity.timestamp}</p>
          </div>
          
          <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
        </motion.div>
      ))}
    </div>
    
    <motion.button 
      className="w-full mt-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      View all activity
    </motion.button>
  </motion.div>
);

const QuickStatsCard = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4, type: "spring" }}
    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <h3 className="text-lg font-semibold mb-6">Quick Stats</h3>
    
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: 'Queries Today', value: '1,247', icon: Chart },
        { label: 'Active Users', value: '23', icon: Profile2User },
        { label: 'Uptime', value: '99.9%', icon: TickCircle },
        { label: 'Avg Response', value: '45ms', icon: Clock },
      ].map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + (index * 0.1) }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <stat.icon size={20} className="text-gray-300" />
            <span className="text-2xl font-bold">{stat.value}</span>
          </div>
          <p className="text-sm text-gray-300">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default function DashboardCards() {
  const metrics = [
    { title: 'Total Data Sources', value: '12', change: '+2 this week', trend: 'up' as const, icon: Data, color: 'bg-blue-500' },
    { title: 'Active Connections', value: '8', change: 'All healthy', trend: 'neutral' as const, icon: Activity, color: 'bg-green-500' },
    { title: 'Queries This Month', value: '45.2K', change: '+12.5%', trend: 'up' as const, icon: Chart, color: 'bg-purple-500' },
    { title: 'Storage Used', value: '2.4 GB', change: '+156 MB', trend: 'up' as const, icon: Data, color: 'bg-orange-500' },
  ];

  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'query',
      title: 'Complex JOIN query executed',
      description: 'PostgreSQL - users table joined with orders',
      timestamp: '2 minutes ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'connection',
      title: 'New data source connected',
      description: 'MongoDB cluster "production-db" added',
      timestamp: '1 hour ago',
      status: 'success'
    },
    {
      id: '3',
      type: 'alert',
      title: 'High memory usage detected',
      description: 'Redis instance approaching 85% capacity',
      timestamp: '3 hours ago',
      status: 'warning'
    },
    {
      id: '4',
      type: 'sync',
      title: 'Schema sync completed',
      description: 'Updated 15 tables, 3 new columns detected',
      timestamp: '5 hours ago',
      status: 'info'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.title}
            {...metric}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Activity and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityCard activities={activities} delay={0.4} />
        </div>
        <div>
          <QuickStatsCard delay={0.5} />
        </div>
      </div>
    </div>
  );
}
