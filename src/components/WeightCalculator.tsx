import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, 
  Copy, 
  Check, 
  BookmarkCheck, 
  FileText,
  Trash2 
} from 'lucide-react';
import { DigitMode, WeightCalcMode, HistoryRecord } from '../types';
import { 
  formatDisplayNumber, 
  toBnDigits, 
  toEnDigits, 
  parseNumberInput, 
  amountToBanglaWords,
  soundFx 
} from '../utils/numberConverter';
import { ReceiptModal } from './ReceiptModal';

interface WeightCalculatorProps {
  digitMode: DigitMode;
  soundEnabled: boolean;
  onSaveHistory: (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => void;
}

export const WeightCalculator: React.FC<WeightCalculatorProps> = ({
  digitMode,
  soundEnabled,
  onSaveHistory,
}) => {
  // Mode: 'weight_to_price' (default) vs 'price_to_weight'
  const [calcMode, setCalcMode] = useState<WeightCalcMode>('weight_to_price');

  // Input states - initialized empty so user starts clean without having to backspace
  const [pricePerKgStr, setPricePerKgStr] = useState<string>('');
  const [kgStr, setKgStr] = useState<string>('');
  const [gramStr, setGramStr] = useState<string>('');
  const [givenMoneyStr, setGivenMoneyStr] = useState<string>('');

  // Modals & Feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);

  // Calculations
  const pricePerKg = parseNumberInput(pricePerKgStr);
  const kgVal = parseNumberInput(kgStr);
  const gramVal = parseNumberInput(gramStr);
  const givenMoney = parseNumberInput(givenMoneyStr);

  // Total weight in Kg and grams
  const totalWeightInKg = kgVal + (gramVal / 1000);
  const totalWeightInGrams = Math.round(totalWeightInKg * 1000);

  // Mode 1: Weight to Price
  const calculatedTotalPrice = totalWeightInKg * pricePerKg;

  // Mode 2: Price to Weight
  const calculatedWeightInKg = pricePerKg > 0 ? (givenMoney / pricePerKg) : 0;
  const calculatedWeightInGrams = Math.round(calculatedWeightInKg * 1000);
  const derivedKgPart = Math.floor(calculatedWeightInKg);
  const derivedGramPart = Math.round((calculatedWeightInKg - derivedKgPart) * 1000);

  const pricePer100Gram = pricePerKg > 0 ? pricePerKg / 10 : 0;

  // Auto-save history with comfortable debounce (3.5 seconds)
  const lastSavedRef = useRef<string>('');
  useEffect(() => {
    if (pricePerKg <= 0) return;
    if (calcMode === 'weight_to_price' && totalWeightInKg <= 0) return;
    if (calcMode === 'price_to_weight' && givenMoney <= 0) return;

    const key = `${calcMode}_${pricePerKg}_${calcMode === 'weight_to_price' ? totalWeightInKg : givenMoney}`;
    if (lastSavedRef.current === key) return;

    const timer = setTimeout(() => {
      lastSavedRef.current = key;
      const title = `ওজন ও দাম হিসাব`;
      const subtitle = calcMode === 'weight_to_price'
        ? `${formatDisplayNumber(kgVal, digitMode, 0)} কেজি ${formatDisplayNumber(gramVal, digitMode, 0)} গ্রাম @ ${formatDisplayNumber(pricePerKg, digitMode, 2)} ৳/কেজি = ${formatDisplayNumber(calculatedTotalPrice, digitMode, 2)} ৳`
        : `${formatDisplayNumber(givenMoney, digitMode, 2)} টাকায় পাওয়া যাবে ${formatDisplayNumber(derivedKgPart, digitMode, 0)} কেজি ${formatDisplayNumber(derivedGramPart, digitMode, 0)} গ্রাম`;

      onSaveHistory({
        type: 'weight',
        title,
        subtitle,
        data: {
          pricePerKg,
          totalKg: calcMode === 'weight_to_price' ? totalWeightInKg : calculatedWeightInKg,
          totalGrams: calcMode === 'weight_to_price' ? totalWeightInGrams : calculatedWeightInGrams,
          totalPrice: calcMode === 'weight_to_price' ? calculatedTotalPrice : givenMoney,
          itemGivenPrice: givenMoney,
          itemName: 'পণ্য',
          mode: calcMode,
          date: new Date().toISOString(),
        }
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, [pricePerKg, calcMode, totalWeightInKg, givenMoney, kgVal, gramVal, calculatedTotalPrice, derivedKgPart, derivedGramPart, calculatedWeightInKg, calculatedWeightInGrams, totalWeightInGrams, digitMode, onSaveHistory]);

  const handleClearWeight = () => {
    if (soundEnabled) soundFx.playTap();
    setKgStr('');
    setGramStr('');
  };

  const handleClearPrice = () => {
    if (soundEnabled) soundFx.playTap();
    setPricePerKgStr('');
  };

  const handleCopy = async () => {
    if (soundEnabled) soundFx.playTap();
    const text = calcMode === 'weight_to_price'
      ? `ওজন ও দাম হিসাব:\n১ কেজির দাম: ${formatDisplayNumber(pricePerKg, digitMode, 2)} ৳\nপ্রয়োজনীয় ওজন: ${formatDisplayNumber(kgVal, digitMode, 0)} কেজি ${formatDisplayNumber(gramVal, digitMode, 0)} গ্রাম (${formatDisplayNumber(totalWeightInGrams, digitMode, 0)} গ্রাম)\nসর্বমোট দাম: ${formatDisplayNumber(calculatedTotalPrice, digitMode, 2)} ৳`
      : `ওজন ও দাম হিসাব:\n১ কেজির দাম: ${formatDisplayNumber(pricePerKg, digitMode, 2)} ৳\nটাকার পরিমাণ: ${formatDisplayNumber(givenMoney, digitMode, 2)} ৳\nমোট পাওয়া যাবে: ${formatDisplayNumber(derivedKgPart, digitMode, 0)} কেজি ${formatDisplayNumber(derivedGramPart, digitMode, 0)} গ্রাম (${formatDisplayNumber(calculatedWeightInGrams, digitMode, 0)} গ্রাম)`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSaveToHistory = () => {
    if (pricePerKg <= 0) return;
    if (soundEnabled) soundFx.playSuccess();

    const title = `ওজন ও দাম হিসাব`;
    const subtitle = calcMode === 'weight_to_price'
      ? `${formatDisplayNumber(kgVal, digitMode, 0)} কেজি ${formatDisplayNumber(gramVal, digitMode, 0)} গ্রাম @ ${formatDisplayNumber(pricePerKg, digitMode, 2)} ৳/কেজি = ${formatDisplayNumber(calculatedTotalPrice, digitMode, 2)} ৳`
      : `${formatDisplayNumber(givenMoney, digitMode, 2)} টাকায় পাওয়া যাবে ${formatDisplayNumber(derivedKgPart, digitMode, 0)} কেজি ${formatDisplayNumber(derivedGramPart, digitMode, 0)} গ্রাম`;

    onSaveHistory({
      type: 'weight',
      title,
      subtitle,
      data: {
        pricePerKg,
        totalKg: calcMode === 'weight_to_price' ? totalWeightInKg : calculatedWeightInKg,
        totalGrams: calcMode === 'weight_to_price' ? totalWeightInGrams : calculatedWeightInGrams,
        totalPrice: calcMode === 'weight_to_price' ? calculatedTotalPrice : givenMoney,
        itemGivenPrice: givenMoney,
        itemName: 'পণ্য',
        mode: calcMode,
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
              <Scale className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              ওজন ও দাম ক্যালকুলেটর
            </h2>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playTap();
                setCalcMode('weight_to_price');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                calcMode === 'weight_to_price'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ওজন দিয়ে দাম
            </button>
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playTap();
                setCalcMode('price_to_weight');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                calcMode === 'price_to_weight'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              টাকা দিয়ে ওজন
            </button>
          </div>
        </div>

        {/* 1. Price per Kg Input (১ কেজির দাম) */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                প্রতি কেজির দাম (১ কেজির দর)
              </label>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                inputMode="decimal"
                value={digitMode === 'bn' ? toBnDigits(pricePerKgStr) : toEnDigits(pricePerKgStr)}
                onChange={(e) => {
                  const raw = toEnDigits(e.target.value);
                  if (/^[0-9.]*$/.test(raw)) setPricePerKgStr(raw);
                }}
                placeholder={digitMode === 'bn' ? 'কেজির দর লিখুন' : 'Rate per kg'}
                className={`w-full text-xl sm:text-2xl font-extrabold py-3 pl-11 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-slate-900 dark:text-white transition ${pricePerKgStr ? 'pr-28' : 'pr-4'}`}
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-emerald-600 dark:text-emerald-400 pointer-events-none">
                ৳
              </span>
              {pricePerKgStr && (
                <button
                  type="button"
                  onClick={handleClearPrice}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-500 dark:text-rose-400 text-xs sm:text-sm font-black transition-all cursor-pointer border border-rose-500/30 shadow-sm"
                  title="লেখা মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>মুছুন</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Weight Inputs (কত ওজন প্রয়োজন) */}
          {calcMode === 'weight_to_price' ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                  কতটুকু ওজন লাগবে?
                </label>
                {(kgStr || gramStr) && (
                  <button
                    type="button"
                    onClick={handleClearWeight}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-500 dark:text-rose-400 text-xs font-black transition-all cursor-pointer border border-rose-500/20 shadow-xs"
                    title="ওজন মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>মুছুন</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Kg Input */}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={digitMode === 'bn' ? toBnDigits(kgStr) : toEnDigits(kgStr)}
                    onChange={(e) => {
                      const raw = toEnDigits(e.target.value);
                      if (/^[0-9.]*$/.test(raw)) setKgStr(raw);
                    }}
                    placeholder="০"
                    className="w-full text-xl sm:text-2xl font-extrabold px-4 py-3 pr-14 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-slate-900 dark:text-white transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                    কেজি
                  </span>
                </div>

                {/* Gram Input */}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={digitMode === 'bn' ? toBnDigits(gramStr) : toEnDigits(gramStr)}
                    onChange={(e) => {
                      const raw = toEnDigits(e.target.value);
                      if (/^[0-9.]*$/.test(raw)) setGramStr(raw);
                    }}
                    placeholder="০"
                    className="w-full text-xl sm:text-2xl font-extrabold px-4 py-3 pr-14 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-slate-900 dark:text-white transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                    গ্রাম
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                  ক্রেতা কত টাকার পণ্য নিতে চান?
                </label>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  inputMode="decimal"
                  value={digitMode === 'bn' ? toBnDigits(givenMoneyStr) : toEnDigits(givenMoneyStr)}
                  onChange={(e) => {
                    const raw = toEnDigits(e.target.value);
                    if (/^[0-9.]*$/.test(raw)) setGivenMoneyStr(raw);
                  }}
                  placeholder={digitMode === 'bn' ? 'টাকার পরিমাণ লিখুন' : 'Enter amount'}
                  className={`w-full text-xl sm:text-2xl font-extrabold py-3 pl-11 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-slate-900 dark:text-white transition ${givenMoneyStr ? 'pr-28' : 'pr-4'}`}
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-emerald-600 dark:text-emerald-400 pointer-events-none">
                  ৳
                </span>
                {givenMoneyStr && (
                  <button
                    type="button"
                    onClick={() => setGivenMoneyStr('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-500 dark:text-rose-400 text-xs sm:text-sm font-black transition-all cursor-pointer border border-rose-500/30 shadow-sm"
                    title="টাকা মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>মুছুন</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Immediate Result Card (সরাসরি ফলাফল) */}
        <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-100 font-semibold mb-1">
            <span>
              {calcMode === 'weight_to_price' ? 'সর্বমোট দাম:' : 'প্রাপ্য মোট ওজন:'}
            </span>
            <span className="bg-emerald-500/30 px-2 py-0.5 rounded-md text-[11px] font-bold border border-emerald-400/30">
              {calcMode === 'weight_to_price' ? 'টাকার হিসাব' : 'ওজনের হিসাব'}
            </span>
          </div>

          {/* Big Result */}
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            {calcMode === 'weight_to_price' ? (
              <>৳ {formatDisplayNumber(calculatedTotalPrice, digitMode, 2)}</>
            ) : (
              <>
                {derivedKgPart > 0 && `${formatDisplayNumber(derivedKgPart, digitMode, 0)} কেজি `}
                {formatDisplayNumber(derivedGramPart, digitMode, 0)} গ্রাম
              </>
            )}
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-black/15 text-xs">
            <div>
              <span className="text-emerald-200 text-[11px] block">
                {calcMode === 'weight_to_price' ? 'মোট ওজন:' : 'ক্রেতার টাকা:'}
              </span>
              <span className="font-bold text-sm text-white">
                {calcMode === 'weight_to_price' ? (
                  `${formatDisplayNumber(kgVal, digitMode, 0)} কেজি ${formatDisplayNumber(gramVal, digitMode, 0)} গ্রাম`
                ) : (
                  `${formatDisplayNumber(givenMoney, digitMode, 2)} ৳`
                )}
              </span>
            </div>
            <div>
              <span className="text-emerald-200 text-[11px] block">কেজির দর:</span>
              <span className="font-bold text-sm text-amber-300">
                {formatDisplayNumber(pricePerKg, digitMode, 0)} ৳ / কেজি
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-emerald-200 text-[11px] block">প্রতি ১০০ গ্রাম:</span>
              <span className="font-semibold text-xs text-emerald-100">
                {formatDisplayNumber(pricePer100Gram, digitMode, 1)} ৳
              </span>
            </div>
          </div>

          {/* Words */}
          {calcMode === 'weight_to_price' && calculatedTotalPrice > 0 && (
            <div className="mt-2.5 text-xs text-emerald-100/90 font-medium">
              কথায়: {amountToBanglaWords(calculatedTotalPrice)}
            </div>
          )}

          {/* Actions */}
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
              onClick={handleSaveToHistory}
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
          title="ওজন ও দাম রসিদ"
          subtitle={`১ কেজির দর ${formatDisplayNumber(pricePerKg, digitMode, 0)} ৳`}
          items={[
            { 
              label: calcMode === 'weight_to_price' ? 'মোট ওজন' : 'ক্রেতার টাকা', 
              value: calcMode === 'weight_to_price' 
                ? `${formatDisplayNumber(kgVal, digitMode, 0)} কেজি ${formatDisplayNumber(gramVal, digitMode, 0)} গ্রাম`
                : `${formatDisplayNumber(givenMoney, digitMode, 2)} ৳` 
            },
            { label: 'প্রতি কেজির দর', value: `${formatDisplayNumber(pricePerKg, digitMode, 2)} ৳` },
            { label: 'প্রতি ১০০ গ্রাম দর', value: `${formatDisplayNumber(pricePer100Gram, digitMode, 2)} ৳` }
          ]}
          totalAmountText={calcMode === 'weight_to_price' 
            ? `${formatDisplayNumber(calculatedTotalPrice, digitMode, 2)} ৳` 
            : `${formatDisplayNumber(derivedKgPart, digitMode, 0)} কেজি ${formatDisplayNumber(derivedGramPart, digitMode, 0)} গ্রাম`}
          rawAmount={calcMode === 'weight_to_price' ? calculatedTotalPrice : givenMoney}
          digitMode={digitMode}
        />
      )}
    </div>
  );
};
