/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Globe2, 
  Scale, 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone,
  Info
} from 'lucide-react';
import { TabType, DigitMode, HistoryRecord } from './types';
import { Header } from './components/Header';
import { MfsCalculator } from './components/MfsCalculator';
import { RemittanceCalculator } from './components/RemittanceCalculator';
import { WeightCalculator } from './components/WeightCalculator';
import { HistoryView } from './components/HistoryView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { formatDisplayNumber, soundFx } from './utils/numberConverter';

export default function App() {
  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>('mfs');

  // Digit Mode: 'bn' (বাংলা সংখ্যা) or 'en' (English digits)
  const [digitMode, setDigitMode] = useState<DigitMode>(() => {
    try {
      return (localStorage.getItem('digit_mode') as DigitMode) || 'bn';
    } catch {
      return 'bn';
    }
  });

  // Sound Feedback
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const val = localStorage.getItem('sound_enabled');
      return val !== null ? val === 'true' : true;
    } catch {
      return true;
    }
  });

  // Theme (Dark / Light)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('theme_mode');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Calculation History
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('calc_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Save Settings & Theme Class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme_mode', isDark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem('digit_mode', digitMode);
    } catch {
      // ignore
    }
  }, [digitMode]);

  useEffect(() => {
    try {
      localStorage.setItem('sound_enabled', String(soundEnabled));
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('calc_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // History Handlers
  const handleSaveHistory = (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => {
    const newRecord: HistoryRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newRecord, ...prev.slice(0, 49)]); // keep latest 50
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors pb-20 sm:pb-12">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        digitMode={digitMode}
        setDigitMode={setDigitMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        isDark={isDark}
        setIsDark={setIsDark}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'mfs' && (
            <motion.div
              key="mfs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <MfsCalculator
                digitMode={digitMode}
                soundEnabled={soundEnabled}
                onSaveHistory={handleSaveHistory}
              />
            </motion.div>
          )}

          {activeTab === 'remittance' && (
            <motion.div
              key="remittance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <RemittanceCalculator
                digitMode={digitMode}
                soundEnabled={soundEnabled}
                onSaveHistory={handleSaveHistory}
              />
            </motion.div>
          )}

          {activeTab === 'weight' && (
            <motion.div
              key="weight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <WeightCalculator
                digitMode={digitMode}
                soundEnabled={soundEnabled}
                onSaveHistory={handleSaveHistory}
              />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <HistoryView
                history={history}
                onClearHistory={handleClearHistory}
                onDeleteItem={handleDeleteHistoryItem}
                digitMode={digitMode}
                soundEnabled={soundEnabled}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature Highlights & Quick Reference Cards */}
        <section className="mt-10 pt-8 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                MFS ক্যাশ আউট নিশ্চয়তা
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                বিকাশ, নগদ, রকেটে গ্রাহক নির্দিষ্ট টাকা হাতে পেতে চাইলে বাড়তি কত দিতে হবে তা মুহূর্তেই নির্ভুলভাবে হিসাব করুন।
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                প্রবাসী রেমিট্যান্স ও ২.৫% বোনাস
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                সৌদি আরব, দুবাই বা যে কোনো দেশের মুদ্রার বর্তমান রেট এবং সরকারি ২.৫% প্রণোদনা সহ সর্বমোট টাকা বের করুন।
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                পণ্যের ওজন ও দামের সমীকরণ
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                ১ কেজি ২৫০ টাকা হলে ২ কেজি ৭০০ গ্রাম বা ১০০ টাকায় কত গ্রাম পাওয়া যাবে তা চোখের পলকে গণনা করুন।
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Offline Status Banner */}
      <OfflineIndicator />

      {/* Mobile Bottom Navigation Bar for easy one-thumb switching */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => {
            if (soundEnabled) soundFx.playTap();
            setActiveTab('mfs');
          }}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl text-[10px] font-bold transition cursor-pointer ${
            activeTab === 'mfs'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>ক্যাশ আউট</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) soundFx.playTap();
            setActiveTab('remittance');
          }}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl text-[10px] font-bold transition cursor-pointer ${
            activeTab === 'remittance'
              ? 'text-teal-600 dark:text-teal-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>রেমিট্যান্স</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) soundFx.playTap();
            setActiveTab('weight');
          }}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl text-[10px] font-bold transition cursor-pointer ${
            activeTab === 'weight'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>ওজন ও দাম</span>
        </button>

        <button
          onClick={() => {
            if (soundEnabled) soundFx.playTap();
            setActiveTab('history');
          }}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl text-[10px] font-bold transition cursor-pointer relative ${
            activeTab === 'history'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>খাতা</span>
          {history.length > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
          )}
        </button>
      </div>
    </div>
  );
}
