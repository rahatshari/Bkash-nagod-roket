import React, { useState } from 'react';
import { Download, CheckCircle2, X, Smartphone, ArrowDown } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>অ্যাপ ইনস্টল্ড</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition active:scale-95 cursor-pointer"
        title="অফলাইনে ব্যবহারের জন্য অ্যাপটি ইনস্টল করুন"
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span>ইনস্টল করুন</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/50 px-2.5 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>iOS এ ইনস্টল</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">iPhone / iPad এ ইনস্টল</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">১</span>
                  <p>Safari ব্রাউজারের নিচের <strong>Share</strong> (শেয়ার) বাটনে চাপ দিন।</p>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">২</span>
                  <p>মেনু একটু স্ক্রোল করে <strong>Add to Home Screen</strong> এ চাপুন।</p>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">৩</span>
                  <p>উপরে <strong>Add</strong> বাটনে চাপলেই হোমস্ক্রিনে অ্যাপ তৈরি হবে এবং অফলাইনে কাজ করবে!</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                বুঝেছি, বন্ধ করুন
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers without direct prompt (e.g. Firefox or desktop Safari)
  return (
    <div className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/60">
      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      <span>অফলাইন রেডি</span>
    </div>
  );
};
