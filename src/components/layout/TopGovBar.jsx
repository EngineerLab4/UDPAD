import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export const TopGovBar = () => {
  const [fontSize, setFontSize] = useState('normal');

  const adjustFont = (size) => {
    setFontSize(size);
    if (size === 'small') {
      document.documentElement.style.fontSize = '14px';
    } else if (size === 'normal') {
      document.documentElement.style.fontSize = '16px';
    } else if (size === 'large') {
      document.documentElement.style.fontSize = '18px';
    }
  };

  return (
    <div className="bg-[#0f2c4d] text-white text-xs border-b border-[#174A7E]/40">
      {/* Tricolor hairline accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* Left: National Platform Label */}
        <div className="flex items-center gap-3">
          <span className="font-medium tracking-wide flex items-center gap-1.5 text-slate-200">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
            सार्वजनिक दस्तावेज़ एवं कल्याण सेवा मंच | Public Welfare & Documentation
          </span>
        </div>

        {/* Right: Accessibility Controls & Session Status */}
        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 mr-1">Text:</span>
            <button
              onClick={() => adjustFont('small')}
              className={`px-1.5 py-0.5 rounded text-[11px] hover:bg-white/10 ${fontSize === 'small' ? 'bg-white/20 font-bold text-white' : ''}`}
              title="Small text"
              aria-label="Decrease font size"
            >
              A-
            </button>
            <button
              onClick={() => adjustFont('normal')}
              className={`px-1.5 py-0.5 rounded text-[11px] hover:bg-white/10 ${fontSize === 'normal' ? 'bg-white/20 font-bold text-white' : ''}`}
              title="Default text"
              aria-label="Standard font size"
            >
              A
            </button>
            <button
              onClick={() => adjustFont('large')}
              className={`px-1.5 py-0.5 rounded text-[11px] hover:bg-white/10 ${fontSize === 'large' ? 'bg-white/20 font-bold text-white' : ''}`}
              title="Large text"
              aria-label="Increase font size"
            >
              A+
            </button>
          </div>

          <div className="border-l border-slate-600 pl-3 hidden sm:flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">Secure Citizen Session</span>
          </div>
        </div>
      </div>
    </div>
  );
};
