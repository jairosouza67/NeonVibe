import React from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (newCode: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  return (
    <div className="w-full h-full bg-[#0d0d0d] rounded-xl border border-white/10 flex flex-col overflow-hidden font-mono text-sm">
      <div className="flex items-center px-4 py-2 border-b border-white/5 bg-white/5 text-xs text-gray-500 select-none">
        <span>index.html (Bundled Source)</span>
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 w-full h-full p-4 bg-transparent text-gray-300 resize-none focus:outline-none focus:ring-0 selection:bg-neon/30 selection:text-white leading-relaxed"
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
      />
    </div>
  );
};