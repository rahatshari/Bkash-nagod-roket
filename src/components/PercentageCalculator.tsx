import React, { useState, useEffect, useRef } from 'react';
import { 
  Percent, 
  Copy, 
  Check, 
  BookmarkCheck, 
  FileText, 
  TrendingUp,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { DigitMode, PercentageMode, HistoryRecord } from '../types';
import { 
  formatDisplayNumber, 
  toBnDigits, 
  toEnDigits, 
  parseNumberInput, 
  amountToBanglaWords,
  soundFx 
} from '../utils/numberConverter';
import { ReceiptModal } from './ReceiptModal';

interface PercentageCalculatorProps {
  digitMode: DigitMode;
  soundEnabled: boolean;
  onSaveHistory: (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => void;
}

export const PercentageCalculator: React.FC<PercentageCalculatorProps> = ({
  digitMode,
  soundEnabled,
  onSaveHistory,
}) => {
  // Mode: Extra per 100 (১০০ টাকায় বেশি) vs Deduction per 100 (১০০ টাকায় কম)
  const [mode, setMode] = useState<PercentageMode>('per_hundred_extra');

  // Input states - initialized completely empty
  const [baseAmountStr, setBaseAmountStr] = useState<string>('');
  const [ratePerHundredStr, setRatePerHundredStr] = useState<string>('');

  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);

  const baseAmount = parseNumberInput(baseAmountStr);
  const ratePerHundred = parseNumberInput(ratePerHundredStr);

  // Calculations
  // Extra amount = (baseAmount / 100) * ratePerHundred
  const extraAmount = (baseAmount * ratePerHundred) / 100;
  const ratePerThousand = ratePerHundred * 10;
  const totalAmount = mode === 'per_hundred_extra' 
    ? baseAmount + extraAmount 
    : Math.max(0, baseAmount - extraAmount);

  // Auto-save history with debounce
  const lastSavedRef = useRef<string>('');
  useEffect(() => {
    if (baseAmount <= 0 || ratePerHundred <= 0) return;
    const key = `${mode}_${baseAmount}_${ratePerHundred}`;
    if (lastSavedRef.current === key) return;

    const timer = setTimeout(() => {
      lastSavedRef.current = key;
      const title = mode === 'per_hundred_extra'
        ? `শতকরা লাভ/বেশি হিসাব (১০০ তে ${formatDisplayNumber(ratePerHundred, digitMode)} ৳)`
        : `শতকরা ছাড়/কম হিসাব (১০০ তে ${formatDisplayNumber(ratePerHundred, digitMode)} ৳)`;
      
      const subtitle = mode === 'per_hundred_extra'
        ? `মূল: ${formatDisplayNumber(baseAmount, digitMode)} ৳ | বেশি: ${formatDisplayNumber(extraAmount, digitMode, 2)} ৳ | মোট: ${formatDisplayNumber(totalAmount, digitMode, 2)} ৳`
        : `মূল: ${formatDisplayNumber(baseAmount, digitMode)} ৳ | কম: ${formatDisplayNumber(extraAmount, digitMode, 2)} ৳ | নিট: ${formatDisplayNumber(totalAmount, digitMode, 2)} ৳`;

      onSaveHistory({
        type: 'percentage',
        title,
        subtitle,
        data: {
          baseAmount,
          ratePerHundred,
          mode,
          extraAmount,
          totalWithExtra: totalAmount,
          ratePerThousand,
          date: new Date().toISOString()
        }
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [baseAmount, ratePerHundred, mode, totalAmount, extraAmount, ratePerThousand, digitMode, onSaveHistory]);

  const handleClearBase = () => {
    if (soundEnabled) soundFx.playTap();
    setBaseAmountStr('');
  };

  const handleResetRate = () => {
    if (soundEnabled) soundFx.playTap();
    setRatePerHundredStr('');
  };

  const handleCopy = async () => {
    if (soundEnabled) soundFx.playTap();
    const text = mode === 'per_hundred_extra'
      ? `শতকরা / লাভ হিসাব:\nমূল টাকা: ${formatDisplayNumber(baseAmount, digitMode)} ৳\nপ্রতি ১০০ টাকায় বেশি: ${formatDisplayNumber(ratePerHundred, digitMode)} ৳ (${formatDisplayNumber(ratePerHundred, digitMode)}%)\nহাজারে বেশি: ${formatDisplayNumber(ratePerThousand, digitMode)} ৳\nমোট বাড়তি/বেশি পাবেন: ${formatDisplayNumber(extraAmount, digitMode, 2)} ৳\nসর্বমোট পাবেন: ${formatDisplayNumber(totalAmount, digitMode, 2)} ৳`
      : `শতকরা / ছাড় হিসাব:\nমূল টাকা: ${formatDisplayNumber(baseAmount, digitMode)} ৳\nপ্রতি ১০০ টাকায় কম: ${formatDisplayNumber(ratePerHundred, digitMode)} ৳ (${formatDisplayNumber(ratePerHundred, digitMode)}%)\nমোট কম হবে: ${formatDisplayNumber(extraAmount, digitMode, 2)} ৳\nসর্বমোট দিতে হবে: ${formatDisplayNumber(totalAmount, digitMode, 2)} ৳`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleManualSave = () => {
    if (baseAmount <= 0) return;
    if (soundEnabled) soundFx.playSuccess();
    
    const title = mode === 'per_hundred_extra'
      ? `শতকরা লাভ/বেশি হিসাব (১০০ তে ${formatDisplayNumber(ratePerHundred, digitMode)} ৳)`
      : `শতকরা ছাড়/কম হিসাব (১০০ তে ${formatDisplayNumber(ratePerHundred, digitMode)} ৳)`;
    
    const subtitle = mode === 'per_hundred_extra'
      ? `মূল: ${formatDisplayNumber(baseAmount, digitMode)} ৳ | বেশি: ${formatDisplayNumber(extraAmount, digitMode, 2)} ৳ | মোট: ${formatDisplayNumber(totalAmount, digitMode, 2)} ৳`
      : `মূল: ${formatDisplayNumber(baseAmount, digitMode)} ৳ | কম: ${formatDisplayNumber(extraAmount, digitMode, 2)} ৳ | নিট: ${formatDisplayNumber(totalAmount, digitMode, 2)} ৳`;

    onSaveHistory({
      type: 'percentage',
      title,
      subtitle,
      data: {
        baseAmount,
        ratePerHundred,
        mode,
        extraAmount,
        totalWithExtra: totalAmount,
        ratePerThousand,
        date: new Date().toISOString()
      }
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
        {/* Header & Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Percent className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              শতকরা ও লাভ-কমিশন হিসাব
            </h2>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playTap();
                setMode('per_hundred_extra');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                mode === 'per_hundred_extra'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ১০০ টাকায় বেশি (লাভ)
            </button>
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playTap();
                setMode('per_hundred_less');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                mode === 'per_hundred_less'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ১০০ টাকায় কম (ছাড়)
            </button>
          </div>
        </div>

        {/* 1. Base Amount Input */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                মূল টাকার পরিমাণ (যেমন: ১০,০০০ রুপি বা টাকা)
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={digitMode === 'bn' ? toBnDigits(baseAmountStr) : toEnDigits(baseAmountStr)}
                onChange={(e) => {
                  const raw = toEnDigits(e.target.value);
                  if (/^[0-9.]*$/.test(raw)) setBaseAmountStr(raw);
                }}
                placeholder={digitMode === 'bn' ? 'মূল টাকা লিখুন' : 'Enter amount'}
                className="w-full text-2xl sm:text-3xl font-extrabold px-4 py-3 pl-12 pr-28 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-slate-900 dark:text-white transition"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ৳
              </span>
              {baseAmountStr && (
                <button
                  type="button"
                  onClick={handleClearBase}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-500 dark:text-rose-400 text-sm font-black transition-all cursor-pointer border border-rose-500/30 shadow-sm"
                  title="লেখা মুছুন"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>মুছুন</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Rate per 100 Input (১০০ টাকায় কত টাকা বেশি দেবে) */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                {mode === 'per_hundred_extra' ? '১০০ টাকায় কত বেশি দেবে?' : '১০০ টাকায় কত কম হবে?'}
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                (হাজারে {formatDisplayNumber(ratePerThousand, digitMode, 0)} ৳ বা {formatDisplayNumber(ratePerHundred, digitMode, 1)}%)
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={digitMode === 'bn' ? toBnDigits(ratePerHundredStr) : toEnDigits(ratePerHundredStr)}
                  onChange={(e) => {
                    const raw = toEnDigits(e.target.value);
                    if (/^[0-9.]*$/.test(raw)) setRatePerHundredStr(raw);
                  }}
                  className="w-20 sm:w-24 text-center font-extrabold text-base sm:text-lg px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                  placeholder={digitMode === 'bn' ? 'যেমন: ২৭' : 'e.g. 27'}
                />
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">৳/১০০</span>
              {ratePerHundredStr !== '' && (
                <button
                  onClick={handleResetRate}
                  title="২৭ ৳ রিস্টোর করুন"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Immediate Results Breakdown */}
        <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white shadow-lg shadow-indigo-700/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-indigo-100 font-semibold mb-1">
            <span>
              {mode === 'per_hundred_extra' ? 'মোট বেশি বা লাভ পাবেন:' : 'মোট ছাড় বা কম হবে:'}
            </span>
            <span className="bg-indigo-500/30 px-2 py-0.5 rounded-md text-[11px] font-bold border border-indigo-400/30">
              {formatDisplayNumber(ratePerHundred, digitMode, 1)}% হিসাব
            </span>
          </div>

          {/* Big Amount - Extra Amount */}
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            ৳ {formatDisplayNumber(extraAmount, digitMode, 2)}
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-black/20 text-xs">
            <div>
              <span className="text-indigo-200 text-[11px] block">
                {mode === 'per_hundred_extra' ? 'বেশি টাকাসহ সর্বমোট:' : 'ছাড় বাদে সর্বমোট:'}
              </span>
              <span className="font-bold text-sm text-emerald-300">
                {formatDisplayNumber(totalAmount, digitMode, 2)} ৳
              </span>
            </div>
            <div>
              <span className="text-indigo-200 text-[11px] block">হাজারে লাভ/বেশি:</span>
              <span className="font-bold text-sm text-amber-300">
                {formatDisplayNumber(ratePerThousand, digitMode, 0)} ৳ / ১০০০
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-indigo-200 text-[11px] block">মূল টাকা:</span>
              <span className="font-semibold text-xs text-indigo-100">
                {formatDisplayNumber(baseAmount, digitMode, 2)} ৳
              </span>
            </div>
          </div>

          {/* Bangla in words */}
          {totalAmount > 0 && (
            <div className="mt-2.5 text-xs text-indigo-100/90 font-medium">
              কথায়: {amountToBanglaWords(totalAmount)}
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-indigo-500/30">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition text-xs font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-indigo-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
            </button>

            <button
              onClick={() => setShowReceipt(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition text-xs font-semibold cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>রসিদ দেখুন</span>
            </button>

            <button
              onClick={handleManualSave}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition text-xs font-semibold cursor-pointer"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>{saved ? 'সেভ হয়েছে' : 'সেভ করুন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {showReceipt && (
        <ReceiptModal
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          title="শতকরা ও লাভ হিসাব রসিদ"
          subtitle={`১০০ টাকায় ${formatDisplayNumber(ratePerHundred, digitMode, 1)} ৳ হারে`}
          items={[
            { label: 'মূল টাকার পরিমাণ', value: `${formatDisplayNumber(baseAmount, digitMode, 2)} ৳` },
            { label: 'প্রতি ১০০ টাকায়', value: `${formatDisplayNumber(ratePerHundred, digitMode, 1)} ৳ (${formatDisplayNumber(ratePerHundred, digitMode, 1)}%)` },
            { label: 'প্রতি ১,০০০ টাকায়', value: `${formatDisplayNumber(ratePerThousand, digitMode, 0)} ৳` },
            { 
              label: mode === 'per_hundred_extra' ? 'মোট বাড়তি/লাভ' : 'মোট ছাড়/কম', 
              value: `${formatDisplayNumber(extraAmount, digitMode, 2)} ৳`,
              isHighlight: true 
            }
          ]}
          totalAmountText={`${formatDisplayNumber(totalAmount, digitMode, 2)} ৳`}
          rawAmount={totalAmount}
          digitMode={digitMode}
        />
      )}
    </div>
  );
};
