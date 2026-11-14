import React from 'react';

interface LexiClashLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  useImage?: boolean;
}

export const LexiClashLogo: React.FC<LexiClashLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  useImage = true
}) => {
  const iconHeight = {
    xs: 'h-5',
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-14'
  }[size];

  const textClasses = {
    xs: 'text-xs',
    sm: 'text-sm font-bold',
    md: 'text-base font-extrabold',
    lg: 'text-xl font-extrabold',
    xl: 'text-2xl font-black'
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {useImage ? (
        <img
          src="/images/lexiclash-logo.jpg"
          alt="LexiClash Logo"
          className={`${iconHeight} w-auto object-contain rounded shadow-2xs`}
        />
      ) : (
        <LexiClashIcon size={size === 'xs' ? 20 : size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : 56} />
      )}
      {showText && (
        <span className={`tracking-tight font-sans leading-none ${textClasses}`}>
          <span className="text-[#001744] dark:text-slate-100">Lexi</span>
          <span className="text-[#0070F3]">Clash</span>
        </span>
      )}
    </div>
  );
};

export const LexiClashIcon: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Outer book angle / Left '<' code bracket in deep navy */}
      <path
        d="M48 18 L18 48 L48 78 L48 88 L8 48 L48 8 Z"
        fill="#001744"
        className="dark:fill-slate-100"
      />
      {/* Inner '<' cutout */}
      <path
        d="M48 28 L28 48 L48 68 L48 58 L38 48 L48 38 Z"
        fill="#001744"
        className="dark:fill-slate-100"
      />
      {/* Center spine */}
      <rect x="47" y="16" width="5" height="68" rx="2.5" fill="#001744" className="dark:fill-slate-100" />
      {/* Right turned pages layer in royal blue */}
      <path
        d="M54 22 L76 48 L54 74 L54 84 L86 48 L54 12 Z"
        fill="#0052CC"
      />
      {/* Forefront '>' code bracket in vibrant electric blue */}
      <path
        d="M54 28 L74 48 L54 68 L54 58 L64 48 L54 38 Z"
        fill="#0070F3"
      />
      {/* Modern code sparkle accents */}
      <polygon points="85,16 87,22 93,24 87,26 85,32 83,26 77,24 83,22" fill="#0070F3" />
      <polygon points="14,24 15,28 19,29 15,30 14,34 13,30 9,29 13,28" fill="#001744" className="dark:fill-blue-400" />
      <circle cx="88" cy="74" r="2.5" fill="#0070F3" />
      <circle cx="12" cy="72" r="2" fill="#0070F3" />
    </svg>
  );
};
