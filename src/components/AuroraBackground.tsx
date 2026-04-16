import React from 'react';

export function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      {/* Orb 1 — blue, top-left */}
      <div className="aurora-orb w-[800px] h-[800px] bg-[radial-gradient(circle,#2563eb_0%,transparent_70%)] -top-[300px] -left-[200px] [animation-delay:0s]" />
      {/* Orb 2 — sky, bottom-right */}
      <div className="aurora-orb w-[700px] h-[700px] bg-[radial-gradient(circle,#0ea5e9_0%,transparent_70%)] -bottom-[200px] -right-[150px] [animation-delay:-6s]" />
      {/* Orb 3 — white, center */}
      <div className="aurora-orb w-[600px] h-[600px] bg-[radial-gradient(circle,#ffffff_0%,transparent_70%)] top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 [animation-delay:-12s]" />
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
