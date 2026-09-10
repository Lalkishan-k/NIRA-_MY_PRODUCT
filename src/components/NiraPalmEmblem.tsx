import React from 'react';

interface NiraPalmEmblemProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export const NiraPalmEmblem: React.FC<NiraPalmEmblemProps> = ({
  className = 'w-6 h-6',
  color = 'currentColor'
}) => {
  return (
    <svg
      viewBox="0 0 100 120"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="NIRA Palm Tree Emblem"
    >
      {/* Authentic NIRA Stylized Coconut Palm Tree Silhouette */}
      <g fillRule="evenodd" clipRule="evenodd">
        {/* Top-most upright fronds */}
        <path d="M50 4 C48 14, 46 22, 50 30 C54 22, 52 14, 50 4 Z" />
        <path d="M50 8 C44 14, 38 22, 45 32 C47 24, 51 18, 50 8 Z" />
        <path d="M50 8 C56 14, 62 22, 55 32 C53 24, 49 18, 50 8 Z" />
        
        {/* Upper Left Fan Fronds with carved leaf notches */}
        <path d="M48 30 C38 18, 26 14, 12 20 C22 24, 28 32, 44 34 C41 28, 45 22, 48 30 Z" />
        <path d="M46 34 C32 26, 18 28, 6 38 C18 40, 28 44, 44 38 Z" />
        <path d="M45 38 C30 36, 14 42, 2 54 C14 53, 26 50, 42 42 Z" />
        <path d="M46 42 C32 46, 18 56, 8 72 C18 66, 30 58, 44 46 Z" />
        <path d="M48 45 C38 52, 26 64, 18 80 C26 72, 36 62, 46 48 Z" />

        {/* Upper Right Fan Fronds with carved leaf notches */}
        <path d="M52 30 C62 18, 74 14, 88 20 C78 24, 72 32, 56 34 C59 28, 55 22, 52 30 Z" />
        <path d="M54 34 C68 26, 82 28, 94 38 C82 40, 72 44, 56 38 Z" />
        <path d="M55 38 C70 36, 86 42, 98 54 C86 53, 74 50, 58 42 Z" />
        <path d="M54 42 C68 46, 82 56, 92 72 C82 66, 70 58, 56 46 Z" />
        <path d="M52 45 C62 52, 74 64, 82 80 C74 72, 64 62, 54 48 Z" />

        {/* Mid Crown density leaves */}
        <path d="M47 32 C41 22, 31 20, 20 25 C30 32, 40 35, 48 35 Z" />
        <path d="M53 32 C59 22, 69 20, 80 25 C70 32, 60 35, 52 35 Z" />
        <path d="M46 36 C36 34, 24 38, 14 46 C24 47, 36 44, 46 38 Z" />
        <path d="M54 36 C64 34, 76 38, 86 46 C76 47, 64 44, 54 38 Z" />

        {/* Gentle curved trunk */}
        <path d="M46 45 C47 65, 50 90, 54 116 C57 116, 60 115, 58 90 C55 65, 53 45, 52 45 Z" />
        
        {/* Bark Horizontal Ridge Lines on Trunk */}
        <line x1="47.5" y1="56" x2="52.5" y2="56" stroke="#FAF7F2" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="48.5" y1="68" x2="54" y2="68" stroke="#FAF7F2" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="49.5" y1="80" x2="55.5" y2="80" stroke="#FAF7F2" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="51" y1="92" x2="57" y2="92" stroke="#FAF7F2" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="52.5" y1="104" x2="58.5" y2="104" stroke="#FAF7F2" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
};
