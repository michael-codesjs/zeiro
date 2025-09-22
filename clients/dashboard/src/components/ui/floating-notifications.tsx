"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  TickCircle, 
  Warning2, 
  InfoCircle, 
  CloseCircle,
  Notification
} from "iconsax-reactjs";
import { cn } from "@/utils/cn";

type NotificationType = 'success' | 'warning' | 'error' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface FloatingNotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const notificationConfig = {
  success: {
    icon: TickCircle,
    bgColor: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
    messageColor: 'text-green-700'
  },
  warning: {
    icon: Warning2,
    bgColor: 'bg-yellow-50 border-yellow-200',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-900',
    messageColor: 'text-yellow-700'
  },
  error: {
    icon: CloseCircle,
    bgColor: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    messageColor: 'text-red-700'
  },
  info: {
    icon: InfoCircle,
    bgColor: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    messageColor: 'text-blue-700'
  }
};

const NotificationItem = ({ 
  notification, 
  onDismiss, 
  index 
}: { 
  notification: Notification; 
  onDismiss: (id: string) => void;
  index: number;
}) => {
  const config = notificationConfig[notification.type];
  const Icon = config.icon;

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(notification.id);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ 
        delay: index * 0.1,
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
      whileHover={{ scale: 1.02, x: -4 }}
      className={cn(
        "relative max-w-sm w-full p-4 rounded-xl border shadow-lg backdrop-blur-sm",
        config.bgColor,
        "cursor-pointer group"
      )}
      onClick={() => onDismiss(notification.id)}
    >
      {/* Progress bar for timed notifications */}
      {notification.duration && notification.duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current rounded-b-xl opacity-30"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: notification.duration / 1000, ease: "linear" }}
        />
      )}

      <div className="flex items-start space-x-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
          className="flex-shrink-0"
        >
          <Icon size={24} className={config.iconColor} />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <motion.h4 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.1 }}
            className={cn("text-sm font-semibold", config.titleColor)}
          >
            {notification.title}
          </motion.h4>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className={cn("text-sm mt-1", config.messageColor)}
          >
            {notification.message}
          </motion.p>
          
          {notification.action && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              onClick={(e) => {
                e.stopPropagation();
                notification.action?.onClick();
              }}
              className={cn(
                "text-sm font-medium mt-2 hover:underline",
                config.titleColor
              )}
            >
              {notification.action.label}
            </motion.button>
          )}
        </div>
        
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 + 0.4 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex-shrink-0 text-slate-400 hover:text-slate-600 group-hover:opacity-100 opacity-0 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification.id);
          }}
        >
          <CloseCircle size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function FloatingNotifications({ 
  notifications, 
  onDismiss 
}: FloatingNotificationsProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem
              notification={notification}
              onDismiss={onDismiss}
              index={index}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000 // Default 5 seconds
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Convenience methods
  const success = (title: string, message: string, options?: Partial<Notification>) =>
    addNotification({ type: 'success', title, message, ...options });

  const error = (title: string, message: string, options?: Partial<Notification>) =>
    addNotification({ type: 'error', title, message, ...options });

  const warning = (title: string, message: string, options?: Partial<Notification>) =>
    addNotification({ type: 'warning', title, message, ...options });

  const info = (title: string, message: string, options?: Partial<Notification>) =>
    addNotification({ type: 'info', title, message, ...options });

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };
}
