import React, { useState } from 'react';
import elaLogoPng from '../assets/images/ela_logo.png';

interface ElaOfficialLogoProps {
  className?: string;
  variant?: 'full' | 'mark' | 'inline' | 'badge';
  alt?: string;
  showText?: boolean;
}

export const ElaOfficialLogo: React.FC<ElaOfficialLogoProps> = ({
  className = 'w-10 h-10',
  variant = 'badge',
  alt = 'ELA naturals logo',
  showText = false
}) => {
  const [imgSrc, setImgSrc] = useState<string>('/images/E l a (71).png');

  const handleError = () => {
    if (imgSrc !== elaLogoPng) {
      setImgSrc(elaLogoPng);
    }
  };

  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-2.5">
        <img
          src={imgSrc}
          onError={handleError}
          alt={alt}
          className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0"
          loading="eager"
        />
        {showText && (
          <span className="font-brand text-xl sm:text-2xl font-bold text-[#144D29] dark:text-emerald-400 tracking-wide block leading-none">
            ELA naturals
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      onError={handleError}
      alt={alt}
      className={`object-contain transition-transform duration-300 hover:scale-105 ${className}`}
      loading="eager"
    />
  );
};

export default ElaOfficialLogo;
