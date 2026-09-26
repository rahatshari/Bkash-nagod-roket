import React from 'react';
import { 
  Calculator, 
  Coins, 
  Scale, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun,
  Globe2
} from 'lucide-react';
import { TabType, DigitMode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { soundFx } from '../utils/numberConverter';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  digitMode: DigitMode;
  setDigitMode: (mode: DigitMode) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  digitMode,
  setDigitMode,
  soundEnabled,
  setSoundEnabled,
  isDark,
  setIsDark,
  historyCount
}) => {
  const handleTabChange = (tab: TabType) => {
    if (soundEnabled) soundFx.playTap();
    setActiveTab(tab);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) soundFx.playTap();
  };

  const toggleDigitMode = () => {
    if (soundEnabled) soundFx.playTap();
    setDigitMode(digitMode === 'bn' ? 'en' : 'bn');
  };

  const toggleTheme = () => {
    if (soundEnabled) soundFx.playTap();
    setIsDark(!isDark);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center text-white">
              <div className="w-full h-full rounded-[14px] bg-emerald-600 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-amber-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                  হিসাব বন্ধু
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden xs:block">
                বিকাশ-নগদ, রেমিট্যান্স ও ওজন ক্যালকুলেটর
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Install Button */}
            <PWAInstallButton />

            {/* Digit Toggle Button (বাংলা / English) */}
            <button
              onClick={toggleDigitMode}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition cursor-pointer"
              title="সংখ্যা ফরম্যাট পরিবর্তন (বাংলা / ইংরেজি)"
            >
              <Globe2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{digitMode === 'bn' ? 'বাংলা (১২৩)' : 'English (123)'}</span>
            </button>

            {/* Sound Toggle Button */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition cursor-pointer"
              title={soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition cursor-pointer"
              title={isDark ? 'লাইট মোড' : 'ডার্ক মোড'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 -mx-2 px-2 scrollbar-none">
          <button
            onClick={() => handleTabChange('mfs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'mfs'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>MFS ক্যাশ আউট</span>
          </button>

          <button
            onClick={() => handleTabChange('remittance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'remittance'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>প্রবাসী রেমিট্যান্স</span>
          </button>

          <button
            onClick={() => handleTabChange('weight')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'weight'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>ওজন ও দাম</span>
          </button>

          <button
            onClick={() => handleTabChange('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ml-auto cursor-pointer ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>হিসাবের খাতা</span>
            {historyCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'history' ? 'bg-white text-emerald-700' : 'bg-emerald-500 text-white'
              }`}>
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
