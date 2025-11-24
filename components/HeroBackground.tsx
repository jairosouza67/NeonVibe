import React from 'react';

export const HeroBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Central Neon Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse"></div>
      
      {/* Secondary darker glow */}
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-neon rounded-full mix-blend-screen filter blur-[100px] opacity-10"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent"></div>
    </div>
  );
};