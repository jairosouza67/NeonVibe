import React from 'react';
import { Download, ArrowRight, Terminal, Copy, Check } from 'lucide-react';

interface ResultDisplayProps {
  originalImage: string | null;
  resultImage: string | null;
  generatedCode: string | null;
  prompt: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImage, resultImage, generatedCode, prompt }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 1. Text/Code Generation View
  if (generatedCode) {
      return (
        <div className="w-full max-w-4xl mx-auto mt-12 animate-fade-in-up">
            <div className="flex flex-col gap-6">
                <div className="text-center space-y-2">
                    <span className="inline-block px-3 py-1 text-xs font-mono text-neon bg-neon/10 rounded-full border border-neon/20">
                        APP CONCEPT GENERATED
                    </span>
                    <h2 className="text-xl font-medium text-white opacity-80">"{prompt}"</h2>
                </div>

                <div className="bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                    <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-neon" />
                            <span className="text-xs font-mono text-gray-400">Component.tsx</span>
                        </div>
                        <button 
                            onClick={handleCopy}
                            className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied' : 'Copy Code'}
                        </button>
                    </div>
                    <div className="p-4 overflow-x-auto max-h-[600px] custom-scrollbar">
                        <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {generatedCode.replace(/^```tsx|```$/g, '')}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // 2. Image Editing View
  if (originalImage && resultImage) {
    return (
        <div className="w-full max-w-5xl mx-auto mt-12 animate-fade-in-up">
        <div className="flex flex-col gap-6">
            <div className="text-center space-y-2">
                <span className="inline-block px-3 py-1 text-xs font-mono text-neon bg-neon/10 rounded-full border border-neon/20">
                    IMAGE EDITED
                </span>
                <h2 className="text-xl font-medium text-white">"{prompt}"</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-items-center">
                {/* Original */}
                <div className="relative group w-full max-w-md">
                    <div className="absolute -inset-1 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur text-xs font-bold text-gray-300 rounded">
                            ORIGINAL
                        </div>
                        <img src={originalImage} alt="Original" className="w-full h-auto object-contain" />
                    </div>
                </div>

                {/* Arrow on Desktop */}
                <div className="hidden md:flex items-center justify-center text-neon">
                    <ArrowRight className="w-8 h-8 opacity-50 animate-pulse" />
                </div>

                {/* Result */}
                <div className="relative group w-full max-w-md">
                    <div className="absolute -inset-1 bg-gradient-to-r from-neon to-emerald-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                    <div className="relative rounded-xl overflow-hidden border border-neon/30 bg-[#0a0a0a]">
                        <div className="absolute top-3 left-3 px-2 py-1 bg-neon/20 backdrop-blur text-xs font-bold text-neon rounded border border-neon/30">
                            GEMINI 2.5 FLASH EDIT
                        </div>
                        <img src={resultImage} alt="Result" className="w-full h-auto object-contain" />
                        
                        <a 
                            href={resultImage} 
                            download="neonvibe-edit.png"
                            className="absolute bottom-3 right-3 p-2 bg-black/70 hover:bg-neon hover:text-black text-white rounded-full transition-all border border-white/10"
                        >
                            <Download className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
  }

  return null;
};
