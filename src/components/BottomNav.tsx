import React from 'react';
import { Coins, Percent, Scale, Globe2, BookOpen } from 'lucide-react';
import { TabType } from '../types';
import { soundFx } from '../utils/numberConverter';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  soundEnabled: boolean;
  historyCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  soundEnabled,
  historyCount,
}) => {
  const handleTabChange = (tab: TabType) => {
    if (soundEnabled) soundFx.playTap();
    setActiveTab(tab);
  };

  const navItems = [
    { id: 'mfs' as TabType, label: 'ক্যাশ আউট', icon: Coins },
    { id: 'percentage' as TabType, label: 'শতকরা লাভ', icon: Percent },
    { id: 'weight' as TabType, label: 'ওজন ও দাম', icon: Scale },
    { id: 'remittance' as TabType, label: 'রেমিট্যান্স', icon: Globe2 },
    { id: 'history' as TabType, label: 'হিস্ট্রি', icon: BookOpen, badge: historyCount },
  ];

  return (
    <nav className="flex-shrink-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl select-none z-30 pb-safe transition-all duration-300">
      <div className="max-w-2xl mx-auto px-2">
        <div className="grid grid-cols-5 h-16 sm:h-18 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`group relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer ${
                  isActive
                    ? 'text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Active Indicator bar */}
                {isActive && (
                  <span className="absolute -top-1 w-8 h-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50" />
                )}

                <div
                  className={`relative p-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 scale-105 shadow-inner'
                      : 'group-hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform duration-200" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight truncate max-w-full transition-colors ${
                  isActive ? 'font-black text-emerald-400' : 'font-semibold text-slate-400'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
