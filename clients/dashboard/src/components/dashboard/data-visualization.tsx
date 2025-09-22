"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Chart, 
  TrendUp, 
  Calendar, 
  Filter,
  MoreSquare,
  ArrowRight,
  Eye,
  DocumentDownload
} from "iconsax-reactjs";
import { cn } from "@/utils/cn";

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

const AnimatedChart = ({ data, type = 'bar', delay = 0 }: { 
  data: ChartData[], 
  type?: 'bar' | 'line' | 'pie',
  delay?: number 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  if (type === 'bar') {
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + (index * 0.1), duration: 0.4 }}
            className="flex items-center space-x-4"
          >
            <div className="w-20 text-sm text-slate-600 truncate">{item.name}</div>
            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                transition={{ delay: delay + (index * 0.1) + 0.2, duration: 0.8, ease: "easeOut" }}
                className={cn("h-full rounded-full", item.color || 'bg-blue-500')}
              />
            </div>
            <div className="w-12 text-sm font-medium text-slate-900 text-right">
              {item.value.toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;
    
    return (
      <div className="flex items-center space-x-8">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay, duration: 0.6, type: "spring" }}
          className="relative w-32 h-32"
        >
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = -cumulativePercentage;
              cumulativePercentage += percentage;
              
              return (
                <motion.circle
                  key={item.name}
                  cx="50"
                  cy="50"
                  r="15.915"
                  fill="transparent"
                  stroke={item.color || `hsl(${index * 60}, 70%, 50%)`}
                  strokeWidth="6"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  initial={{ strokeDasharray: "0 100" }}
                  animate={{ strokeDasharray }}
                  transition={{ delay: delay + (index * 0.2), duration: 0.8 }}
                  className="drop-shadow-sm"
                />
              );
            })}
          </svg>
        </motion.div>
        
        <div className="space-y-2">
          {data.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + (index * 0.1) }}
              className="flex items-center space-x-3"
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}
              />
              <span className="text-sm text-slate-600">{item.name}</span>
              <span className="text-sm font-medium text-slate-900">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  color = 'bg-blue-500',
  delay = 0 
}: {
  title: string;
  value: string;
  subtitle: string;
  trend?: 'up' | 'down';
  color?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-white rounded-xl p-6 border border-slate-100 hover:shadow-lg transition-all duration-300 group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={cn("p-2 rounded-lg", color)}>
        <Chart size={20} className="text-white" />
      </div>
      {trend && (
        <motion.div 
          className={cn(
            "flex items-center text-xs font-medium px-2 py-1 rounded-full",
            trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}
          whileHover={{ scale: 1.05 }}
        >
          <TrendUp size={12} className={cn("mr-1", trend === 'down' && 'rotate-180')} />
          {trend === 'up' ? '+12.5%' : '-3.2%'}
        </motion.div>
      )}
    </div>
    
    <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mb-2">{value}</p>
    <p className="text-xs text-slate-500">{subtitle}</p>
    
    <motion.button 
      className="mt-4 text-xs text-slate-400 hover:text-slate-600 flex items-center group-hover:translate-x-1 transition-all duration-200"
      whileHover={{ x: 4 }}
    >
      View details <ArrowRight size={12} className="ml-1" />
    </motion.button>
  </motion.div>
);

export default function DataVisualization() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  
  const queryData = [
    { name: 'SELECT', value: 1247, color: 'bg-blue-500' },
    { name: 'INSERT', value: 892, color: 'bg-green-500' },
    { name: 'UPDATE', value: 634, color: 'bg-yellow-500' },
    { name: 'DELETE', value: 156, color: 'bg-red-500' },
  ];

  const databaseUsage = [
    { name: 'PostgreSQL', value: 45, color: '#3B82F6' },
    { name: 'MongoDB', value: 30, color: '#10B981' },
    { name: 'Redis', value: 15, color: '#F59E0B' },
    { name: 'MySQL', value: 10, color: '#EF4444' },
  ];

  const performanceData = [
    { name: 'Mon', value: 245 },
    { name: 'Tue', value: 312 },
    { name: 'Wed', value: 189 },
    { name: 'Thu', value: 398 },
    { name: 'Fri', value: 456 },
    { name: 'Sat', value: 289 },
    { name: 'Sun', value: 167 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600 mt-1">Real-time insights into your data operations</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none"
            whileHover={{ scale: 1.02 }}
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </motion.select>
          
          <motion.button 
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Filter size={18} />
          </motion.button>
          
          <motion.button 
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <DocumentDownload size={18} />
          </motion.button>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Queries"
          value="2,847"
          subtitle="Last 7 days"
          trend="up"
          color="bg-blue-500"
          delay={0.1}
        />
        <MetricCard
          title="Avg Response Time"
          value="45ms"
          subtitle="P95: 120ms"
          trend="down"
          color="bg-green-500"
          delay={0.2}
        />
        <MetricCard
          title="Active Connections"
          value="23"
          subtitle="Peak: 45 today"
          trend="up"
          color="bg-purple-500"
          delay={0.3}
        />
        <MetricCard
          title="Error Rate"
          value="0.3%"
          subtitle="SLA: < 1%"
          trend="down"
          color="bg-orange-500"
          delay={0.4}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Query Types Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Query Types Distribution</h3>
            <motion.button 
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
              whileHover={{ scale: 1.1 }}
            >
              <MoreSquare size={18} />
            </motion.button>
          </div>
          <AnimatedChart data={queryData} type="bar" delay={0.6} />
        </motion.div>

        {/* Database Usage Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Database Usage</h3>
            <motion.button 
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
              whileHover={{ scale: 1.1 }}
            >
              <Eye size={18} />
            </motion.button>
          </div>
          <AnimatedChart data={databaseUsage} type="pie" delay={0.7} />
        </motion.div>
      </div>

      {/* Performance Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Weekly Performance</h3>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Calendar size={16} />
            <span>Last 7 days</span>
          </div>
        </div>
        
        <div className="h-64 flex items-end space-x-4">
          {performanceData.map((day, index) => {
            const maxValue = Math.max(...performanceData.map(d => d.value));
            const height = (day.value / maxValue) * 100;
            
            return (
              <div key={day.name} className="flex-1 flex flex-col items-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.9 + (index * 0.1), duration: 0.6, ease: "easeOut" }}
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg mb-2 min-h-[4px] hover:from-blue-600 hover:to-blue-500 transition-colors cursor-pointer group relative"
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.value}
                  </div>
                </motion.div>
                <span className="text-xs text-slate-600 font-medium">{day.name}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
