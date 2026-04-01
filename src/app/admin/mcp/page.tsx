'use client';

import React, { useState } from 'react';
import { mcpGatewayService } from '@/api/mcpGatewayService';

export default function McpPage() {
  const [gatewayId, setGatewayId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [messageBody, setMessageBody] = useState(JSON.stringify({
    "jsonrpc": "2.0",
    "method": "example.method",
    "params": {
      "key": "value"
    },
    "id": 1
  }, null, 2));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 验证JSON格式
  const validateJson = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  // 处理消息发送
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // 验证JSON格式
    if (!validateJson(messageBody)) {
      setError('消息体格式不正确，请输入有效的JSON');
      setLoading(false);
      return;
    }

    try {
      const response = await mcpGatewayService.handleMessage(
        gatewayId,
        sessionId,
        apiKey,
        messageBody
      );
      
      // 检查响应状态
      if (response.ok) {
        setSuccess('消息发送成功');
        // 清空表单
        setMessageBody(JSON.stringify({
          "jsonrpc": "2.0",
          "method": "example.method",
          "params": {
            "key": "value"
          },
          "id": 1
        }, null, 2));
      } else {
        setError(`消息发送失败: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '消息发送失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 生成示例消息
  const generateExampleMessage = () => {
    setMessageBody(JSON.stringify({
      "jsonrpc": "2.0",
      "method": "get_weather",
      "params": {
        "city": "北京",
        "date": new Date().toISOString().split('T')[0]
      },
      "id": Math.floor(Math.random() * 10000)
    }, null, 2));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">MCP消息处理</h2>
        <p className="text-foreground">发送MCP消息到指定网关</p>
      </div>

      {/* 消息提示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* 消息发送表单 */}
      <div className="bg-card rounded-lg shadow-md p-6">
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label htmlFor="gatewayId" className="block text-sm font-medium text-foreground">
              网关ID *
            </label>
            <input
              type="text"
              id="gatewayId"
              value={gatewayId}
              onChange={(e) => setGatewayId(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入网关ID"
            />
          </div>

          <div>
            <label htmlFor="sessionId" className="block text-sm font-medium text-foreground">
              会话ID *
            </label>
            <input
              type="text"
              id="sessionId"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入会话ID"
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
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入API Key"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="messageBody" className="block text-sm font-medium text-foreground">
                消息体 (JSON-RPC) *
              </label>
              <button
                type="button"
                onClick={generateExampleMessage}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                生成示例
              </button>
            </div>
            <textarea
              id="messageBody"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              required
              rows={8}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入JSON-RPC格式的消息体"
            />
            {!validateJson(messageBody) && (
              <p className="mt-1 text-sm text-red-600">JSON格式不正确</p>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? '发送中...' : '发送消息'}
            </button>
            <button
              type="button"
              onClick={() => setMessageBody(JSON.stringify({
                "jsonrpc": "2.0",
                "method": "example.method",
                "params": {
                  "key": "value"
                },
                "id": 1
              }, null, 2))}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-[var(--border-color)] text-sm font-medium rounded-md shadow-sm text-foreground bg-[var(--card-background)] hover:bg-[var(--bg-soft)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              重置
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
