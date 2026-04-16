import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-20'
  };

  return (
    <img 
      src="https://lh3.googleusercontent.com/d/1Jm2Xbyd-6Xi1mqhE7foilH7L8S5xe1te" 
      alt="eCard.mn" 
      className={cn(sizes[size], className)}
      referrerPolicy="no-referrer"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        // Fallback to thumbnail URL if content link fails
        if (!target.src.includes('thumbnail')) {
          target.src = 'https://drive.google.com/thumbnail?id=1Jm2Xbyd-6Xi1mqhE7foilH7L8S5xe1te&sz=w1000';
        }
      }}
    />
  );
}
