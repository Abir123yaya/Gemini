/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, GraduationCap, BookOpen, Lightbulb, History, Trash2, Menu, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { generateChatResponse } from './lib/gemini';
import { cn } from './lib/utils';

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
};

const QUICK_ACTIONS = [
  { icon: <BookOpen className="w-4 h-4" />, label: "Help with Homework", prompt: "I need help with my homework. Can you guide me through a problem?" },
  { icon: <Lightbulb className="w-4 h-4" />, label: "Explain a Concept", prompt: "Can you explain a topic from my science or math class in simple terms?" },
  { icon: <GraduationCap className="w-4 h-4" />, label: "Study Tips", prompt: "What are some good study tips for a middle school student?" },
  { icon: <Sparkles className="w-4 h-4" />, label: "Creative Writing", prompt: "Can you help me brainstorm some ideas for my English writing assignment?" },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateChatResponse(
        messages.concat(userMessage).map(m => ({ role: m.role, content: m.content }))
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm('Clear your conversation history?')) {
      setMessages([]);
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans text-slate-900 border-t-4 border-blue-600 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-blue-50 border-r border-blue-100 transform transition-transform duration-300 lg:relative lg:translate-x-0 p-6 flex flex-col gap-6 shadow-xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-blue-900">LV Assist</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-blue-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest px-2">
            <Sparkles className="w-3 h-3" />
            Quick Help
          </div>
          <div className="grid gap-2">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  handleSend(action.prompt);
                  setIsSidebarOpen(false);
                }}
                className="flex items-center gap-3 p-3 text-sm text-left font-medium text-blue-700 bg-white rounded-xl border border-blue-100 hover:border-blue-400 hover:bg-blue-100 transition-all shadow-sm active:scale-95"
              >
                <span className="p-1.5 bg-blue-50 rounded-lg text-blue-600">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-blue-200">
            <button
              onClick={clearChat}
              className="flex items-center gap-3 w-full p-3 text-sm font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
              Clear Conversation
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        {/* Header */}
        <header className="h-16 border-bottom border-slate-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-blue-600">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Dashboard</span>
              <span className="text-sm font-semibold text-slate-400">Welcome to LV Middle School Support</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold ring-1 ring-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              AI Online
            </div>
          </div>
        </header>

        {/* Chat Content */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-8 lg:px-8 space-y-8 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-200 animate-bounce-slow">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">How can I help you?</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  I'm your LV Middle School AI assistant. I can help with your homework, explain science projects, or give you study tips!
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                {QUICK_ACTIONS.slice(0, 2).map((action, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(action.prompt)}
                    className="p-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8 pb-32">
              {messages.map((message) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={message.id}
                  className={cn(
                    "flex items-start gap-4 group",
                    message.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                    message.role === 'user' ? "bg-slate-900" : "bg-blue-600"
                  )}>
                    {message.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                  </div>
                  <div className={cn(
                    "flex flex-col gap-2 max-w-[85%]",
                    message.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-5 py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm ring-1 ring-slate-100",
                      message.role === 'user' 
                        ? "bg-slate-900 text-white rounded-tr-none" 
                        : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                    )}>
                      <div className={cn(
                        "prose prose-sm max-w-none",
                        message.role === 'user' ? "prose-invert" : "prose-slate"
                      )}>
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div className="bg-white border border-slate-100 px-5 py-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 lg:p-8 lg:pt-0 bg-gradient-to-t from-white via-white to-transparent sticky bottom-0 z-20">
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your school assistant anything..."
                className="w-full bg-white border-2 border-slate-100 rounded-3xl px-6 py-4 pr-16 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all shadow-xl shadow-blue-50/50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all active:scale-90",
                  input.trim() && !isLoading 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "bg-slate-100 text-slate-300"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              LV-Assist · Powered by AI for LV Middle School
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .prose code {
          background-color: rgb(241 245 249);
          padding: 2px 4px;
          border-radius: 4px;
          font-family: monospace;
        }
        .prose pre {
          background-color: rgb(15 23 42);
          color: white;
          padding: 1rem;
          border-radius: 1rem;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}
