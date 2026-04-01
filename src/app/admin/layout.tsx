import React from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-soft)]">
      {/* 侧边导航栏 */}
      <div className="flex">
        <div className="w-64 bg-[var(--card-background)] shadow-md dark:shadow-gray-800">
          <div className="p-4 border-b dark:border-[var(--border-color)]">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-foreground">MCP网关管理</h1>
              <ThemeToggle />
            </div>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/admin/config" 
                  className="block px-4 py-2 rounded-md hover:bg-[var(--bg-soft)] text-foreground"
                >
                  网关配置管理
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/mcp" 
                  className="block px-4 py-2 rounded-md hover:bg-[var(--bg-soft)] text-foreground"
                >
                  MCP消息处理
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/sse" 
                  className="block px-4 py-2 rounded-md hover:bg-[var(--bg-soft)] text-foreground"
                >
                  SSE连接测试
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* 主内容区域 */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
