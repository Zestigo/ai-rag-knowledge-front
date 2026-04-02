'use client';

import { useState, useRef, useEffect } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

// 消息类型定义
interface Message {
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
  isFinished: boolean;
}

// 历史对话类型定义
interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState('deepseek-r1:1.5b');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([
    {
      id: '1',
      title: '新对话',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  const [currentChatId, setCurrentChatId] = useState<string>('1');
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



  // 创建新对话
  const createNewChat = () => {
    const newChat: ChatHistory = {
      id: Date.now().toString(),
      title: '新对话',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setChatHistories(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setMessages([]);
  };

  // 切换对话
  const switchChat = (chatId: string) => {
    const chat = chatHistories.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
    }
  };

  // 删除对话
  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatHistories(prev => prev.filter(c => c.id !== chatId));
    if (currentChatId === chatId && chatHistories.length > 1) {
      const remaining = chatHistories.filter(c => c.id !== chatId);
      if (remaining.length > 0) {
        setCurrentChatId(remaining[0].id);
        setMessages(remaining[0].messages);
      } else {
        setMessages([]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background flex">
      {/* 侧边栏 */}
      <aside 
        className={`bg-card dark:bg-card border-r border-border dark:border-border transition-all duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        {/* 侧边栏头部 */}
        <div className="p-4 border-b border-border dark:border-border">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-900 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>新建对话</span>
          </button>
        </div>

        {/* 历史对话列表 */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider mb-2 px-2">
            历史对话
          </div>
          {chatHistories.map((chat) => (
            <div
              key={chat.id}
              onClick={() => switchChat(chat.id)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer mb-1 transition-colors ${
                currentChatId === chat.id
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-2 overflow-hidden">
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--foreground)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm truncate" style={{ color: 'var(--foreground)' }}>{chat.title}</span>
              </div>
              <button
                onClick={(e) => deleteChat(chat.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                title="删除对话"
              >
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* 侧边栏底部 */}
        <div className="p-4 border-t border-border dark:border-border">
          <div className="text-xs text-muted-foreground dark:text-muted-foreground text-center">
            {chatHistories.length} 个对话
          </div>
        </div>
      </aside>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 导航栏 */}
        <nav className="bg-card dark:bg-card shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                {/* 侧边栏切换按钮 */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="mr-4 p-2 rounded-md text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground hover:bg-bg-soft dark:hover:bg-bg-soft transition-colors"
                  title={sidebarOpen ? '收起侧边栏' : '展开侧边栏'}
                >
                  <svg 
                    className={`w-5 h-5 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-xl font-bold text-foreground dark:text-foreground">AI 对话</h1>
              </div>
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <select
                  value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-card dark:bg-card border border-border dark:border-border rounded-md py-1 px-3 text-sm text-foreground dark:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        <div 
          ref={chatContainerRef}
          className="bg-card dark:bg-card rounded-lg shadow-md flex-1 overflow-y-auto p-4 mb-4 max-w-5xl mx-auto w-full"
        >
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div 
                className={`max-w-[80%] ${message.role === 'user' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' 
                  : 'bg-bg-soft dark:bg-bg-soft text-foreground dark:text-foreground'
                } rounded-lg p-4 shadow-sm`}
              >
                {/* 思考过程 */}
                {message.role === 'assistant' && message.thought && (
                  <div className="mb-3">
                    <button 
                      className="text-xs text-muted-foreground dark:text-muted-foreground mb-1 flex items-center"
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
                    <div id={`thought-${index}`} className="hidden bg-bg-soft dark:bg-bg-soft p-3 rounded-md text-xs">
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
              <div className="max-w-[80%] bg-bg-soft dark:bg-bg-soft text-foreground dark:text-foreground rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-muted-foreground dark:border-muted-foreground mr-2"></div>
                  <span>生成中...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div className="bg-card dark:bg-card rounded-lg shadow-md p-4 max-w-5xl mx-auto w-full">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="输入消息..."
              className="flex-1 bg-bg-soft dark:bg-bg-soft border border-border dark:border-border rounded-md py-2 px-4 text-foreground dark:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </div>
    </div>
  );
}