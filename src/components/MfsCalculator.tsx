import React, { useState, useEffect, useRef } from 'react';
import { 
  Coins, 
  Copy, 
  Check, 
  FileText, 
  BookmarkCheck, 
  RotateCcw,
  ArrowRightLeft,
  Trash2
} from 'lucide-react';
import { DigitMode, MfsCalculationMode, HistoryRecord } from '../types';
import { 
  formatDisplayNumber, 
  toBnDigits, 
  toEnDigits, 
  parseNumberInput, 
  amountToBanglaWords,
  soundFx 
} from '../utils/numberConverter';
import { ReceiptModal } from './ReceiptModal';

interface MfsCalculatorProps {
  digitMode: DigitMode;
  soundEnabled: boolean;
  onSaveHistory: (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => void;
}

export const MfsCalculator: React.FC<MfsCalculatorProps> = ({
  digitMode,
  soundEnabled,
  onSaveHistory
}) => {
  // State: Empty inputs by default so user never has to backspace
  const [amountStr, setAmountStr] = useState<string>('');
  const [rateStr, setRateStr] = useState<string>('');
  const [mode, setMode] = useState<MfsCalculationMode>('net_in_hand');
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);

  const amount = parseNumberInput(amountStr);
  const ratePerThousand = rateStr !== '' ? (parseNumberInput(rateStr) || 0) : 15;

  // Calculations
  // Fee = amount * (rate / 1000)
  const fee = amount * (ratePerThousand / 1000);
  
  // In 'net_in_hand' mode: customer gets exact `amount` in cash, so they must send (amount + fee)
  const totalToPay = amount + fee;

  // In 'from_balance' mode: customer sends `amount`, fee is deducted, cash received is (amount - fee)
  const cashReceivedFromBalance = Math.max(0, amount - fee);

  const activeTotal = mode === 'net_in_hand' ? totalToPay : amount;
  const activeFee = fee;
  const activeCashInHand = mode === 'net_in_hand' ? amount : cashReceivedFromBalance;

  // Auto-save history with debounce
  const lastSavedRef = useRef<string>('');
  useEffect(() => {
    if (amount <= 0 || ratePerThousand <= 0) return;
    const key = `${mode}_${amount}_${ratePerThousand}`;
    if (lastSavedRef.current === key) return;

    const timer = setTimeout(() => {
      lastSavedRef.current = key;
      const title = `ক্যাশ আউট হিসাব (হাজারে ${formatDisplayNumber(ratePerThousand, digitMode)} ৳)`;
      const subtitle = mode === 'net_in_hand'
        ? `হাতে পাবেন: ${formatDisplayNumber(amount, digitMode)} ৳ | খরচ: ${formatDisplayNumber(activeFee, digitMode)} ৳ | মোট দিতে হবে: ${formatDisplayNumber(activeTotal, digitMode)} ৳`
        : `ব্যালেন্স: ${formatDisplayNumber(amount, digitMode)} ৳ | খরচ: ${formatDisplayNumber(activeFee, digitMode)} ৳ | হাতে পাবেন: ${formatDisplayNumber(activeCashInHand, digitMode)} ৳`;

      onSaveHistory({
        type: 'mfs',
        title,
        subtitle,
        data: {
          amount,
          ratePerThousand,
          fee: activeFee,
          totalWithFee: activeTotal,
          netInHand: activeCashInHand,
          mode,
          providerName: `হাজারে ${ratePerThousand} ৳`,
          date: new Date().toISOString(),
        }
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [amount, ratePerThousand, mode, activeFee, activeTotal, activeCashInHand, digitMode, onSaveHistory]);

  const handleClear = () => {
    if (soundEnabled) soundFx.playTap();
    setAmountStr('');
  };

  const handleResetRate = () => {
    if (soundEnabled) soundFx.playTap();
    setRateStr('');
  };

  const handleCopy = async () => {
    if (soundEnabled) soundFx.playTap();
    const text = mode === 'net_in_hand'
      ? `ক্যাশ আউট হিসাব:\nগ্রাহক হাতে পাবেন: ${formatDisplayNumber(amount, digitMode)} ৳\nক্যাশ আউট খরচ (হাজারে ${formatDisplayNumber(ratePerThousand, digitMode)} ৳): ${formatDisplayNumber(activeFee, digitMode)} ৳\nসর্বমোট দিতে হবে: ${formatDisplayNumber(activeTotal, digitMode)} ৳`
      : `ক্যাশ আউট হিসাব:\nব্যালেন্স থেকে দেওয়া: ${formatDisplayNumber(amount, digitMode)} ৳\nক্যাশ আউট খরচ: ${formatDisplayNumber(activeFee, digitMode)} ৳\nগ্রাহক হাতে পাবেন: ${formatDisplayNumber(activeCashInHand, digitMode)} ৳`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSave = () => {
    if (amount <= 0) return;
    if (soundEnabled) soundFx.playSuccess();
    
    const title = `ক্যাশ আউট হিসাব (হাজারে ${formatDisplayNumber(ratePerThousand, digitMode)} ৳)`;
    const subtitle = mode === 'net_in_hand'
      ? `হাতে পাবেন: ${formatDisplayNumber(amount, digitMode)} ৳ | খরচ: ${formatDisplayNumber(activeFee, digitMode)} ৳ | মোট দিতে হবে: ${formatDisplayNumber(activeTotal, digitMode)} ৳`
      : `ব্যালেন্স: ${formatDisplayNumber(amount, digitMode)} ৳ | খরচ: ${formatDisplayNumber(activeFee, digitMode)} ৳ | হাতে পাবেন: ${formatDisplayNumber(activeCashInHand, digitMode)} ৳`;

    onSaveHistory({
      type: 'mfs',
      title,
      subtitle,
      data: {
        amount,
        ratePerThousand,
        fee: activeFee,
        totalWithFee: activeTotal,
        netInHand: activeCashInHand,
        mode,
        providerName: `হাজারে ${ratePerThousand} ৳`,
        date: new Date().toISOString(),
      }
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Main Clean Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
        {/* Header & Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              ক্যাশ আউট ক্যালকুলেটর
            </h2>
          </div>

          {/* Clean Segmented Mode Selector */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playTap();
                setMode('net_in_hand');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                mode === 'net_in_hand'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              হাতে পাওয়ার টাকা
            </button>
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playTap();
                setMode('from_balance');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                mode === 'from_balance'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ব্যালেন্স থেকে
            </button>
          </div>
        </div>

        {/* 1. Main Amount Input */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                {mode === 'net_in_hand' ? 'গ্রাহক কত টাকা ক্যাশ হাতে পেতে চান?' : 'ব্যালেন্সে মোট কত টাকা আছে?'}
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={digitMode === 'bn' ? toBnDigits(amountStr) : toEnDigits(amountStr)}
                onChange={(e) => {
                  const raw = toEnDigits(e.target.value);
                  if (/^[0-9.]*$/.test(raw)) {
                    setAmountStr(raw);
                  }
                }}
                placeholder={digitMode === 'bn' ? 'টাকার পরিমাণ লিখুন' : 'Enter amount'}
                className="w-full text-2xl sm:text-3xl font-extrabold px-4 py-3 pl-12 pr-28 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-slate-900 dark:text-white transition"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ৳
              </span>
              {amountStr && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-500 dark:text-rose-400 text-sm font-black transition-all cursor-pointer border border-rose-500/30 shadow-sm"
                  title="লেখা মুছুন"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>মুছুন</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Cashout Rate (Default 15 Tk, directly editable input) */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                হাজারে ক্যাশ আউট খরচ
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                ডিফল্ট ১৫ ৳ রাখা আছে, প্রয়োজনমতো পরিবর্তন করুন
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={digitMode === 'bn' ? toBnDigits(rateStr) : toEnDigits(rateStr)}
                  onChange={(e) => {
                    const raw = toEnDigits(e.target.value);
                    if (/^[0-9.]*$/.test(raw)) {
                      setRateStr(raw);
                    }
                  }}
                  className="w-20 sm:w-24 text-center font-extrabold text-base sm:text-lg px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                  placeholder="15"
                />
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">৳/১০০০</span>
              {rateStr !== '' && (
                <button
                  onClick={handleResetRate}
                  title="ডিফল্ট ১৫ ৳ রিস্টোর করুন"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Immediate Results Breakdown (সরাসরি ফলাফল) */}
        <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-100 font-semibold mb-1">
            <span>
              {mode === 'net_in_hand' ? 'গ্রাহককে সর্বমোট দিতে হবে:' : 'গ্রাহক হাতে পাবেন:'}
            </span>
            <span className="bg-emerald-500/30 px-2 py-0.5 rounded-md text-[11px] font-bold border border-emerald-400/30">
              {mode === 'net_in_hand' ? 'খরচসহ মোট' : 'খরচ বাদে ক্যাশ'}
            </span>
          </div>

          {/* Big Amount */}
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            ৳ {formatDisplayNumber(activeTotal, digitMode, 2)}
          </div>

          {/* Breakdown Pills in a Clean Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-black/15 text-xs">
            <div>
              <span className="text-emerald-200 text-[11px] block">গ্রাহক হাতে পাবেন:</span>
              <span className="font-bold text-sm text-white">
                {formatDisplayNumber(activeCashInHand, digitMode, 2)} ৳
              </span>
            </div>
            <div>
              <span className="text-emerald-200 text-[11px] block">ক্যাশ আউট চার্জ:</span>
              <span className="font-bold text-sm text-amber-300">
                + {formatDisplayNumber(activeFee, digitMode, 2)} ৳
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-emerald-200 text-[11px] block">হিসাব রেট:</span>
              <span className="font-semibold text-xs text-emerald-100">
                হাজারে {formatDisplayNumber(ratePerThousand, digitMode, 1)} ৳
              </span>
            </div>
          </div>

          {/* Bangla in words */}
          {activeTotal > 0 && (
            <div className="mt-2.5 text-xs text-emerald-100/90 font-medium">
              কথায়: {amountToBanglaWords(activeTotal)}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-emerald-500/30">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition text-xs font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
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
              onClick={handleSave}
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
          title="ক্যাশ আউট রসিদ"
          subtitle={`হাজারে ${formatDisplayNumber(ratePerThousand, digitMode, 1)} ৳ হারে`}
          items={[
            { label: mode === 'net_in_hand' ? 'হাতে পাওয়ার টাকা' : 'ব্যালেন্সের টাকা', value: `${formatDisplayNumber(activeCashInHand, digitMode, 2)} ৳` },
            { label: 'ক্যাশ আউট চার্জ', value: `${formatDisplayNumber(activeFee, digitMode, 2)} ৳`, isHighlight: true },
            { label: 'হিসাব রেট', value: `হাজারে ${formatDisplayNumber(ratePerThousand, digitMode, 1)} ৳` }
          ]}
          totalAmountText={`${formatDisplayNumber(activeTotal, digitMode, 2)} ৳`}
          rawAmount={activeTotal}
          digitMode={digitMode}
        />
      )}
    </div>
  );
};
