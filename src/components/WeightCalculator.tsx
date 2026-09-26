import React, { useState } from 'react';
import { 
  Scale, 
  Sparkles, 
  Plus, 
  Minus, 
  Copy, 
  Check, 
  BookmarkCheck, 
  FileText, 
  RotateCcw,
  ShoppingBag,
  HelpCircle,
  Tag
} from 'lucide-react';
import { DigitMode, WeightCalcMode, WeightUnit, HistoryRecord } from '../types';
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

const COMMON_ITEMS = [
  'গরুর মাংস',
  'খাসির মাংস',
  'ইলিশ / রুই মাছ',
  'মুরগি (ব্রয়লার)',
  'চাল / পোলাও চাল',
  'সয়াবিন তেল',
  'মসুর ডাল',
  'চিনি',
  'মিষ্টি',
  'সবজি / পেঁয়াজ'
];

export const WeightCalculator: React.FC<WeightCalculatorProps> = ({
  digitMode,
  soundEnabled,
  onSaveHistory,
}) => {
  // Modes: 'weight_to_price' (ওজন অনুযায়ী দাম) vs 'price_to_weight' (টাকা অনুযায়ী ওজন)
  const [calcMode, setCalcMode] = useState<WeightCalcMode>('weight_to_price');

  // Input states - initialized to user's prompt: 1 kg = 250 TK, 2 kg 700 grams!
  const [pricePerKgStr, setPricePerKgStr] = useState<string>('250');
  const [kgStr, setKgStr] = useState<string>('2');
  const [gramStr, setGramStr] = useState<string>('700');
  const [givenMoneyStr, setGivenMoneyStr] = useState<string>('100');
  const [selectedItemName, setSelectedItemName] = useState<string>('পণ্য');

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
  // totalPrice = totalWeightInKg * pricePerKg
  const calculatedTotalPrice = totalWeightInKg * pricePerKg;

  // Mode 2: Price to Weight
  // If given 100 TK and rate is 250 TK/kg:
  // weightInKg = givenMoney / pricePerKg
  const calculatedWeightInKg = pricePerKg > 0 ? (givenMoney / pricePerKg) : 0;
  const calculatedWeightInGrams = Math.round(calculatedWeightInKg * 1000);
  const derivedKgPart = Math.floor(calculatedWeightInKg);
  const derivedGramPart = Math.round((calculatedWeightInKg - derivedKgPart) * 1000);

  // Rates breakdown for convenience
  const pricePer100Gram = pricePerKg > 0 ? pricePerKg / 10 : 0;
  const pricePer250Gram = pricePerKg > 0 ? pricePerKg / 4 : 0; // 1 Poya
  const pricePer50Gram = pricePerKg > 0 ? pricePerKg / 20 : 0;

  // Quick weight adders
  const addWeight = (addKg: number, addGrams: number) => {
    if (soundEnabled) soundFx.playTap();
    const currentTotalGrams = totalWeightInGrams + (addKg * 1000) + addGrams;
    const newKg = Math.floor(currentTotalGrams / 1000);
    const newGrams = currentTotalGrams % 1000;
    setKgStr(String(newKg));
    setGramStr(String(newGrams));
  };

  const handleClear = () => {
    if (soundEnabled) soundFx.playTap();
    setKgStr('');
    setGramStr('');
  };

  const handleCopy = async () => {
    if (soundEnabled) soundFx.playTap();
    const text = calcMode === 'weight_to_price'
      ? `ওজন ও দামের হিসাব:\nপণ্য: ${selectedItemName}\n১ কেজির দাম: ${formatDisplayNumber(pricePerKg, digitMode, 2)} ৳\nমোট ওজন: ${formatDisplayNumber(kgVal, digitMode, 0)} কেজি ${formatDisplayNumber(gramVal, digitMode, 0)} গ্রাম (${formatDisplayNumber(totalWeightInGrams, digitMode, 0)} গ্রাম)\nসর্বমোট দাম: ${formatDisplayNumber(calculatedTotalPrice, digitMode, 2)} ৳`
      : `ওজন ও দামের হিসাব:\nপণ্য: ${selectedItemName}\n১ কেজির দাম: ${formatDisplayNumber(pricePerKg, digitMode, 2)} ৳\nক্রেতার দেওয়া টাকা: ${formatDisplayNumber(givenMoney, digitMode, 2)} ৳\nপ্রাপ্য মোট ওজন: ${formatDisplayNumber(derivedKgPart, digitMode, 0)} কেজি ${formatDisplayNumber(derivedGramPart, digitMode, 0)} গ্রাম (${formatDisplayNumber(calculatedWeightInGrams, digitMode, 0)} গ্রাম)`;

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

    const title = `ওজন হিসাব (${selectedItemName})`;
    const subtitle = calcMode === 'weight_to_price'
      ? `${formatDisplayNumber(kgVal, digitMode, 0)} কেজি ${formatDisplayNumber(gramVal, digitMode, 0)} গ্রাম @ ${formatDisplayNumber(pricePerKg, digitMode, 2)} ৳ = ${formatDisplayNumber(calculatedTotalPrice, digitMode, 2)} ৳`
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
        itemName: selectedItemName,
        mode: calcMode,
        date: new Date().toISOString(),
      },
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/90 dark:border-slate-800 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Scale className="w-5 h-5" />
              </span>
              ওজন ও দাম ক্যালকুলেটর (Weight & Price)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ১ কেজি দাম জানা থাকলে যে কোনো কেজি ও গ্রামের নিখুঁত দাম ও ভগ্নাংশ বের করুন
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playTap();
                setCalcMode('weight_to_price');
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                calcMode === 'weight_to_price'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ওজন অনুযায়ী দাম বের করুন
            </button>
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playTap();
                setCalcMode('price_to_weight');
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                calcMode === 'price_to_weight'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              টাকা অনুযায়ী ওজন বের করুন
            </button>
          </div>
        </div>

        {/* Quick Item Category Pills */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 whitespace-nowrap">
            <Tag className="w-3 h-3" /> পণ্য:
          </span>
          {COMMON_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => {
                if (soundEnabled) soundFx.playTap();
                setSelectedItemName(item);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedItemName === item
                  ? 'bg-amber-500 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Inputs & Calculation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Column: Rate & Weight inputs */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1 Kg Price Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>১ কেজি (Kg) ওজনের দাম কত টাকা?</span>
                  <span className="text-amber-600 font-bold">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={digitMode === 'bn' ? toBnDigits(pricePerKgStr) : toEnDigits(pricePerKgStr)}
                  onChange={(e) => {
                    const raw = toEnDigits(e.target.value);
                    if (/^[0-9.]*$/.test(raw)) setPricePerKgStr(raw);
                  }}
                  placeholder={digitMode === 'bn' ? 'যেমন: ২৫০' : 'e.g. 250'}
                  className="w-full text-2xl sm:text-3xl font-bold px-4 py-3.5 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-slate-900 dark:text-white transition"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400 dark:text-slate-500">
                  ৳
                </span>
              </div>
              {/* Quick rate presets */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {[60, 120, 250, 450, 800, 1200].map((pr) => (
                  <button
                    key={pr}
                    onClick={() => {
                      if (soundEnabled) soundFx.playTap();
                      setPricePerKgStr(String(pr));
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition cursor-pointer ${
                      parseNumberInput(pricePerKgStr) === pr
                        ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 font-bold'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {formatDisplayNumber(pr, digitMode, 0)} ৳/কেজি
                  </button>
                ))}
              </div>
            </div>

            {/* Mode 1: Weight Input (Kg + Grams) */}
            {calcMode === 'weight_to_price' ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    ওজন নির্ধারণ করুন (কেজি ও গ্রাম):
                  </label>
                  <button
                    onClick={handleClear}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    মুছে ফেলুন
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Kg Input */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      কেজি (Kg)
                    </span>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={digitMode === 'bn' ? toBnDigits(kgStr) : toEnDigits(kgStr)}
                        onChange={(e) => {
                          const raw = toEnDigits(e.target.value);
                          if (/^[0-9]*$/.test(raw)) setKgStr(raw);
                        }}
                        placeholder={digitMode === 'bn' ? '২' : '2'}
                        className="w-full text-xl font-bold px-3 py-2.5 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 outline-none focus:border-amber-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        কেজি
                      </span>
                    </div>
                  </div>

                  {/* Gram Input */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      গ্রাম (Gram)
                    </span>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={digitMode === 'bn' ? toBnDigits(gramStr) : toEnDigits(gramStr)}
                        onChange={(e) => {
                          const raw = toEnDigits(e.target.value);
                          if (/^[0-9]*$/.test(raw)) setGramStr(raw);
                        }}
                        placeholder={digitMode === 'bn' ? '৭০০' : '700'}
                        className="w-full text-xl font-bold px-3 py-2.5 pr-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 outline-none focus:border-amber-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        গ্রাম
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Weight Adder Buttons */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                    ওজন যোগ করুন:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (soundEnabled) soundFx.playTap();
                        setKgStr('2');
                        setGramStr('700');
                        setPricePerKgStr('250');
                      }}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200 cursor-pointer border border-amber-300/80 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>ব্যবহারকারীর উদাহরণ: ২ কেজি ৭০০ গ্রাম</span>
                    </button>
                    {[
                      { label: '+৫০ গ্রাম', kg: 0, g: 50 },
                      { label: '+১০০ গ্রাম', kg: 0, g: 100 },
                      { label: '+২৫০ গ্রাম (১ পোয়া)', kg: 0, g: 250 },
                      { label: '+৫০০ গ্রাম (আধ কেজি)', kg: 0, g: 500 },
                      { label: '+১ কেজি', kg: 1, g: 0 },
                      { label: '+২ কেজি', kg: 2, g: 0 },
                      { label: '+৫ কেজি', kg: 5, g: 0 },
                    ].map((w, idx) => (
                      <button
                        key={idx}
                        onClick={() => addWeight(w.kg, w.g)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer active:scale-95 transition"
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Local market units conversion quick glance */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="block font-bold text-slate-800 dark:text-white">১ পোয়া (২৫০ গ্রাম):</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {formatDisplayNumber(pricePer250Gram, digitMode, 2)} ৳
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="block font-bold text-slate-800 dark:text-white">১০০ গ্রাম:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {formatDisplayNumber(pricePer100Gram, digitMode, 2)} ৳
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="block font-bold text-slate-800 dark:text-white">৫০ গ্রাম:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {formatDisplayNumber(pricePer50Gram, digitMode, 2)} ৳
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Mode 2: Given Money Input */
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  ক্রেতা কত টাকার পণ্য নিতে চান?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={digitMode === 'bn' ? toBnDigits(givenMoneyStr) : toEnDigits(givenMoneyStr)}
                    onChange={(e) => {
                      const raw = toEnDigits(e.target.value);
                      if (/^[0-9.]*$/.test(raw)) setGivenMoneyStr(raw);
                    }}
                    placeholder={digitMode === 'bn' ? 'যেমন: ১০০' : 'e.g. 100'}
                    className="w-full text-2xl font-bold px-4 py-3 pl-12 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 focus:border-amber-500 outline-none text-slate-900 dark:text-white"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                    ৳
                  </span>
                </div>

                {/* Quick Money Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[20, 50, 100, 150, 200, 500].map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        if (soundEnabled) soundFx.playTap();
                        setGivenMoneyStr(String(m));
                      }}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                    >
                      {formatDisplayNumber(m, digitMode, 0)} ৳
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Output Card */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 text-white shadow-xl shadow-amber-700/20 relative overflow-hidden">
              {/* Background scale icon */}
              <div className="absolute -right-4 -bottom-4 text-7xl opacity-15 pointer-events-none select-none">
                ⚖️
              </div>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-amber-500/40 pb-3">
                <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                  {calcMode === 'weight_to_price' ? 'নির্ধারিত ওজন অনুযায়ী মোট দাম' : 'নির্ধারিত টাকায় প্রাপ্য মোট ওজন'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/30 text-amber-100 border border-amber-400/30">
                  {selectedItemName}
                </span>
              </div>

              {/* Primary Output */}
              <div className="my-4">
                {calcMode === 'weight_to_price' ? (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-xs">
                        {formatDisplayNumber(calculatedTotalPrice, digitMode, 2)}
                      </span>
                      <span className="text-2xl font-bold text-amber-200">টাকা</span>
                    </div>
                    <p className="text-xs text-amber-100/90 mt-1 line-clamp-1 font-medium">
                      কথায়: {amountToBanglaWords(calculatedTotalPrice)}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      {derivedKgPart > 0 && (
                        <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                          {formatDisplayNumber(derivedKgPart, digitMode, 0)} কেজি
                        </span>
                      )}
                      <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                        {formatDisplayNumber(derivedGramPart, digitMode, 0)}
                      </span>
                      <span className="text-2xl font-bold text-amber-200">গ্রাম</span>
                    </div>
                    <p className="text-xs text-amber-100/90 mt-1 font-medium">
                      মোট: {formatDisplayNumber(calculatedWeightInGrams, digitMode, 0)} গ্রাম ({formatDisplayNumber(calculatedWeightInKg, digitMode, 3)} কেজি)
                    </p>
                  </>
                )}
              </div>

              {/* Breakdown Details */}
              <div className="space-y-2.5 pt-3 border-t border-amber-500/30 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-amber-100">
                  <span>১ কেজির দর:</span>
                  <span className="font-bold text-white">
                    {formatDisplayNumber(pricePerKg, digitMode, 2)} ৳
                  </span>
                </div>

                {calcMode === 'weight_to_price' ? (
                  <>
                    <div className="flex items-center justify-between text-amber-100">
                      <span>মোট ওজন:</span>
                      <span className="font-bold text-white">
                        {formatDisplayNumber(kgVal, digitMode, 0)} কেজি {formatDisplayNumber(gramVal, digitMode, 0)} গ্রাম
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-amber-100">
                      <span>কেজিতে রূপান্তর:</span>
                      <span className="font-bold text-white">
                        {formatDisplayNumber(totalWeightInKg, digitMode, 3)} কেজি ({formatDisplayNumber(totalWeightInGrams, digitMode, 0)} গ্রাম)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-amber-200 pt-1 border-t border-amber-500/40">
                      <span>হিসাব সূত্র:</span>
                      <span className="font-mono text-[11px] text-amber-100">
                        {formatDisplayNumber(totalWeightInKg, digitMode, 3)} × {formatDisplayNumber(pricePerKg, digitMode, 0)} = {formatDisplayNumber(calculatedTotalPrice, digitMode, 2)} ৳
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-amber-100">
                      <span>ক্রেতার দেওয়া টাকা:</span>
                      <span className="font-bold text-white">
                        {formatDisplayNumber(givenMoney, digitMode, 2)} ৳
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-amber-200 pt-1 border-t border-amber-500/40">
                      <span>হিসাব সূত্র:</span>
                      <span className="font-mono text-[11px] text-amber-100">
                        ({formatDisplayNumber(givenMoney, digitMode, 0)} ÷ {formatDisplayNumber(pricePerKg, digitMode, 0)}) × ১০০০ = {formatDisplayNumber(calculatedWeightInGrams, digitMode, 0)} গ্রাম
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Scenario Explanation Card */}
              <div className="mt-4 p-2.5 rounded-xl bg-black/15 text-[11px] text-amber-100 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-white flex-shrink-0" />
                <span>
                  {calcMode === 'weight_to_price'
                    ? `১ কেজির দাম ${formatDisplayNumber(pricePerKg, digitMode, 0)} টাকা হলে ${formatDisplayNumber(kgVal, digitMode, 0)} কেজি ${formatDisplayNumber(gramVal, digitMode, 0)} গ্রাম ওজনের দাম হবে ঠিক ${formatDisplayNumber(calculatedTotalPrice, digitMode, 2)} টাকা।`
                    : `১ কেজি ${formatDisplayNumber(pricePerKg, digitMode, 0)} টাকা দরে ${formatDisplayNumber(givenMoney, digitMode, 0)} টাকায় ক্রেতা পাবেন ${derivedKgPart > 0 ? `${formatDisplayNumber(derivedKgPart, digitMode, 0)} কেজি ` : ''}${formatDisplayNumber(derivedGramPart, digitMode, 0)} গ্রাম।`}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-600">কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>কপি হিসাব</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSaveToHistory}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-600">সংরক্ষিত!</span>
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
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 text-xs font-bold transition cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>ওজন স্লিপ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Weight Slip Modal */}
      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        title="ওজন ও পণ্যের মূল্য রসিদ"
        subtitle={`পণ্যের বিবরণ: ${selectedItemName}`}
        items={[
          { label: '১ কেজির দর', value: `${formatDisplayNumber(pricePerKg, digitMode, 2)} ৳ / কেজি` },
          {
            label: 'পরিমাপকৃত ওজন',
            value: `${formatDisplayNumber(totalWeightInKg, digitMode, 3)} কেজি (${formatDisplayNumber(totalWeightInGrams, digitMode, 0)} গ্রাম)`,
            isBold: true,
          },
          {
            label: 'মোট প্রদেয় মূল্য',
            value: `${formatDisplayNumber(calcMode === 'weight_to_price' ? calculatedTotalPrice : givenMoney, digitMode, 2)} ৳`,
            isHighlight: true,
          },
        ]}
        totalAmountText={`${formatDisplayNumber(calcMode === 'weight_to_price' ? calculatedTotalPrice : givenMoney, digitMode, 2)} টাকা`}
        rawAmount={calcMode === 'weight_to_price' ? calculatedTotalPrice : givenMoney}
        digitMode={digitMode}
        notes="ক্রয়কৃত পণ্য ও ওজনের নির্ভুলতা ডিজিটাল স্কেলের মাধ্যমে যাচাই করে গ্রহণ করুন।"
      />
    </div>
  );
};
