import React, { useState, useEffect } from 'react';
import { X, Save, Key, Cpu, CreditCard, Check, Zap } from 'lucide-react';
import { AISettings, AIProvider } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSave: (settings: AISettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AISettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'ai'>('general');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in-up">
      <div className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 relative bg-black/20">
            <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
            <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-neon" />
            Settings
            </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
            <button 
                onClick={() => setActiveTab('general')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'general' ? 'text-neon border-b-2 border-neon bg-neon/5' : 'text-gray-400 hover:text-white'}`}
            >
                Subscription
            </button>
            <button 
                onClick={() => setActiveTab('ai')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'ai' ? 'text-neon border-b-2 border-neon bg-neon/5' : 'text-gray-400 hover:text-white'}`}
            >
                AI Config
            </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {activeTab === 'general' ? (
                <div className="space-y-6">
                    {/* Current Plan Card */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap className="w-24 h-24 text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Free Starter</h3>
                                    <p className="text-xs text-gray-400">Perfect for hobbyists</p>
                                </div>
                                <span className="px-2 py-1 rounded bg-white/10 text-xs font-mono text-gray-300 border border-white/10">CURRENT</span>
                            </div>
                            <div className="my-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Check className="w-4 h-4 text-neon" />
                                    <span>Basic Code Generation</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Check className="w-4 h-4 text-neon" />
                                    <span>Standard Speed</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Check className="w-4 h-4 text-neon" />
                                    <span>Community Support</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pro Plan Upgrade */}
                    <div className="bg-gradient-to-br from-neon/10 to-emerald-900/20 rounded-xl p-5 border border-neon/30 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    Neon Pro
                                    <SparklesIcon className="w-4 h-4 text-yellow-400" />
                                </h3>
                                <p className="text-xs text-neon/80">For serious builders</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-white">$19</span>
                                <span className="text-xs text-gray-400">/mo</span>
                            </div>
                        </div>
                        
                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-200">
                                <Check className="w-4 h-4 text-neon" />
                                <span>Unlimited Vibe Coding</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-200">
                                <Check className="w-4 h-4 text-neon" />
                                <span>Access to Gemini 1.5 Pro</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-200">
                                <Check className="w-4 h-4 text-neon" />
                                <span>Priority Generation</span>
                            </div>
                        </div>

                        <button className="w-full py-2.5 bg-neon text-black font-bold rounded-lg hover:bg-neon-dim transition-colors shadow-lg shadow-neon/20 flex items-center justify-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Upgrade Now
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Provider Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-400 block">AI Provider</label>
                        <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setLocalSettings({ ...localSettings, provider: 'gemini', model: 'gemini-2.5-flash' })}
                            className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                            localSettings.provider === 'gemini' 
                                ? 'bg-neon/10 border-neon text-neon' 
                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            Google Gemini
                        </button>
                        <button
                            onClick={() => setLocalSettings({ ...localSettings, provider: 'openrouter', model: 'anthropic/claude-3.5-sonnet' })}
                            className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                            localSettings.provider === 'openrouter' 
                                ? 'bg-neon/10 border-neon text-neon' 
                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            OpenRouter
                        </button>
                        </div>
                    </div>

                    {/* Model Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 block">Model Name</label>
                        <input
                        type="text"
                        value={localSettings.model}
                        onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon/50 transition-all placeholder-gray-600"
                        placeholder={localSettings.provider === 'gemini' ? "gemini-2.5-flash" : "anthropic/claude-3.5-sonnet"}
                        />
                        <p className="text-xs text-gray-500">
                        {localSettings.provider === 'gemini' 
                            ? "Recommended: gemini-2.5-flash, gemini-1.5-pro"
                            : "e.g. anthropic/claude-3.5-sonnet, deepseek/deepseek-r1"}
                        </p>
                    </div>

                    {/* API Key Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 block flex items-center justify-between">
                        <span>API Key</span>
                        {localSettings.provider === 'gemini' && !localSettings.apiKey && (
                            <span className="text-xs text-green-500">Using System Env Key</span>
                        )}
                        </label>
                        <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="password"
                            value={localSettings.apiKey}
                            onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon/50 transition-all placeholder-gray-600"
                            placeholder={localSettings.provider === 'gemini' ? "Optional (overrides env)" : "sk-or-..."}
                        />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        {activeTab === 'ai' && (
            <div className="p-6 pt-4 border-t border-white/10 flex justify-end bg-black/20">
            <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-neon text-black font-medium rounded-lg hover:bg-neon-dim transition-colors shadow-[0_0_15px_rgba(var(--neon-accent-rgb),0.3)]"
            >
                <Save className="w-4 h-4" />
                Save Config
            </button>
            </div>
        )}
      </div>
    </div>
  );
};

// Simple internal icons to avoid importing duplicates if not needed, 
// strictly creating new icons if they don't exist in lucide-react import
const SettingsIcon = (props: any) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
);

const SparklesIcon = (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
);
