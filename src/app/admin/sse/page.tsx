'use client';

import React, { useState, useRef, useEffect } from 'react';
import { mcpGatewayService } from '@/api/mcpGatewayService';

export default function SsePage() {
  const [gatewayId, setGatewayId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<{id: number, data: string, timestamp: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const messageIdRef = useRef(0);

  // 清理SSE连接
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // 建立SSE连接
  const handleConnect = () => {
    if (!gatewayId || !apiKey) {
      setError('请填写网关ID和API Key');
      return;
    }

    setError(null);
    setMessages([]);
    setConnecting(true);

    try {
      // 建立SSE连接
      const eventSource = mcpGatewayService.establishSSEConnection(
        gatewayId,
        apiKey,
        (event) => {
          // 处理接收到的事件
          const newMessage = {
            id: messageIdRef.current++,
            data: event.data,
            timestamp: new Date().toLocaleTimeString()
          };
          setMessages(prev => [...prev, newMessage]);
        },
        (error) => {
          // 处理错误
          setError('SSE连接错误');
          setIsConnected(false);
          setConnecting(false);
          console.error('SSE错误:', error);
        }
      );

      eventSourceRef.current = eventSource;
      setIsConnected(true);
      setConnecting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败');
      setConnecting(false);
      console.error('连接异常:', err);
    }
  };

  // 关闭SSE连接
  const handleDisconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      setMessages([]);
    }
  };

  // 清空消息
  const handleClearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">SSE连接测试</h2>
        <p className="text-foreground">测试与网关的SSE长连接</p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 连接配置 */}
      <div className="bg-card rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="gatewayId" className="block text-sm font-medium text-foreground">
              网关ID *
            </label>
            <input
              type="text"
              id="gatewayId"
              value={gatewayId}
              onChange={(e) => setGatewayId(e.target.value)}
              disabled={isConnected}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入网关ID"
            />
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-foreground">
              API Key *
            </label>
            <input
              type="text"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isConnected}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入API Key"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleConnect}
              disabled={isConnected || connecting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {connecting ? '连接中...' : '建立连接'}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={!isConnected}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              关闭连接
            </button>
          </div>

          <div>
            <p className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-foreground'}`}>
              连接状态: {isConnected ? '已连接' : '未连接'}
            </p>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="bg-card rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">接收的消息</h3>
          {messages.length > 0 && (
            <button
              onClick={handleClearMessages}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              清空消息
            </button>
          )}
        </div>
        <div className="border rounded-md p-4 h-80 overflow-y-auto bg-[var(--bg-soft)]">
          {messages.length === 0 ? (
            <p className="text-foreground text-center">暂无消息</p>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="p-3 bg-card rounded border shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-foreground">{message.timestamp}</span>
                    <span className="text-xs font-medium text-blue-600">消息 #{message.id}</span>
                  </div>
                  <pre className="text-sm whitespace-pre-wrap break-words">{message.data}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
