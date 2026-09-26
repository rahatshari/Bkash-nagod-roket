/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TabType, DigitMode, HistoryRecord } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MfsCalculator } from './components/MfsCalculator';
import { PercentageCalculator } from './components/PercentageCalculator';
import { RemittanceCalculator } from './components/RemittanceCalculator';
import { WeightCalculator } from './components/WeightCalculator';
import { HistoryView } from './components/HistoryView';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Tab State: mfs -> percentage -> weight -> remittance -> history
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

  // Always enforce clean, modern dark app styling as requested
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

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
    // Keep up to 60 recent calculation records
    setHistory((prev) => [newRecord, ...prev.slice(0, 59)]);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full flex flex-col overflow-hidden bg-slate-950 text-slate-100 select-none overscroll-none font-sans">
      {/* 1. Top Header Bar */}
      <Header
        digitMode={digitMode}
        setDigitMode={setDigitMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* 2. Main Full-Screen Scrollable Area */}
      <main className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 py-4 sm:py-6">
        <div className="max-w-2xl mx-auto w-full pb-4">
          <AnimatePresence mode="wait">
            {activeTab === 'mfs' && (
              <motion.div
                key="mfs"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <MfsCalculator
                  digitMode={digitMode}
                  soundEnabled={soundEnabled}
                  onSaveHistory={handleSaveHistory}
                />
              </motion.div>
            )}

            {activeTab === 'percentage' && (
              <motion.div
                key="percentage"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <PercentageCalculator
                  digitMode={digitMode}
                  soundEnabled={soundEnabled}
                  onSaveHistory={handleSaveHistory}
                />
              </motion.div>
            )}

            {activeTab === 'weight' && (
              <motion.div
                key="weight"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <WeightCalculator
                  digitMode={digitMode}
                  soundEnabled={soundEnabled}
                  onSaveHistory={handleSaveHistory}
                />
              </motion.div>
            )}

            {activeTab === 'remittance' && (
              <motion.div
                key="remittance"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <RemittanceCalculator
                  digitMode={digitMode}
                  soundEnabled={soundEnabled}
                  onSaveHistory={handleSaveHistory}
                />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
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
        </div>
      </main>

      {/* 3. Floating Offline Status Banner */}
      <OfflineIndicator />

      {/* 4. Bottom App Navigation Bar (Always Visible at Bottom for Rapid Navigation) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        historyCount={history.length}
      />
    </div>
  );
}
