import React from 'react';
import { X, MessageSquare, Trash2, Clock, PlusCircle } from 'lucide-react';
import { SavedSession } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SavedSession[];
  currentSessionId: string;
  onSelectSession: (session: SavedSession) => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  onNewChat: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-[300px] bg-[#0a0a0a] border-r border-white/10 z-[70] 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0f0f0f]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-neon" />
            History
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Action */}
        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-neon/10 hover:bg-neon/20 border border-neon/30 hover:border-neon text-neon rounded-xl transition-all font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center text-gray-500 mt-10 text-sm">
              <p>No saved history yet.</p>
              <p className="text-xs mt-1">Start chatting to auto-save.</p>
            </div>
          ) : (
            sessions
              .sort((a, b) => b.lastModified - a.lastModified)
              .map((session) => (
              <div 
                key={session.id}
                onClick={() => {
                  onSelectSession(session);
                  onClose();
                }}
                className={`
                  group relative p-3 rounded-lg cursor-pointer border transition-all duration-200
                  ${session.id === String(currentSessionId)
                    ? 'bg-white/5 border-neon/50 shadow-[inset_3px_0_0_0_rgba(var(--neon-accent-rgb),1)]'
                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'}
                `}
              >
                <div className="flex items-start gap-3 pr-6">
                  <MessageSquare className={`w-4 h-4 mt-1 flex-shrink-0 ${session.id === String(currentSessionId) ? 'text-neon' : 'text-gray-500'}`} />
                  <div className="min-w-0">
                    <h3 className={`text-sm font-medium truncate ${session.id === String(currentSessionId) ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                      {session.title || 'Untitled Project'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.lastModified).toLocaleDateString()} • {new Date(session.lastModified).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => onDeleteSession(e, session.id)}
                  className="absolute right-2 top-3 p-1.5 rounded-md text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Delete Session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-xs text-gray-600 text-center">
          Auto-saves to browser storage
        </div>
      </div>
    </>
  );
};