import React from 'react';

export function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      {/* Orb 1 — violet, top-left */}
      <div className="aurora-orb w-[700px] h-[700px] bg-[radial-gradient(circle,#7c3aed_0%,transparent_70%)] -top-[200px] -left-[200px] [animation-delay:0s]" />
      {/* Orb 2 — cyan, bottom-right */}
      <div className="aurora-orb w-[600px] h-[600px] bg-[radial-gradient(circle,#06b6d4_0%,transparent_70%)] -bottom-[150px] -right-[150px] [animation-delay:-6s]" />
      {/* Orb 3 — indigo, center */}
      <div className="aurora-orb w-[500px] h-[500px] bg-[radial-gradient(circle,#4f46e5_0%,transparent_70%)] top-[40%] left-[40%] -translate-x-1/2 -translate-y-1/2 [animation-delay:-12s]" />
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
