'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error(`网络响应不正常: ${response.status}`);
      }

      const data = await response.json();
      setMessages([...newMessages, data]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, { role: 'assistant', content: `抱歉,发生了错误: ${(error as Error).message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="p-4 bg-white dark:bg-gray-800 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">XiaojinPro AI</h1>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">由小靳(xiaojin)创建的专业版应用程序</p>
      </header>
      
      <main className="flex-grow flex flex-col overflow-hidden">
        <div className="flex-grow overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto">
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              XiaojinPro是小靳宇宙的一个工具，融合了影视制作专业知识和AI技术。
            </p>
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-2xl ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'} max-w-[80%]`}>
                  {message.role === 'user' ? (
                    <p>{message.content}</p>
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      className="markdown-body"
                      components={{
                        code({node, inline, className, children, ...props}: any) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={oneLight as any}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center">
                <span className="inline-block p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  AI正在思考...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="flex max-w-3xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入您的问题..."
              className="flex-grow px-4 py-2 rounded-l-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-r-full transition duration-200 disabled:bg-gray-400"
            >
              发送
            </button>
          </form>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 shadow-sm">
        <p>&copy; 2024 XiaojinPro AI by 小靳同学. 保留所有权利。</p>
        <p className="mt-1">
          使用说明：本程序不会保存任何输入或接收的信息，无历史记录功能，确保您的隐私。
        </p>
      </footer>
    </div>
  );
}
