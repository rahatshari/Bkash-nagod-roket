import React, { useState, useId } from 'react';
import { 
  Coins, 
  ArrowRightLeft, 
  Plus, 
  Minus, 
  Copy, 
  Check, 
  FileText, 
  BookmarkCheck, 
  RotateCcw,
  Sparkles,
  HelpCircle,
  Percent
} from 'lucide-react';
import { DigitMode, MfsCalculationMode, MfsPreset, HistoryRecord } from '../types';
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

const MFS_PRESETS: MfsPreset[] = [
  { id: 'custom', name: 'ডিফল্ট / কাস্টম', subText: '১৫ ৳ / ১০০০', ratePerThousand: 15.0, color: 'bg-emerald-600', logoText: '৳' },
  { id: 'nagad_ussd', name: 'নগদ USSD (*167#)', subText: '১৫.০০ ৳', ratePerThousand: 15.0, color: 'bg-amber-600', logoText: 'নগদ' },
  { id: 'bkash_priyo', name: 'বিকাশ প্রিয় এজেন্ট', subText: '১৪.৯০ ৳', ratePerThousand: 14.9, color: 'bg-pink-600', logoText: 'বিকাশ' },
  { id: 'nagad_app', name: 'নগদ অ্যাপ', subText: '১২.৫০ ৳', ratePerThousand: 12.5, color: 'bg-amber-500', logoText: 'নগদ' },
  { id: 'bkash_app', name: 'বিকাশ অ্যাপ / সাধারণ', subText: '১৮.৫০ ৳', ratePerThousand: 18.5, color: 'bg-pink-500', logoText: 'বিকাশ' },
  { id: 'rocket_ussd', name: 'রকেট USSD (*322#)', subText: '১৫.০০ ৳', ratePerThousand: 15.0, color: 'bg-purple-600', logoText: 'রকেট' },
  { id: 'rocket_app', name: 'রকেট অ্যাপ', subText: '১৬.৭০ ৳', ratePerThousand: 16.7, color: 'bg-purple-500', logoText: 'রকেট' },
  { id: 'upay_app', name: 'উপায় অ্যাপ', subText: '১৪.০০ ৳', ratePerThousand: 14.0, color: 'bg-blue-600', logoText: 'উপায়' },
];

export const MfsCalculator: React.FC<MfsCalculatorProps> = ({
  digitMode,
  soundEnabled,
  onSaveHistory
}) => {
  const rateSliderId = useId();
  // State
  const [amountStr, setAmountStr] = useState<string>('5420'); // Default to user's example: 5420 TK
  const [ratePerThousand, setRatePerThousand] = useState<number>(15.0); // Default to user's requirement: 15 TK
  const [mode, setMode] = useState<MfsCalculationMode>('net_in_hand');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('custom');
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [showFormulaInfo, setShowFormulaInfo] = useState<boolean>(false);

  const amount = parseNumberInput(amountStr);

  // Calculations
  // Fee calculation: Rate per 1000 means (rate / 1000)
  // Mode 1: net_in_hand -> Customer wants exact `amount` in cash.
  // Proportional fee: amount * (rate / 1000)
  const feeProportional = amount * (ratePerThousand / 1000);
  
  // Total to cash out / give:
  const totalInNetMode = amount + feeProportional;

  // Mode 2: from_balance -> Customer has `amount` in balance.
  // Deducting fee from balance:
  const feeFromBalance = amount * (ratePerThousand / 1000);
  const netInHandFromBalance = Math.max(0, amount - feeFromBalance);

  // Active values based on mode
  const activeFee = mode === 'net_in_hand' ? feeProportional : feeFromBalance;
  const activeTotal = mode === 'net_in_hand' ? totalInNetMode : amount;
  const activeNetCash = mode === 'net_in_hand' ? amount : netInHandFromBalance;

  // Preset Selection
  const handleSelectPreset = (preset: MfsPreset) => {
    if (soundEnabled) soundFx.playTap();
    setSelectedPresetId(preset.id);
    setRatePerThousand(preset.ratePerThousand);
  };

  // Adjust rate
  const adjustRate = (delta: number) => {
    if (soundEnabled) soundFx.playTap();
    const newRate = Math.max(0, Math.round((ratePerThousand + delta) * 10) / 10);
    setRatePerThousand(newRate);
    setSelectedPresetId('custom');
  };

  // Quick Amount Adders
  const addAmount = (addVal: number) => {
    if (soundEnabled) soundFx.playTap();
    const curr = parseNumberInput(amountStr);
    const nextVal = curr + addVal;
    setAmountStr(String(nextVal));
  };

  const handleClear = () => {
    if (soundEnabled) soundFx.playTap();
    setAmountStr('');
  };

  const handleCopySMS = async () => {
    if (soundEnabled) soundFx.playTap();
    const text = mode === 'net_in_hand'
      ? `ক্যাশ আউট হিসাব:\nমূল টাকা: ${formatDisplayNumber(amount, digitMode)} ৳\nক্যাশ আউট খরচ (হাজারে ${formatDisplayNumber(ratePerThousand, digitMode)} ৳): ${formatDisplayNumber(activeFee, digitMode)} ৳\nসর্বমোট দিতে হবে: ${formatDisplayNumber(activeTotal, digitMode)} ৳`
      : `ক্যাশ আউট হিসাব:\nব্যালেন্স: ${formatDisplayNumber(amount, digitMode)} ৳\nক্যাশ আউট চার্জ: ${formatDisplayNumber(activeFee, digitMode)} ৳\nহাতে পাবেন: ${formatDisplayNumber(activeNetCash, digitMode)} ৳`;
    
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
    
    const activePreset = MFS_PRESETS.find((p) => p.id === selectedPresetId) || MFS_PRESETS[0];
    const title = `ক্যাশ আউট (${activePreset.name})`;
    const subtitle = mode === 'net_in_hand'
      ? `মূল: ${formatDisplayNumber(amount, digitMode)} ৳ | খরচ: ${formatDisplayNumber(activeFee, digitMode)} ৳ | মোট: ${formatDisplayNumber(activeTotal, digitMode)} ৳`
      : `ব্যালেন্স: ${formatDisplayNumber(amount, digitMode)} ৳ | হাতে: ${formatDisplayNumber(activeNetCash, digitMode)} ৳ | খরচ: ${formatDisplayNumber(activeFee, digitMode)} ৳`;

    onSaveHistory({
      type: 'mfs',
      title,
      subtitle,
      data: {
        amount,
        ratePerThousand,
        fee: activeFee,
        totalWithFee: activeTotal,
        netInHand: activeNetCash,
        mode,
        providerName: activePreset.name,
        date: new Date().toISOString(),
      }
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Description & Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/90 dark:border-slate-800 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Coins className="w-5 h-5" />
              </span>
              বিকাশ / নগদ / রকেট ক্যাশ আউট ক্যালকুলেটর
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              গ্রাহকের চাহিদামতো ক্যাশ আউট খরচ ও সর্বমোট টাকা বের করার দ্রুত মাধ্যম
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playTap();
                setMode('net_in_hand');
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'net_in_hand'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              হাতে পাওয়ার জন্য (বাড়তি কত দিতে হবে)
            </button>
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playTap();
                setMode('from_balance');
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'from_balance'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ব্যালেন্স থেকে (খরচ বাদে কত পাবে)
            </button>
          </div>
        </div>

        {/* Input & Presets Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Column: Amount & Rate Controls */}
          <div className="lg:col-span-7 space-y-5">
            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>{mode === 'net_in_hand' ? 'গ্রাহক কত টাকা ক্যাশ হাতে পেতে চান?' : 'ব্যালেন্সে মোট কত টাকা আছে?'}</span>
                  <span className="text-emerald-600 font-bold">*</span>
                </label>
                {amountStr && (
                  <button
                    onClick={handleClear}
                    className="text-xs font-medium text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    মুছে ফেলুন
                  </button>
                )}
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
                  placeholder={digitMode === 'bn' ? 'যেমন: ৫৪২০' : 'e.g. 5420'}
                  className="w-full text-2xl sm:text-3xl font-bold px-4 py-3.5 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-slate-900 dark:text-white transition"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400 dark:text-slate-500">
                  ৳
                </span>
              </div>

              {/* Quick Amount Suggestion Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <button
                  onClick={() => {
                    if (soundEnabled) soundFx.playTap();
                    setAmountStr('5420');
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 cursor-pointer border border-emerald-300/60 dark:border-emerald-700/60 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>উদাহরণ: {formatDisplayNumber(5420, digitMode, 0)} ৳</span>
                </button>
                {[500, 1000, 2000, 5000, 10000].map((val) => (
                  <button
                    key={val}
                    onClick={() => addAmount(val)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition active:scale-95"
                  >
                    +{formatDisplayNumber(val, digitMode, 0)} ৳
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Out Rate Control */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    ক্যাশ আউট খরচ (হাজারে কত টাকা?)
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    ডিফল্ট ১৫ টাকা রাখা আছে, আপনি চাইলে বাড়াতে বা কমাতে পারেন
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatDisplayNumber(ratePerThousand, digitMode, 2)}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">৳ / ১০০০</span>
                </div>
              </div>

              {/* Slider & Stepper */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => adjustRate(-0.5)}
                  className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer shadow-xs active:scale-95"
                  title="-০.৫০ ৳"
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <label htmlFor={rateSliderId} className="sr-only">
                  ক্যাশ আউট খরচের স্লাইডার
                </label>
                <input
                  id={rateSliderId}
                  type="range"
                  min="0"
                  max="30"
                  step="0.1"
                  value={ratePerThousand}
                  onChange={(e) => {
                    setRatePerThousand(parseFloat(e.target.value));
                    setSelectedPresetId('custom');
                  }}
                  className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
                />

                <button
                  onClick={() => adjustRate(0.5)}
                  className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer shadow-xs active:scale-95"
                  title="+০.৫০ ৳"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Provider Quick Rate Presets */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                  দ্রুত অপারেটর রেট নির্বাচন:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MFS_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 dark:border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${preset.color}`}></span>
                          <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                            {preset.name}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          হাজারে {formatDisplayNumber(preset.ratePerThousand, digitMode, 2)} ৳
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Calculation Result Card */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-xl shadow-emerald-700/20 relative overflow-hidden">
              {/* Background watermark badge */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none flex items-center justify-center text-6xl font-black text-white/10">
                ৳
              </div>

              {/* Result Header */}
              <div className="flex items-center justify-between border-b border-emerald-500/40 pb-3">
                <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  {mode === 'net_in_hand' ? 'গ্রাহককে মোট দিতে হবে' : 'গ্রাহক হাতে পাবেন'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
                  {mode === 'net_in_hand' ? 'হাতে পাওয়ার মোড' : 'ব্যালেন্স মোড'}
                </span>
              </div>

              {/* Main Total Display */}
              <div className="my-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-xs">
                    {formatDisplayNumber(mode === 'net_in_hand' ? activeTotal : activeNetCash, digitMode, 2)}
                  </span>
                  <span className="text-2xl font-bold text-emerald-200">টাকা</span>
                </div>
                <p className="text-xs text-emerald-100/90 mt-1 line-clamp-1 font-medium">
                  কথায়: {amountToBanglaWords(mode === 'net_in_hand' ? activeTotal : activeNetCash)}
                </p>
              </div>

              {/* Breakdown Detail Table */}
              <div className="space-y-2.5 pt-3 border-t border-emerald-500/30 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-emerald-100">
                  <span>{mode === 'net_in_hand' ? 'হাতে যা পেতে চান (মূল টাকা):' : 'ব্যালেন্স (মূল টাকা):'}</span>
                  <span className="font-bold text-white">
                    {formatDisplayNumber(amount, digitMode, 2)} ৳
                  </span>
                </div>

                <div className="flex items-center justify-between text-emerald-100">
                  <span>ক্যাশ আউট খরচ (হাজারে {formatDisplayNumber(ratePerThousand, digitMode, 2)} ৳):</span>
                  <span className="font-bold text-amber-300">
                    + {formatDisplayNumber(activeFee, digitMode, 2)} ৳
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-emerald-500/40 text-emerald-100">
                  <span className="font-semibold">
                    {mode === 'net_in_hand' ? 'বেশি / বাড়তি খরচ দিতে হবে:' : 'খরচ কেটে হাতে পাবেন:'}
                  </span>
                  <span className="font-extrabold text-white text-base">
                    {mode === 'net_in_hand'
                      ? `${formatDisplayNumber(activeFee, digitMode, 2)} ৳`
                      : `${formatDisplayNumber(activeNetCash, digitMode, 2)} ৳`}
                  </span>
                </div>
              </div>

              {/* Example Context Pill */}
              <div className="mt-4 p-2.5 rounded-xl bg-black/15 text-[11px] text-emerald-100 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                <span>
                  {mode === 'net_in_hand'
                    ? `${formatDisplayNumber(amount, digitMode)} টাকার ক্যাশ আউট করতে গ্রাহককে বাড়তি ${formatDisplayNumber(activeFee, digitMode, 2)} টাকাসহ সর্বমোট ${formatDisplayNumber(activeTotal, digitMode, 2)} টাকা দিতে হবে।`
                    : `ব্যালেন্সে ${formatDisplayNumber(amount, digitMode)} টাকা থাকলে ${formatDisplayNumber(activeFee, digitMode, 2)} টাকা খরচ কেটে গ্রাহক হাতে পাবেন ${formatDisplayNumber(activeNetCash, digitMode, 2)} টাকা।`}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button
                onClick={handleCopySMS}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600">কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>কপি মেসেজ</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600">সংরক্ষিত!</span>
                  </>
                ) : (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-slate-500" />
                    <span>খাতায় সেভ</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (soundEnabled) soundFx.playTap();
                  setShowReceipt(true);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-xs font-bold transition cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>ক্যাশ মেমো</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Receipt Modal */}
      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        title="MFS ক্যাশ আউট রসিদ"
        subtitle={`অপারেটর: ${MFS_PRESETS.find((p) => p.id === selectedPresetId)?.name || 'ক্যাশ আউট'}`}
        items={[
          { label: 'ক্যাশ আউটের ধরণ', value: mode === 'net_in_hand' ? 'হাতে পাওয়ার মোড' : 'ব্যালেন্স মোড' },
          { label: 'মূল টাকার পরিমাণ', value: `${formatDisplayNumber(amount, digitMode, 2)} ৳`, isBold: true },
          { label: 'প্রতি হাজারে রেট', value: `${formatDisplayNumber(ratePerThousand, digitMode, 2)} ৳ / ১০০০` },
          { label: 'ক্যাশ আউট চার্জ (খরচ)', value: `${formatDisplayNumber(activeFee, digitMode, 2)} ৳`, isHighlight: true },
          { label: mode === 'net_in_hand' ? 'গ্রাহককে মোট দিতে হবে' : 'গ্রাহক হাতে পাবেন', value: `${formatDisplayNumber(mode === 'net_in_hand' ? activeTotal : activeNetCash, digitMode, 2)} ৳`, isBold: true }
        ]}
        totalAmountText={`${formatDisplayNumber(mode === 'net_in_hand' ? activeTotal : activeNetCash, digitMode, 2)} টাকা`}
        rawAmount={mode === 'net_in_hand' ? activeTotal : activeNetCash}
        digitMode={digitMode}
        notes="বিকাশ, নগদ বা রকেটে যেকোনো ক্যাশ আউটের পূর্বে নম্বর ও ব্যালেন্স ভালো করে যাচাই করুন।"
      />
    </div>
  );
};
