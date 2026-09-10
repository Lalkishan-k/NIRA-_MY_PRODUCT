import React from 'react';

interface CrackedCoconutPieceProps {
  className?: string;
  size?: number | string;
}

export const CrackedCoconutPiece: React.FC<CrackedCoconutPieceProps> = ({
  className = 'w-5 h-5'
}) => {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Cracked Coconut Piece"
    >
      <defs>
        {/* Coconut Husk Gradient */}
        <linearGradient id="huskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A2511" />
          <stop offset="60%" stopColor="#3C1E0E" />
          <stop offset="100%" stopColor="#251206" />
        </linearGradient>

        {/* Coconut Copra Meat Layer Gradient */}
        <linearGradient id="copraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="85%" stopColor="#F7F3EA" />
          <stop offset="100%" stopColor="#E6DCCB" />
        </linearGradient>

        {/* Inner Coconut Hollow Depth */}
        <radialGradient id="innerCavityGradient" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#F5EFE6" />
          <stop offset="70%" stopColor="#E2D4BF" />
          <stop offset="100%" stopColor="#C9B69C" />
        </radialGradient>
      </defs>

      {/* Drop Shadow for Realistic Depth */}
      <ellipse cx="24" cy="42" rx="16" ry="3.5" fill="#144D29" fillOpacity="0.18" />

      {/* Outer Fibrous Coconut Husk Shell */}
      <path
        d="M8 20 C6 28, 10 38, 22 41 C34 44, 42 36, 42 26 C42 16, 33 9, 23 8 C14 7, 9 14, 8 20 Z"
        fill="url(#huskGradient)"
        stroke="#2E1609"
        strokeWidth="1.2"
      />

      {/* Husk Natural Fiber Texture Marks */}
      <path d="M12 28 C10 32, 14 36, 18 38" stroke="#683B1D" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M26 40 C32 41, 38 37, 40 31" stroke="#683B1D" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M36 18 C39 22, 40 28, 38 34" stroke="#683B1D" strokeWidth="0.8" strokeLinecap="round" />

      {/* White Copra (Coconut Meat) Thick Inner Wall */}
      <path
        d="M12 18 C10 24, 13 32, 22 35 C31 38, 38 31, 38 23 C38 15, 31 10, 23 10 C17 10, 13 14, 12 18 Z"
        fill="url(#copraGradient)"
        stroke="#D4C5B0"
        strokeWidth="0.8"
      />

      {/* Inner Coconut Water / Hollow Cavity with Soft Glow */}
      <ellipse
        cx="24.5"
        cy="22.5"
        rx="8"
        ry="7.5"
        transform="rotate(-10 24.5 22.5)"
        fill="url(#innerCavityGradient)"
      />

      {/* Copra Highlight / Edge Reflection */}
      <path
        d="M16 14 C20 12, 26 12, 31 15"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};
