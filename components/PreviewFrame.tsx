import React, { useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

interface PreviewFrameProps {
  code: string;
}

export const PreviewFrame: React.FC<PreviewFrameProps> = ({ code }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      // We explicitly write to the document to ensure scripts execute properly on update
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    }
  }, [code]);

  if (!code) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] text-gray-500 border border-white/10 rounded-xl">
        <div className="animate-pulse flex flex-col items-center">
            <RefreshCw className="w-8 h-8 mb-2 opacity-50" />
            <p>Waiting for code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
      <div className="absolute top-0 left-0 right-0 h-6 bg-[#1a1a1a] flex items-center px-4 gap-2 border-b border-white/10 z-10">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        <div className="mx-auto text-[10px] text-gray-500 font-mono">localhost:3000</div>
      </div>
      <iframe
        ref={iframeRef}
        title="App Preview"
        className="w-full h-full pt-6 bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
      />
    </div>
  );
};
