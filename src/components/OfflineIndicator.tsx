import React from 'react';
import { WifiOff, Check } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500/95 dark:bg-amber-600/95 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-white shadow-xl shadow-amber-500/20 border border-amber-400">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
      </span>
      <WifiOff className="w-3.5 h-3.5" />
      <span>অফলাইন মোড — ক্যাশ করা ডেটা ও লোকাল ক্যালকুলেটর সক্রিয় রয়েছে</span>
    </div>
  );
};
