import React from 'react';
import { 
  Calculator, 
  Volume2, 
  VolumeX, 
  Globe2
} from 'lucide-react';
import { DigitMode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { soundFx } from '../utils/numberConverter';

interface HeaderProps {
  digitMode: DigitMode;
  setDigitMode: (mode: DigitMode) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  digitMode,
  setDigitMode,
  soundEnabled,
  setSoundEnabled
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) soundFx.playTap();
  };

  const toggleDigitMode = () => {
    if (soundEnabled) soundFx.playTap();
    setDigitMode(digitMode === 'bn' ? 'en' : 'bn');
  };

  return (
    <header className="flex-shrink-0 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 select-none shadow-md z-30 transition-all duration-300">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Top App Bar */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1">
                  হিসাব বন্ধু
                </h1>
                <span className="text-[10px] font-black tracking-widest px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  PRO
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 -mt-0.5 hidden xs:block">
                সব হিসাব এক জায়গায়
              </p>
            </div>
          </div>

          {/* Quick Utility Actions */}
          <div className="flex items-center gap-2">
            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Digit Language Switcher (বাংলা / EN) */}
            <button
              onClick={toggleDigitMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-800/90 text-xs font-bold text-slate-200 hover:bg-slate-700/80 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="সংখ্যা ফরম্যাট পরিবর্তন (বাংলা / ইংরেজি)"
            >
              <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px]">{digitMode === 'bn' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Audio Feedback Toggle Button */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl border border-slate-700/80 bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700/80 active:scale-95 transition-all shadow-xs cursor-pointer"
              title={soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
