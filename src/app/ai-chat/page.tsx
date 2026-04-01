'use client';

import { useState, useRef, useEffect } from 'react';

// 消息类型定义
interface Message {
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
  isFinished: boolean;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState('deepseek-r1:1.5b');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // 清理文本中的多余**号
  const cleanText = (text: string): string => {
    return text.replace(/\*+/g, '');
  };

  // 解析思考过程和最终回答
  const parseResponse = (text: string): { thought: string; content: string } => {
    // 检查是否包含<think>标签
    const thinkStartIndex = text.indexOf('<think>');
    
    if (thinkStartIndex !== -1) {
      // 检查是否包含</think>标签
      const thinkEndIndex = text.indexOf('</think>');
      
      if (thinkEndIndex !== -1) {
        // 完整的<think>标签
        const thought = text.substring(thinkStartIndex + 6, thinkEndIndex);
        const content = text.substring(thinkEndIndex + 8).trim();
        return {
          thought: cleanText(thought),
          content: cleanText(content)
        };
      } else {
        // 不完整的<think>标签，提取已有的思考内容
        const thought = text.substring(thinkStartIndex + 6);
        return {
          thought: cleanText(thought),
          content: ''
        };
      }
    } else {
      // 没有<think>标签，将整个内容作为最终回答
      return {
        thought: '',
        content: cleanText(text)
      };
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // 添加用户消息
    const newMessage = { role: 'user' as const, content: input, isFinished: true };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    // 构建API URL
    const apiUrl = `http://localhost:8090/api/v1/ollama/generate_stream?model=${encodeURIComponent(model)}&message=${encodeURIComponent(input)}`;

    try {
      // 使用fetch API获取流式响应
      console.log('Calling API:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // 直接获取完整响应
      const data = await response.json();
      console.log('Full response data:', data);
      
      // 检查是否是数组
      const dataArray = Array.isArray(data) ? data : [data];
      
      // 临时存储AI响应
      let aiResponse = '';
      
      // 遍历数据数组
      for (const item of dataArray) {
        if (item && item.result && item.result.output && item.result.output.text) {
          // 追加内容
          const newContent = item.result.output.text;
          aiResponse += newContent;
          console.log('New content:', newContent);
          console.log('Accumulated response:', aiResponse);
          
          // 解析思考过程和最终回答
          const { thought, content } = parseResponse(aiResponse);
          console.log('Parsed thought:', thought);
          console.log('Parsed content:', content);
          
          // 更新消息列表
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              // 更新最后一条助手消息
              return [...prev.slice(0, -1), { 
                ...lastMessage, 
                content, 
                thought,
                isFinished: false
              }];
            } else {
              // 添加新的助手消息
              return [...prev, { 
                role: 'assistant' as const, 
                content, 
                thought,
                isFinished: false
              }];
            }
          });
          
          // 模拟流式效果，添加延迟
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // 检查是否结束
        if (item && item.result && item.result.metadata && item.result.metadata.finishReason === 'STOP') {
          console.log('Stream finished');
          setIsLoading(false);
          
          // 更新消息为已完成
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              return [...prev.slice(0, -1), { ...lastMessage, isFinished: true }];
            }
            return prev;
          });
          return;
        }
      }

      // 读取完成
      setIsLoading(false);
      
      // 更新消息为已完成
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          return [...prev.slice(0, -1), { ...lastMessage, isFinished: true }];
        }
        return prev;
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  // 监听消息变化，滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* 导航栏 */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI 对话</h1>
            </div>
            <div className="flex items-center">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="deepseek-r1:1.5b">deepseek-r1:1.5b</option>
                <option value="llama3:8b">llama3:8b</option>
                <option value="gemma:7b">gemma:7b</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* 聊天区域 */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div 
          ref={chatContainerRef}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-[600px] overflow-y-auto p-4 mb-4"
        >
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div 
                className={`max-w-[80%] ${message.role === 'user' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                } rounded-lg p-4 shadow-sm`}
              >
                {/* 思考过程 */}
                {message.role === 'assistant' && message.thought && (
                  <div className="mb-3">
                    <button 
                      className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center"
                      onClick={() => {
                        const element = document.getElementById(`thought-${index}`);
                        if (element) {
                          element.classList.toggle('hidden');
                        }
                      }}
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      思考过程
                    </button>
                    <div id={`thought-${index}`} className="hidden bg-gray-200 dark:bg-gray-600 p-3 rounded-md text-xs">
                      {message.thought}
                    </div>
                  </div>
                )}
                
                {/* 最终回答 */}
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="max-w-[80%] bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 dark:border-gray-300 mr-2"></div>
                  <span>生成中...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="输入消息..."
              className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isLoading || !input.trim()}
            >
              发送
            </button>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            © 2026 AI 对话系统. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}