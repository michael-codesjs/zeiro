"use client";

import { useEffect, useRef } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useWebSocketStore } from '../stores/websocket-store';

export function WebSocketConnection() {
  const wsRef = useRef<WebSocket | null>(null);
  const addExecutionResult = useWebSocketStore(state => state.addExecutionResult);

  useEffect(() => {
    const connect = async () => {
      try {
        // Get auth token
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        
        if (!token) {
          // console.error('No auth token available');
          return;
        }

        const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
        if (!wsUrl) {
          console.error('WebSocket URL not configured');
          return;
        }

        // Open WebSocket connection
        const ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('WebSocket message received:', message);
            
            // Add to execution results if it's a query result
            if (message.type === 'query.completed' || message.type === 'query.error') {
              addExecutionResult(message);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          // Reconnect after 3 seconds
          setTimeout(connect, 3000);
        };

      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [addExecutionResult]);

  return null; // This component doesn't render anything
}
