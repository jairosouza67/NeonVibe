import React, { useRef, useState, useEffect } from 'react';
import { Paperclip, Mic, ArrowUp, X, Palette, MicOff } from 'lucide-react';
import { ImageFile } from '../types';

interface PromptInputProps {
  onSubmit: (prompt: string, image: ImageFile | null) => void;
  onThemeToggle: () => void;
  isProcessing: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, onThemeToggle, isProcessing }) => {
  const [text, setText] = useState('');
  const [attachedImage, setAttachedImage] = useState<ImageFile | null>(null);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support of SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage({
          data: reader.result as string,
          mimeType: file.type,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!text.trim() && !attachedImage) return;
    onSubmit(text, attachedImage);
    setText('');
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative z-10">
      <div className={`
        relative bg-[#0f0f0f] border border-white/10 rounded-2xl p-4 shadow-2xl transition-all duration-300
        ${isProcessing ? 'opacity-50 pointer-events-none' : 'hover:border-neon/50 focus-within:border-neon focus-within:ring-1 focus-within:ring-neon/50'}
      `}>
        
        {attachedImage && (
          <div className="mb-4 flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10 w-fit">
            <div className="w-12 h-12 rounded overflow-hidden relative">
              <img src={attachedImage.data} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="text-xs text-gray-300 max-w-[150px] truncate">
              {attachedImage.name}
            </div>
            <button 
              onClick={handleRemoveImage}
              className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={attachedImage ? "Describe how to edit this image..." : "Ask NeonVibe to edit an image or create an app..."}
          className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg min-h-[60px]"
          rows={2}
        />

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <Paperclip className="w-4 h-4" />
              <span>Attach</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            
            <button 
              onClick={onThemeToggle}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <Palette className="w-4 h-4" />
              <span>Theme</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleListening}
              className={`p-2 transition-colors rounded-full ${isListening ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-gray-500 hover:text-white'}`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleSubmit}
              disabled={(!text && !attachedImage) || isProcessing}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${(!text && !attachedImage) || isProcessing 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-neon text-black hover:bg-neon-dim shadow-[0_0_15px_rgba(var(--neon-accent-rgb),0.4)]'}
              `}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};