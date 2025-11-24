import React from 'react';
import { Sparkles, Gift, Bell, Settings, PlusCircle, Menu } from 'lucide-react';

interface HeaderProps {
  onSettingsClick?: () => void;
  onLogoClick?: () => void;
  onNewChatClick?: () => void;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick, onLogoClick, onNewChatClick, onMenuClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          title="History"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button 
          onClick={onLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          title="Back to Start"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-neon to-green-900 rounded-lg flex items-center justify-center">
               <Sparkles className="text-black w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Neon<span className="text-neon">Vibe</span></span>
        </button>
      </div>

      <div className="flex items-center gap-4 text-gray-400">
        {/* New Chat Button */}
        <button 
          onClick={onNewChatClick}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-neon/10 border border-transparent hover:border-neon/30 transition-all text-sm font-medium text-gray-300 hover:text-white"
          title="Start a New Chat"
        >
          <PlusCircle className="w-4 h-4 text-gray-400 group-hover:text-neon transition-colors" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        <div className="h-6 w-px bg-white/10 mx-1"></div>

        <button 
          onClick={() => alert("Gift feature coming soon!")}
          className="hover:text-neon transition-colors p-1"
          title="Gifts"
        >
          <Gift className="w-5 h-5" />
        </button>
        <button 
          onClick={() => alert("No new notifications")}
          className="hover:text-neon transition-colors p-1"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        
        {/* Settings / Profile Button */}
        <button 
          onClick={onSettingsClick}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-black hover:ring-neon transition-all hover:scale-105"
          title="Settings & Pricing"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};