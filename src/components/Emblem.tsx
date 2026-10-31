import React from 'react';

interface EmblemProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
}

export const Emblem: React.FC<EmblemProps> = ({
  className = '',
  size = 'md',
  showGlow = true,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center ${dim} ${className} select-none`}>
      {/* Electric Blue Glow */}
      {showGlow && (
        <div className="absolute -inset-1 rounded-2xl bg-blue-600/70 blur-md pointer-events-none animate-pulse" />
      )}

      {/* Blue & White Heraldic Cyber Security Crest / Emblem */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_0_14px_rgba(59,130,246,0.9)]"
      >
        <defs>
          {/* Vibrant Blue Gradients */}
          <linearGradient id="emblemBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="40%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id="emblemInnerBlue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#0c215e" />
          </linearGradient>

          {/* White Sheen Highlight */}
          <radialGradient id="emblemWhiteGlow" cx="50%" cy="30%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Shield Base - Rich Blue with Pure White Rim */}
        <path
          d="M50 4 L88 18 C88 56 68 84 50 96 C32 84 12 56 12 18 Z"
          fill="url(#emblemBlueGrad)"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner Shield Body - Deep Blue with White Accent Rim */}
        <path
          d="M50 11 L81 23 C81 53 64 78 50 88 C36 78 19 53 19 23 Z"
          fill="url(#emblemInnerBlue)"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* White Sheen Overlay */}
        <path
          d="M50 11 L81 23 C81 53 64 78 50 88 C36 78 19 53 19 23 Z"
          fill="url(#emblemWhiteGlow)"
        />

        {/* Stylized White Heraldic Chevrons / Crest Wings */}
        <path
          d="M26 36 L50 24 L74 36 L70 42 L50 32 L30 42 Z"
          fill="#ffffff"
        />
        <path
          d="M30 47 L50 38 L70 47 L66 53 L50 45 L34 53 Z"
          fill="#ffffff"
        />

        {/* Central Core Shield - Pure White with Blue Outline */}
        <path
          d="M50 49 L62 56 C62 67 56 75 50 79 C44 75 38 67 38 56 Z"
          fill="#ffffff"
          stroke="#2563eb"
          strokeWidth="1.5"
        />

        {/* Central Star in Royal Blue */}
        <path
          d="M50 54 L52 61 L59 63 L52 65 L50 72 L48 65 L41 63 L48 61 Z"
          fill="#1d4ed8"
        />

        {/* Top White Constellation / Star Nodes */}
        <circle cx="50" cy="18" r="2.8" fill="#ffffff" />
        <circle cx="36" cy="22" r="1.8" fill="#ffffff" />
        <circle cx="64" cy="22" r="1.8" fill="#ffffff" />
      </svg>
    </div>
  );
};
