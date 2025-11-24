import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { PreviewFrame } from './PreviewFrame';
import { CodeEditor } from './CodeEditor';
import { Send, User, Sparkles, MonitorPlay, Download, Square, Loader2, Code, Eye } from 'lucide-react';

interface WorkspaceProps {
  messages: Message[];
  currentCode: string;
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
  onCodeChange: (code: string) => void;
  onDownload: () => void;
  onCancel: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ 
  messages, 
  currentCode, 
  isStreaming, 
  onSendMessage,
  onCodeChange,
  onDownload,
  onCancel
}) => {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed inset-0 top-16 bg-[#050505] flex flex-col md:flex-row overflow-hidden animate-fade-in-up">
      {/* Left Panel: Chat */}
      <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col border-r border-white/10 bg-[#0a0a0a]">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-[#0a0a0a]">
            <Sparkles className="w-4 h-4 text-neon" />
            <span className="text-sm font-medium text-gray-300">Vibe Coding Assistant</span>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${msg.role === 'user' ? 'bg-white/10' : 'bg-gradient-to-br from-neon/80 to-green-800'}
              `}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-black" />}
              </div>
              
              <div className={`
                max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-white/5 text-gray-200 border border-white/5' 
                  : 'bg-neon/5 text-gray-300 border border-neon/10'}
              `}>
                <div className="prose prose-invert prose-sm max-w-none">
                  {/* We strip the code blocks from the chat bubble to keep it clean, as the code is shown on the right */}
                  {msg.content.split('```')[0].trim()} 
                  {msg.content.includes('```') && (
                    <div className="mt-2 text-xs opacity-50 italic flex items-center gap-1">
                      <MonitorPlay className="w-3 h-3" />
                      Code updated in workspace
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isStreaming && (
            <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon/80 to-green-800 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4 text-black" />
               </div>
               <div className="bg-neon/5 rounded-2xl px-4 py-3 border border-neon/10 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-neon animate-spin" />
                  <span className="text-xs text-gray-400">Building interface...</span>
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-[#0a0a0a]">
          {isStreaming ? (
            <button
              onClick={onCancel}
              className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all flex items-center justify-center gap-2 font-medium text-sm"
            >
              <Square className="w-4 h-4 fill-current" />
              Stop Generating
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe the changes..."
                className="w-full bg-[#151515] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/50 transition-all"
                disabled={isStreaming}
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-neon/10 text-neon rounded-lg hover:bg-neon hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right Panel: Preview & Editor */}
      <div className="flex-1 bg-[#050505] p-4 md:p-6 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between mb-4">
            
            {/* View Toggle */}
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        activeTab === 'preview' 
                        ? 'bg-neon/20 text-neon' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                </button>
                <button
                    onClick={() => setActiveTab('code')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        activeTab === 'code' 
                        ? 'bg-neon/20 text-neon' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <Code className="w-3.5 h-3.5" />
                    Code
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 font-mono">
                        {isStreaming ? 'Compiling...' : 'Ready'}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                </div>
                <button 
                  onClick={onDownload}
                  disabled={!currentCode}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Download as .zip"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
            </div>
        </div>
        
        <div className="flex-1 min-h-0 relative group">
             {/* Glow effect behind the frame */}
             <div className="absolute -inset-1 bg-gradient-to-br from-neon/20 to-blue-600/20 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
             
             {activeTab === 'preview' ? (
                <PreviewFrame code={currentCode} />
             ) : (
                <CodeEditor code={currentCode} onChange={onCodeChange} />
             )}
        </div>
      </div>
    </div>
  );
};