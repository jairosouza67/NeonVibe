import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HeroBackground } from './components/HeroBackground';
import { PromptInput } from './components/PromptInput';
import { ResultDisplay } from './components/ResultDisplay';
import { Workspace } from './components/Workspace';
import { SettingsModal } from './components/SettingsModal';
import { HistorySidebar } from './components/HistorySidebar';
import { ImageFile, AppState, Message, AISettings, ProjectFiles, SavedSession } from './types';
import { editImageWithGemini, streamAppGeneration } from './services/geminiService';
import { Wand2 } from 'lucide-react';
// @ts-ignore
import JSZip from 'jszip';

const themes = [
  { name: 'Neon Green', rgb: '57 255 20' },
  { name: 'Hot Pink', rgb: '255 20 147' },
  { name: 'Electric Blue', rgb: '0 255 255' },
  { name: 'Plasma Orange', rgb: '255 165 0' },
];

const DEFAULT_SETTINGS: AISettings = {
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-2.5-flash'
};

const App: React.FC = () => {
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  
  // Session State
  const [sessionId, setSessionId] = useState<string>(String(Date.now()));
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  // Navigation State
  const [viewMode, setViewMode] = useState<'LANDING' | 'WORKSPACE'>('LANDING');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Shared State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_SETTINGS);

  // Image Edit State
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>("");

  // Workspace/App Builder State
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFiles>({});
  const [previewHtml, setPreviewHtml] = useState<string>(""); 
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Refs for stream control
  const abortRef = useRef<boolean>(false);

  // --- Initialization & Persistence ---

  // Load settings and history from local storage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('neonvibe_settings');
    if (savedSettings) {
      try {
        setAiSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }

    const savedHistory = localStorage.getItem('neonvibe_history');
    if (savedHistory) {
      try {
        setSavedSessions(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleSaveSettings = (newSettings: AISettings) => {
    setAiSettings(newSettings);
    localStorage.setItem('neonvibe_settings', JSON.stringify(newSettings));
  };

  // Save Session Logic
  useEffect(() => {
    // Debounce save to prevent excessive writes
    const timer = setTimeout(() => {
      if (chatMessages.length > 0 || Object.keys(projectFiles).length > 0) {
        saveCurrentSession();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [chatMessages, projectFiles, previewHtml]);

  const saveCurrentSession = () => {
    setSavedSessions(prev => {
      const existingIndex = prev.findIndex(s => s.id === sessionId);
      const title = chatMessages.length > 0 
        ? chatMessages[0].content.slice(0, 30) + (chatMessages[0].content.length > 30 ? '...' : '') 
        : 'Untitled Project';

      const sessionData: SavedSession = {
        id: sessionId,
        title,
        messages: chatMessages,
        projectFiles,
        previewHtml,
        lastModified: Date.now()
      };

      let newSessions;
      if (existingIndex >= 0) {
        newSessions = [...prev];
        newSessions[existingIndex] = sessionData;
      } else {
        newSessions = [sessionData, ...prev];
      }

      localStorage.setItem('neonvibe_history', JSON.stringify(newSessions));
      return newSessions;
    });
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSessions = savedSessions.filter(s => s.id !== id);
    setSavedSessions(newSessions);
    localStorage.setItem('neonvibe_history', JSON.stringify(newSessions));
    
    // If we deleted the current session, reset to home
    if (id === sessionId) {
      handleNewChat();
    }
  };

  const handleLoadSession = (session: SavedSession) => {
    setSessionId(session.id);
    setChatMessages(session.messages);
    setProjectFiles(session.projectFiles);
    setPreviewHtml(session.previewHtml);
    setAppState(AppState.IDLE); // Reset processing states
    setErrorMsg(null);
    setOriginalImage(null);
    setResultImage(null);
    
    // If it has files/messages, go to workspace, otherwise landing
    if (session.messages.length > 0) {
      setViewMode('WORKSPACE');
    } else {
      setViewMode('LANDING');
    }
  };

  // --- Theme & Navigation ---

  useEffect(() => {
    const theme = themes[currentThemeIndex];
    document.documentElement.style.setProperty('--neon-accent-rgb', theme.rgb);
  }, [currentThemeIndex]);

  const toggleTheme = () => {
    setCurrentThemeIndex((prev) => (prev + 1) % themes.length);
  };

  const handleNewChat = () => {
    setChatMessages([]);
    setProjectFiles({});
    setPreviewHtml("");
    setAppState(AppState.IDLE);
    setOriginalImage(null);
    setResultImage(null);
    setLastPrompt("");
    setErrorMsg(null);
    setViewMode('LANDING');
    setSessionId(String(Date.now()));
  };

  const handleLogoClick = () => {
    // Navigate home but keep session state active
    setViewMode('LANDING');
  };

  // --- Logic Helpers ---

  const parseProjectFiles = (response: string): ProjectFiles => {
    const files: ProjectFiles = {};
    const fileRegex = /<file name="([^"]+)">([\s\S]*?)<\/file>/g;
    
    let match;
    while ((match = fileRegex.exec(response)) !== null) {
      const filename = match[1];
      const content = match[2];
      files[filename] = content;
    }

    const incompleteRegex = /<file name="([^"]+)">([\s\S]*)$/;
    const incompleteMatch = incompleteRegex.exec(response);
    if (incompleteMatch) {
       if (!files[incompleteMatch[1]]) {
           files[incompleteMatch[1]] = incompleteMatch[2];
       }
    }

    return files;
  };

  const bundleFilesForPreview = (files: ProjectFiles): string => {
    let html = files['index.html'] || "";
    if (!html) return "";

    const linkRegex = /<link[^>]+href=["']([^"']+\.css)["'][^>]*>/g;
    html = html.replace(linkRegex, (match, href) => {
      const cssContent = files[href];
      if (cssContent) {
        return `<style>\n${cssContent}\n</style>`;
      }
      return match;
    });

    const scriptRegex = /<script[^>]+src=["']([^"']+\.js)["'][^>]*><\/script>/g;
    html = html.replace(scriptRegex, (match, src) => {
       const jsContent = files[src];
       if (jsContent) {
         return `<script>\n${jsContent}\n</script>`;
       }
       return match;
    });

    return html;
  };

  const handleStreamRequest = async (messages: Message[]) => {
    setIsStreaming(true);
    abortRef.current = false;
    let fullResponse = "";
    
    setChatMessages(prev => [...prev, { role: 'model', content: '' }]);

    try {
      const stream = streamAppGeneration(messages, aiSettings);

      for await (const chunk of stream) {
        if (abortRef.current) break;

        fullResponse += chunk;
        
        setChatMessages(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].content = fullResponse;
          return newHistory;
        });

        const files = parseProjectFiles(fullResponse);
        if (Object.keys(files).length > 0) {
           setProjectFiles(prev => ({...prev, ...files})); // Merge to keep old files if not overwritten
           const bundled = bundleFilesForPreview({...projectFiles, ...files});
           setPreviewHtml(bundled);
        }
      }
      
      if (abortRef.current) {
         setChatMessages(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1].content += "\n\n*[Generation cancelled by user]*";
            return newHistory;
         });
      }

    } catch (err: any) {
      console.error(err);
      let msg = "Connection interrupted.";
      if (err.message && err.message.includes("API Key")) {
        msg = "Missing API Key. Please configure it in Settings.";
        setIsSettingsOpen(true);
      } else if (err.message) {
        msg = err.message;
      }
      
      setChatMessages(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].content += `\n\n**Error:** ${msg}`;
        return newHistory;
      });
    } finally {
      setIsStreaming(false);
      abortRef.current = false;
    }
  };

  const handleCancelGeneration = () => {
      abortRef.current = true;
      setIsStreaming(false);
  };

  const handleDownloadCode = async () => {
      const files = projectFiles;
      if (Object.keys(files).length === 0) return;

      try {
          const zip = new JSZip();
          Object.entries(files).forEach(([filename, content]) => {
              zip.file(filename, content);
          });
          const content = await zip.generateAsync({ type: "blob" });
          const url = window.URL.createObjectURL(content);
          const a = document.createElement('a');
          a.href = url;
          a.download = "neonvibe-repository.zip";
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
      } catch (e) {
          console.error("Failed to zip and download", e);
          alert("Failed to create download package.");
      }
  };

  const handlePromptSubmit = async (prompt: string, image: ImageFile | null) => {
    setErrorMsg(null);
    setLastPrompt(prompt);
    
    if (image) {
        setViewMode('LANDING');
        setAppState(AppState.PROCESSING);
        setOriginalImage(image.data);
        setResultImage(null);

        try {
            const apiKey = aiSettings.provider === 'gemini' ? aiSettings.apiKey : undefined;
            const generatedImageBase64 = await editImageWithGemini(
                image.data, 
                image.mimeType, 
                prompt,
                apiKey
            );
            setResultImage(generatedImageBase64);
            setAppState(AppState.COMPLETE);
        } catch (err: any) {
            setAppState(AppState.ERROR);
            setErrorMsg(err.message || "Failed to process request.");
        }
    } else {
        if (!prompt.trim()) return;

        if (viewMode === 'LANDING') {
            setViewMode('WORKSPACE');
            const initialMessages: Message[] = [{ role: 'user', content: prompt }];
            setChatMessages(initialMessages);
            await handleStreamRequest(initialMessages);
        } 
    }
  };

  const handleWorkspaceMessage = async (text: string) => {
      const newMessages: Message[] = [...chatMessages, { role: 'user', content: text }];
      setChatMessages(newMessages);
      await handleStreamRequest(newMessages);
  };
  
  // Allows manual editing of the preview HTML
  const handleCodeUpdate = (newCode: string) => {
    setPreviewHtml(newCode);
    // Note: We are currently updating the bundled preview. 
    // In a full implementation, we might want to update specific files in 'projectFiles'
    // but parsing the bundle back to files is complex. 
    // For now, this allows visual tweaks which is the primary goal.
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden selection:bg-neon selection:text-black">
      <Header 
        onSettingsClick={() => setIsSettingsOpen(true)} 
        onLogoClick={handleLogoClick}
        onNewChatClick={handleNewChat}
        onMenuClick={() => setIsSidebarOpen(true)}
      />
      
      <HistorySidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={savedSessions}
        currentSessionId={sessionId}
        onSelectSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        onNewChat={handleNewChat}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={aiSettings}
        onSave={handleSaveSettings}
      />

      <div className={viewMode === 'WORKSPACE' ? 'opacity-20 transition-opacity duration-1000' : 'opacity-100 transition-opacity'}>
        <HeroBackground />
      </div>

      {viewMode === 'LANDING' ? (
        <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 pt-24 pb-12 w-full max-w-7xl mx-auto">
            
            <div className={`text-center mb-12 transition-all duration-500 ${appState === AppState.COMPLETE ? 'mt-0' : 'mt-10 md:mt-20'}`}>
            {appState === AppState.IDLE || appState === AppState.ERROR ? (
                <>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-6 hover:border-neon/30 transition-colors cursor-default">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon"></span>
                        </span>
                        <span>
                          {aiSettings.provider === 'gemini' ? 'Gemini 2.5 Active' : 'OpenRouter Active'}
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                        Create with <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-white neon-text-glow">NeonVibe</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Edit images or build apps just by chatting.
                        <br/>
                        <span className="text-sm opacity-70">Try "Add a cyberpunk filter" OR "Create a login page"</span>
                    </p>
                </>
            ) : appState === AppState.PROCESSING ? (
                <div className="flex flex-col items-center animate-pulse">
                    <Wand2 className="w-16 h-16 text-neon mb-4 animate-spin-slow" />
                    <h2 className="text-3xl font-bold text-white">Refining Pixels...</h2>
                    <p className="text-gray-400 mt-2">The AI is dreaming up your image.</p>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <h2 className="text-3xl font-bold text-white mb-2">Image Edited</h2>
                    <button 
                        onClick={() => { setAppState(AppState.IDLE); setResultImage(null); setOriginalImage(null); }}
                        className="text-neon hover:underline text-sm mt-2"
                    >
                        Start Over
                    </button>
                </div>
            )}
            </div>

            <div className="w-full">
                <PromptInput 
                    key={sessionId}
                    onSubmit={handlePromptSubmit} 
                    onThemeToggle={toggleTheme}
                    isProcessing={appState === AppState.PROCESSING} 
                />
                {errorMsg && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm text-center max-w-lg mx-auto">
                        {errorMsg}
                    </div>
                )}
            </div>

            {appState === AppState.COMPLETE && resultImage && (
                <ResultDisplay 
                    originalImage={originalImage} 
                    resultImage={resultImage} 
                    generatedCode={null} 
                    prompt={lastPrompt} 
                />
            )}

            <footer className="relative z-10 py-6 text-center text-gray-600 text-sm mt-12">
               <p>&copy; 2024 NeonVibe Architect.</p>
            </footer>
        </main>
      ) : (
        <Workspace 
            messages={chatMessages}
            currentCode={previewHtml}
            isStreaming={isStreaming}
            onSendMessage={handleWorkspaceMessage}
            onCodeChange={handleCodeUpdate}
            onDownload={handleDownloadCode}
            onCancel={handleCancelGeneration}
        />
      )}
    </div>
  );
};

export default App;