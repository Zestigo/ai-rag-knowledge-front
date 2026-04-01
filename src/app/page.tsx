
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-soft)] flex flex-col">
      {/* 导航栏 */}
      <nav className="bg-[var(--card-background)] shadow-sm dark:shadow-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-foreground">MCP Gateway</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin" 
                className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:text-foreground hover:bg-[var(--bg-soft)]"
              >
                管理中心
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            欢迎使用 MCP Gateway
          </h2>
          <p className="text-xl text-foreground mb-8">
            一个强大的网关管理系统，支持多种协议和认证方式
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/admin/config"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              网关配置管理
            </Link>
            <Link
              href="/admin/mcp"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              MCP消息处理
            </Link>
            <Link
              href="/admin/sse"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              SSE连接测试
            </Link>
          </div>
        </div>

        {/* 功能介绍 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[var(--card-background)] p-6 rounded-lg shadow-md dark:shadow-gray-800">
            <h3 className="text-lg font-semibold mb-2">网关配置管理</h3>
            <p className="text-foreground">管理网关的基础配置、工具配置、协议配置和认证配置</p>
          </div>
          <div className="bg-[var(--card-background)] p-6 rounded-lg shadow-md dark:shadow-gray-800">
            <h3 className="text-lg font-semibold mb-2">MCP消息处理</h3>
            <p className="text-foreground">发送MCP消息到指定网关，处理JSON-RPC格式的请求</p>
          </div>
          <div className="bg-[var(--card-background)] p-6 rounded-lg shadow-md dark:shadow-gray-800">
            <h3 className="text-lg font-semibold mb-2">SSE连接测试</h3>
            <p className="text-foreground">测试与网关的SSE长连接，实时接收网关推送的消息</p>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-[var(--card-background)] border-t mt-12 dark:border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-foreground">
            © 2026 MCP Gateway. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}