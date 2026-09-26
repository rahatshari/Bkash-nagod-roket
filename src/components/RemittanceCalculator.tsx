import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe2, 
  Copy, 
  Check, 
  BookmarkCheck, 
  FileText, 
  RotateCcw,
  Percent,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { CurrencyItem, DigitMode, RemittanceDirection, HistoryRecord } from '../types';
import { 
  formatDisplayNumber, 
  toBnDigits, 
  toEnDigits, 
  parseNumberInput, 
  amountToBanglaWords,
  soundFx 
} from '../utils/numberConverter';
import { ReceiptModal } from './ReceiptModal';

interface RemittanceCalculatorProps {
  digitMode: DigitMode;
  soundEnabled: boolean;
  onSaveHistory: (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => void;
}

const DEFAULT_CURRENCIES: CurrencyItem[] = [
  { code: 'SAR', nameBn: 'সৌদি আরব', nameEn: 'Saudi Arabia', currencyNameBn: 'সৌদি রিয়াল', currencyNameEn: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦', defaultRate: 36.00 },
  { code: 'AED', nameBn: 'দুবাই / ইউএই', nameEn: 'UAE (Dubai)', currencyNameBn: 'দিরহাম', currencyNameEn: 'Dirham', symbol: 'د.إ', flag: '🇦🇪', defaultRate: 33.20 },
  { code: 'QAR', nameBn: 'কাতার', nameEn: 'Qatar', currencyNameBn: 'কাতারি রিয়াল', currencyNameEn: 'Qatari Riyal', symbol: 'ر.ق', flag: '🇶🇦', defaultRate: 33.40 },
  { code: 'KWD', nameBn: 'কুয়েত', nameEn: 'Kuwait', currencyNameBn: 'কুয়েতি দিনার', currencyNameEn: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼', defaultRate: 396.00 },
  { code: 'OMR', nameBn: 'ওমান', nameEn: 'Oman', currencyNameBn: 'ওমানি রিয়াল', currencyNameEn: 'Omani Rial', symbol: 'ر.ع.', flag: '🇴🇲', defaultRate: 316.00 },
  { code: 'BHD', nameBn: 'বাহরাইন', nameEn: 'Bahrain', currencyNameBn: 'বাহরাইনি দিনার', currencyNameEn: 'Bahraini Dinar', symbol: '.د.ব', flag: '🇧🇭', defaultRate: 323.00 },
  { code: 'MYR', nameBn: 'মালয়েশিয়া', nameEn: 'Malaysia', currencyNameBn: 'রিঙ্গিত', currencyNameEn: 'Ringgit', symbol: 'RM', flag: '🇲🇾', defaultRate: 27.80 },
  { code: 'SGD', nameBn: 'সিঙ্গাপুর', nameEn: 'Singapore', currencyNameBn: 'সিঙ্গাপুর ডলার', currencyNameEn: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', defaultRate: 92.50 },
  { code: 'USD', nameBn: 'যুক্তরাষ্ট্র (আমেরিকা)', nameEn: 'USA', currencyNameBn: 'ইউএস ডলার', currencyNameEn: 'US Dollar', symbol: '$', flag: '🇺🇸', defaultRate: 122.00 },
  { code: 'GBP', nameBn: 'যুক্তরাজ্য (লন্ডন)', nameEn: 'UK', currencyNameBn: 'ব্রিটিশ পাউন্ড', currencyNameEn: 'British Pound', symbol: '£', flag: '🇬🇧', defaultRate: 158.50 },
  { code: 'EUR', nameBn: 'ইউরোপ / ইতালি', nameEn: 'Eurozone / Italy', currencyNameBn: 'ইউরো', currencyNameEn: 'Euro', symbol: '€', flag: '🇪🇺', defaultRate: 134.50 },
  { code: 'CAD', nameBn: 'কানাডা', nameEn: 'Canada', currencyNameBn: 'কানাডিয়ান ডলার', currencyNameEn: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', defaultRate: 90.00 },
  { code: 'AUD', nameBn: 'অস্ট্রেলিয়া', nameEn: 'Australia', currencyNameBn: 'অস্ট্রেলিয়ান ডলার', currencyNameEn: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', defaultRate: 80.50 },
  { code: 'INR', nameBn: 'ভারত', nameEn: 'India', currencyNameBn: 'ভারতীয় রুপি', currencyNameEn: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', defaultRate: 1.45 },
  { code: 'PKR', nameBn: 'পাকিস্তান', nameEn: 'Pakistan', currencyNameBn: 'পাকিস্তানি রুপি', currencyNameEn: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰', defaultRate: 0.44 },
  { code: 'KRW', nameBn: 'দক্ষিণ কোরিয়া', nameEn: 'South Korea', currencyNameBn: 'কোরিয়ান ওন', currencyNameEn: 'Korean Won', symbol: '₩', flag: '🇰🇷', defaultRate: 0.091 },
  { code: 'JPY', nameBn: 'জাপান', nameEn: 'Japan', currencyNameBn: 'জাপানিজ ইয়েন', currencyNameEn: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', defaultRate: 0.81 }
];

export const RemittanceCalculator: React.FC<RemittanceCalculatorProps> = ({
  digitMode,
  soundEnabled,
  onSaveHistory
}) => {
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('SAR');
  const [customRateStr, setCustomRateStr] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [direction, setDirection] = useState<RemittanceDirection>('foreign_to_bdt');
  const [includeIncentive, setIncludeIncentive] = useState<boolean>(true); // 2.5% incentive
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);

  const activeCurrency = DEFAULT_CURRENCIES.find((c) => c.code === selectedCurrencyCode) || DEFAULT_CURRENCIES[0];
  const effectiveRate = customRateStr !== '' 
    ? (parseNumberInput(customRateStr) || 0) 
    : activeCurrency.defaultRate;

  const inputAmount = parseNumberInput(amountStr);

  // Calculations
  let baseBdt = 0;
  let incentiveAmount = 0;
  let totalBdt = 0;
  let foreignConverted = 0;

  if (direction === 'foreign_to_bdt') {
    baseBdt = inputAmount * effectiveRate;
    incentiveAmount = includeIncentive ? baseBdt * 0.025 : 0;
    totalBdt = baseBdt + incentiveAmount;
  } else {
    // bdt_to_foreign
    totalBdt = inputAmount;
    foreignConverted = effectiveRate > 0 ? inputAmount / effectiveRate : 0;
  }

  // Auto-save history with debounce
  const lastSavedRef = useRef<string>('');
  useEffect(() => {
    if (inputAmount <= 0 || effectiveRate <= 0) return;
    const key = `${selectedCurrencyCode}_${direction}_${inputAmount}_${effectiveRate}_${includeIncentive}`;
    if (lastSavedRef.current === key) return;

    const timer = setTimeout(() => {
      lastSavedRef.current = key;
      const title = `রেমিট্যান্স (${activeCurrency.nameBn})`;
      const subtitle = direction === 'foreign_to_bdt'
        ? `${formatDisplayNumber(inputAmount, digitMode)} ${activeCurrency.code} = ${formatDisplayNumber(totalBdt, digitMode, 2)} ৳ (প্রণোদনাসহ)`
        : `${formatDisplayNumber(inputAmount, digitMode)} ৳ = ${formatDisplayNumber(foreignConverted, digitMode, 2)} ${activeCurrency.code}`;

      onSaveHistory({
        type: 'remittance',
        title,
        subtitle,
        data: {
          currencyCode: activeCurrency.code,
          currencyName: activeCurrency.currencyNameBn,
          countryName: activeCurrency.nameBn,
          flag: activeCurrency.flag,
          foreignAmount: direction === 'foreign_to_bdt' ? inputAmount : foreignConverted,
          bdtAmount: totalBdt,
          exchangeRate: effectiveRate,
          includeIncentive,
          incentivePercent: 2.5,
          incentiveAmount,
          totalWithIncentive: totalBdt,
          direction,
          date: new Date().toISOString()
        }
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [inputAmount, effectiveRate, direction, includeIncentive, selectedCurrencyCode, activeCurrency, totalBdt, foreignConverted, incentiveAmount, digitMode, onSaveHistory]);

  const handleResetRate = () => {
    if (soundEnabled) soundFx.playTap();
    setCustomRateStr('');
  };

  const handleClear = () => {
    if (soundEnabled) soundFx.playTap();
    setAmountStr('');
  };

  const handleCopy = async () => {
    if (soundEnabled) soundFx.playTap();
    const text = direction === 'foreign_to_bdt'
      ? `রেমিট্যান্স হিসাব:\nদেশ: ${activeCurrency.nameBn}\nপরিমাণ: ${formatDisplayNumber(inputAmount, digitMode)} ${activeCurrency.code}\nরেট: ১ ${activeCurrency.code} = ${formatDisplayNumber(effectiveRate, digitMode, 2)} ৳\nমূল টাকা: ${formatDisplayNumber(baseBdt, digitMode, 2)} ৳\nসরকারি প্রণোদনা (২.৫%): ${formatDisplayNumber(incentiveAmount, digitMode, 2)} ৳\nমোট বাংলাদেশি টাকা: ${formatDisplayNumber(totalBdt, digitMode, 2)} ৳`
      : `রেমিট্যান্স রূপান্তর:\nটাকা: ${formatDisplayNumber(inputAmount, digitMode)} ৳\nরেট: ১ ${activeCurrency.code} = ${formatDisplayNumber(effectiveRate, digitMode, 2)} ৳\nপাবেন: ${formatDisplayNumber(foreignConverted, digitMode, 2)} ${activeCurrency.code}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSave = () => {
    if (inputAmount <= 0) return;
    if (soundEnabled) soundFx.playSuccess();

    const title = `রেমিট্যান্স (${activeCurrency.nameBn})`;
    const subtitle = direction === 'foreign_to_bdt'
      ? `${formatDisplayNumber(inputAmount, digitMode)} ${activeCurrency.code} = ${formatDisplayNumber(totalBdt, digitMode, 2)} ৳ (প্রণোদনাসহ)`
      : `${formatDisplayNumber(inputAmount, digitMode)} ৳ = ${formatDisplayNumber(foreignConverted, digitMode, 2)} ${activeCurrency.code}`;

    onSaveHistory({
      type: 'remittance',
      title,
      subtitle,
      data: {
        currencyCode: activeCurrency.code,
        currencyName: activeCurrency.currencyNameBn,
        countryName: activeCurrency.nameBn,
        flag: activeCurrency.flag,
        foreignAmount: direction === 'foreign_to_bdt' ? inputAmount : foreignConverted,
        bdtAmount: totalBdt,
        exchangeRate: effectiveRate,
        includeIncentive,
        incentivePercent: 2.5,
        incentiveAmount,
        totalWithIncentive: totalBdt,
        direction,
        date: new Date().toISOString()
      }
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Main Clean Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
        {/* Header & Direction Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Globe2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              প্রবাসী রেমিট্যান্স ক্যালকুলেটর
            </h2>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playTap();
                setDirection('foreign_to_bdt');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                direction === 'foreign_to_bdt'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              বিদেশি মুদ্রা ➔ টাকা
            </button>
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playTap();
                setDirection('bdt_to_foreign');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                direction === 'bdt_to_foreign'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              টাকা ➔ বিদেশি মুদ্রা
            </button>
          </div>
        </div>

        {/* 1. Country Selection - Compact Dropdown Option as Requested */}
        <div className="space-y-3">
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
              দেশ নির্বাচন করুন
            </label>
            <div className="relative">
              <select
                value={selectedCurrencyCode}
                onChange={(e) => {
                  if (soundEnabled) soundFx.playTap();
                  setSelectedCurrencyCode(e.target.value);
                  setCustomRateStr('');
                }}
                className="w-full appearance-none px-4 py-3 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 focus:border-teal-500 font-bold text-sm sm:text-base text-slate-900 dark:text-white outline-none cursor-pointer transition"
              >
                {DEFAULT_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="dark:bg-slate-900 dark:text-white py-1">
                    {c.flag} {c.nameBn} — {c.currencyNameBn} ({c.code})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 2. Rate & 2.5% Incentive Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
            {/* Rate Edit */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                ১ {activeCurrency.code} =
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={digitMode === 'bn' ? toBnDigits(customRateStr) : toEnDigits(customRateStr)}
                onChange={(e) => {
                  const raw = toEnDigits(e.target.value);
                  if (/^[0-9.]*$/.test(raw)) setCustomRateStr(raw);
                }}
                placeholder={digitMode === 'bn' ? toBnDigits(String(activeCurrency.defaultRate)) : String(activeCurrency.defaultRate)}
                className="w-20 text-center font-extrabold text-sm sm:text-base px-2 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-teal-500 outline-none"
              />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">৳</span>
              {customRateStr !== '' && (
                <button
                  onClick={handleResetRate}
                  title="ডিফল্ট রেট রিস্টোর"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 2.5% Government Incentive Toggle */}
            {direction === 'foreign_to_bdt' && (
              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  checked={includeIncentive}
                  onChange={(e) => {
                    if (soundEnabled) soundFx.playTap();
                    setIncludeIncentive(e.target.checked);
                  }}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 accent-teal-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                  ২.৫% সরকারি প্রণোদনা
                </span>
              </label>
            )}
          </div>

          {/* 3. Currency Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                {direction === 'foreign_to_bdt'
                  ? `${activeCurrency.nameBn} থেকে প্রেরিত মুদ্রা (${activeCurrency.currencyNameBn}):`
                  : 'বাংলাদেশে কত টাকা পাঠাতে চান?'}
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
                placeholder="পরিমাণ লিখুন"
                className="w-full text-2xl sm:text-3xl font-extrabold px-4 py-3 pl-16 pr-28 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-slate-900 dark:text-white transition"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm sm:text-base font-extrabold text-teal-600 dark:text-teal-400">
                {direction === 'foreign_to_bdt' ? activeCurrency.code : '৳'}
              </span>
              {amountStr && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-500 dark:text-rose-400 text-sm font-black transition-all cursor-pointer border border-rose-500/30 shadow-sm"
                  title="টাকা মুছুন"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>মুছুন</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. Immediate Result Card */}
        <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 text-white shadow-lg shadow-teal-700/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-teal-100 font-semibold mb-1">
            <span>
              {direction === 'foreign_to_bdt' ? 'মোট প্রাপ্ত বাংলাদেশি টাকা:' : `প্রাপ্ত ${activeCurrency.currencyNameBn}:`}
            </span>
            <span className="bg-teal-500/30 px-2 py-0.5 rounded-md text-[11px] font-bold border border-teal-400/30">
              {direction === 'foreign_to_bdt' ? 'প্রণোদনাসহ সর্বমোট' : 'বিদেশি কারেন্সি'}
            </span>
          </div>

          {/* Big Amount */}
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            {direction === 'foreign_to_bdt' ? (
              <>৳ {formatDisplayNumber(totalBdt, digitMode, 2)}</>
            ) : (
              <>{formatDisplayNumber(foreignConverted, digitMode, 2)} {activeCurrency.code}</>
            )}
          </div>

          {/* Breakdown in a Clean Compact Grid */}
          {direction === 'foreign_to_bdt' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-black/15 text-xs">
              <div>
                <span className="text-teal-200 text-[11px] block">মূল রেটে টাকা:</span>
                <span className="font-bold text-sm text-white">
                  ৳ {formatDisplayNumber(baseBdt, digitMode, 2)}
                </span>
              </div>
              <div>
                <span className="text-teal-200 text-[11px] block">২.৫% সরকারি প্রণোদনা:</span>
                <span className="font-bold text-sm text-amber-300">
                  {includeIncentive ? `+ ৳ ${formatDisplayNumber(incentiveAmount, digitMode, 2)}` : 'যোগ করা হয়নি'}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-teal-200 text-[11px] block">বর্তমান রেট:</span>
                <span className="font-semibold text-xs text-teal-100">
                  ১ {activeCurrency.code} = {formatDisplayNumber(effectiveRate, digitMode, 2)} ৳
                </span>
              </div>
            </div>
          )}

          {/* Words */}
          {direction === 'foreign_to_bdt' && totalBdt > 0 && (
            <div className="mt-2.5 text-xs text-teal-100/90 font-medium">
              কথায়: {amountToBanglaWords(totalBdt)}
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-teal-500/30">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 transition text-xs font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-300" /> : <Copy className="w-3.5 h-3.5" />}
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
          title="রেমিট্যান্স হিসাব রসিদ"
          subtitle={`${activeCurrency.flag} ${activeCurrency.nameBn} (${activeCurrency.currencyNameBn})`}
          items={[
            { label: 'প্রেরিত মুদ্রা', value: `${formatDisplayNumber(inputAmount, digitMode, 2)} ${activeCurrency.code}` },
            { label: 'এক্সচেঞ্জ রেট', value: `১ ${activeCurrency.code} = ${formatDisplayNumber(effectiveRate, digitMode, 2)} ৳` },
            ...(includeIncentive && direction === 'foreign_to_bdt' ? [{ label: '২.৫% সরকারি প্রণোদনা', value: `${formatDisplayNumber(incentiveAmount, digitMode, 2)} ৳`, isHighlight: true }] : [])
          ]}
          totalAmountText={direction === 'foreign_to_bdt' ? `${formatDisplayNumber(totalBdt, digitMode, 2)} ৳` : `${formatDisplayNumber(foreignConverted, digitMode, 2)} ${activeCurrency.code}`}
          rawAmount={totalBdt}
          digitMode={digitMode}
        />
      )}
    </div>
  );
};
