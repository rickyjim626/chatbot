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

    let retries = 3;
    while (retries > 0) {
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
        break; // 成功时跳出循环
      } catch (error) {
        console.error('Error:', error);
        retries--;
        if (retries === 0) {
          setMessages([...newMessages, { role: 'assistant', content: `抱歉,发生了错误: ${(error as Error).message}. 请稍后再试。` }]);
        } else {
          console.log(`重试中... 剩余尝试次数: ${retries}`);
        }
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="fixed top-0 left-0 right-0 z-10 p-2 bg-white dark:bg-gray-800 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">XiaojinPro AI</h1>
        <p className="text-xs text-gray-600 dark:text-gray-400">小靳宇宙的专业AI助手</p>
      </header>
      
      <main className="flex-grow overflow-y-auto pt-16 pb-14">
        <div className="max-w-3xl mx-auto px-4">
          <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
            XiaojinPro是小靳宇宙的一个工具，融合了影视制作专业知识和AI技术。
          </p>
          {messages.map((message, index) => (
            <div key={index} className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'} max-w-[85%]`}>
                {message.role === 'user' ? (
                  <p className="text-sm">{message.content}</p>
                ) : (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    className="markdown-body text-sm"
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
                      },
                      p: ({children}) => <p className="text-sm mb-2">{children}</p>,
                      h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                      h2: ({children}) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                      h3: ({children}) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
                      ul: ({children}) => <ul className="text-sm list-disc list-inside mb-2">{children}</ul>,
                      ol: ({children}) => <ol className="text-sm list-decimal list-inside mb-2">{children}</ol>,
                      li: ({children}) => <li className="mb-1">{children}</li>,
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
              <span className="inline-block p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">
                AI正在思考...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 p-2 bg-white dark:bg-gray-800 shadow-sm">
        <form onSubmit={handleSubmit} className="flex max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入您的问题..."
            className="flex-grow px-3 py-1 text-sm rounded-l-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
          <button 
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 text-sm rounded-r-full transition duration-200 disabled:bg-gray-400"
          >
            发送
          </button>
        </form>
        <p className="mt-1 text-center text-xs text-gray-600 dark:text-gray-400">
          本程序不会保存任何输入或接收的信息，无历史记录功能，确保您的隐私。
        </p>
      </footer>
    </div>
  );
}
