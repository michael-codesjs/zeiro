import { type Database } from "../../../hooks/use-data-sources";
import { type QueryResult, type ChartData } from "../../../hooks/use-natural-language-query";

export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  queryResult?: QueryResult;
  chartData?: ChartData;
  isAnimating?: boolean;
  queryStatus?: 'generating' | 'pending_approval' | 'executing' | 'completed' | 'failed';
  queryId?: string;
  executionId?: string;
  queryParameters?: any;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
}

export interface Thread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  database_id: string;
}

export interface ThreadManagementResponse {
  success: boolean;
  data?: {
    thread_id?: string;
    threads?: Thread[];
    thread?: any;
    message?: string;
  };
  error?: string;
}

export interface AiChatProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  selectedDatabase?: Database | null;
  onChartDataUpdate?: (chartData: ChartData | null) => void;
} 