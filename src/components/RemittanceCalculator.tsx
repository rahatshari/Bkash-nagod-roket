import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  ArrowRightLeft, 
  Sparkles, 
  Copy, 
  Check, 
  BookmarkCheck, 
  FileText, 
  Edit3, 
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  Plus
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

const DEFAULT_CURRENCIES: CurrencyItem[] = [
  {
    code: 'SAR',
    nameBn: 'সৌদি আরব',
    nameEn: 'Saudi Arabia',
    currencyNameBn: 'সৌদি রিয়াল',
    currencyNameEn: 'Saudi Riyal',
    symbol: '﷼',
    flag: '🇸🇦',
    defaultRate: 36.00, // Matching user prompt example!
  },
  {
    code: 'AED',
    nameBn: 'সংযুক্ত আরব আমিরাত (দুবাই)',
    nameEn: 'UAE (Dubai)',
    currencyNameBn: 'দিরহাম',
    currencyNameEn: 'Dirham',
    symbol: 'د.إ',
    flag: '🇦🇪',
    defaultRate: 33.20,
  },
  {
    code: 'QAR',
    nameBn: 'কাতার',
    nameEn: 'Qatar',
    currencyNameBn: 'কাতারি রিয়াল',
    currencyNameEn: 'Qatari Riyal',
    symbol: 'ر.ق',
    flag: '🇶🇦',
    defaultRate: 33.40,
  },
  {
    code: 'KWD',
    nameBn: 'কুয়েত',
    nameEn: 'Kuwait',
    currencyNameBn: 'কুয়েতি দিনার',
    currencyNameEn: 'Kuwaiti Dinar',
    symbol: 'د.ك',
    flag: '🇰🇼',
    defaultRate: 396.00,
  },
  {
    code: 'OMR',
    nameBn: 'ওমান',
    nameEn: 'Oman',
    currencyNameBn: 'ওমানি রিয়াল',
    currencyNameEn: 'Omani Rial',
    symbol: 'ر.ع.',
    flag: '🇴🇲',
    defaultRate: 316.00,
  },
  {
    code: 'BHD',
    nameBn: 'বাহরাইন',
    nameEn: 'Bahrain',
    currencyNameBn: 'বাহরাইনি দিনার',
    currencyNameEn: 'Bahraini Dinar',
    symbol: '.দ.ب',
    flag: '🇧🇭',
    defaultRate: 323.00,
  },
  {
    code: 'MYR',
    nameBn: 'মালয়েশিয়া',
    nameEn: 'Malaysia',
    currencyNameBn: 'মালয়েশিয়ান রিঙ্গিত',
    currencyNameEn: 'Ringgit',
    symbol: 'RM',
    flag: '🇲🇾',
    defaultRate: 27.80,
  },
  {
    code: 'SGD',
    nameBn: 'সিঙ্গাপুর',
    nameEn: 'Singapore',
    currencyNameBn: 'সিঙ্গাপুর ডলার',
    currencyNameEn: 'Singapore Dollar',
    symbol: 'S$',
    flag: '🇸🇬',
    defaultRate: 92.50,
  },
  {
    code: 'USD',
    nameBn: 'যুক্তরাষ্ট্র (আমেরিকা)',
    nameEn: 'USA',
    currencyNameBn: 'ইউএস ডলার',
    currencyNameEn: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    defaultRate: 122.00,
  },
  {
    code: 'GBP',
    nameBn: 'যুক্তরাজ্য (লন্ডন)',
    nameEn: 'UK',
    currencyNameBn: 'ব্রিটিশ পাউন্ড',
    currencyNameEn: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    defaultRate: 158.50,
  },
  {
    code: 'EUR',
    nameBn: 'ইউরোপ / ইতালি',
    nameEn: 'Eurozone / Italy',
    currencyNameBn: 'ইউরো',
    currencyNameEn: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    defaultRate: 134.50,
  },
  {
    code: 'CAD',
    nameBn: 'কানাডা',
    nameEn: 'Canada',
    currencyNameBn: 'কানাডিয়ান ডলার',
    currencyNameEn: 'Canadian Dollar',
    symbol: 'C$',
    flag: '🇨🇦',
    defaultRate: 90.00,
  },
  {
    code: 'AUD',
    nameBn: 'অস্ট্রেলিয়া',
    nameEn: 'Australia',
    currencyNameBn: 'অস্ট্রেলিয়ান ডলার',
    currencyNameEn: 'Australian Dollar',
    symbol: 'A$',
    flag: '🇦🇺',
    defaultRate: 80.50,
  },
  {
    code: 'INR',
    nameBn: 'ভারত',
    nameEn: 'India',
    currencyNameBn: 'ভারতীয় রুপি',
    currencyNameEn: 'Indian Rupee',
    symbol: '₹',
    flag: '🇮🇳',
    defaultRate: 1.45,
  },
  {
    code: 'CUSTOM',
    nameBn: 'অন্যান্য দেশ / কাস্টম',
    nameEn: 'Custom Country',
    currencyNameBn: 'মুদ্রা',
    currencyNameEn: 'Custom Currency',
    symbol: '🌐',
    flag: '🌐',
    defaultRate: 1.00,
  }
];

interface RemittanceCalculatorProps {
  digitMode: DigitMode;
  soundEnabled: boolean;
  onSaveHistory: (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => void;
}

export const RemittanceCalculator: React.FC<RemittanceCalculatorProps> = ({
  digitMode,
  soundEnabled,
  onSaveHistory,
}) => {
  // Saved custom rates from localStorage
  const [currencies, setCurrencies] = useState<CurrencyItem[]>(() => {
    try {
      const saved = localStorage.getItem('remittance_rates');
      if (saved) {
        const parsed = JSON.parse(saved);
        return DEFAULT_CURRENCIES.map((c) => ({
          ...c,
          defaultRate: parsed[c.code] !== undefined ? parsed[c.code] : c.defaultRate,
        }));
      }
    } catch {
      // fallback
    }
    return DEFAULT_CURRENCIES;
  });

  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('SAR');
  const [foreignInputStr, setForeignInputStr] = useState<string>('1000'); // Default to 1000 as per user prompt!
  const [bdtInputStr, setBdtInputStr] = useState<string>('');
  const [direction, setDirection] = useState<RemittanceDirection>('foreign_to_bdt');
  const [includeIncentive, setIncludeIncentive] = useState<boolean>(true); // 2.5% Govt Incentive is active by default
  const [incentiveRate, setIncentiveRate] = useState<number>(2.5); // 2.5%
  
  // Custom rate editing state
  const [isEditingRate, setIsEditingRate] = useState<boolean>(false);
  const [tempRateStr, setTempRateStr] = useState<string>('');
  
  // Modals & Feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);

  const activeCurrency = currencies.find((c) => c.code === selectedCurrencyCode) || currencies[0];
  const currentRate = activeCurrency.defaultRate;

  // Calculation Logic
  const foreignAmount = parseNumberInput(foreignInputStr);
  const bdtInputAmount = parseNumberInput(bdtInputStr);

  // When direction is foreign_to_bdt:
  // Base BDT = Foreign * Rate
  const baseBdt = direction === 'foreign_to_bdt' 
    ? foreignAmount * currentRate 
    : bdtInputAmount;

  const derivedForeign = direction === 'bdt_to_foreign' && currentRate > 0
    ? bdtInputAmount / currentRate
    : foreignAmount;

  // Government Incentive
  const incentiveAmount = includeIncentive ? (baseBdt * (incentiveRate / 100)) : 0;
  const totalBdtWithIncentive = baseBdt + incentiveAmount;

  // Update rates locally
  const handleSaveRate = () => {
    if (soundEnabled) soundFx.playSuccess();
    const newRate = parseNumberInput(tempRateStr);
    if (newRate > 0) {
      const updated = currencies.map((c) => 
        c.code === activeCurrency.code ? { ...c, defaultRate: newRate } : c
      );
      setCurrencies(updated);
      try {
        const rateMap: Record<string, number> = {};
        updated.forEach((c) => { rateMap[c.code] = c.defaultRate; });
        localStorage.setItem('remittance_rates', JSON.stringify(rateMap));
      } catch {
        // ignore
      }
    }
    setIsEditingRate(false);
  };

  const handleResetRates = () => {
    if (soundEnabled) soundFx.playTap();
    setCurrencies(DEFAULT_CURRENCIES);
    try {
      localStorage.removeItem('remittance_rates');
    } catch {
      // ignore
    }
  };

  const handleCopy = async () => {
    if (soundEnabled) soundFx.playTap();
    const text = `রেমিট্যান্স হিসাব:\nদেশ/মুদ্রা: ${activeCurrency.nameBn} (${activeCurrency.currencyNameBn})\nবৈদেশিক টাকা: ${formatDisplayNumber(derivedForeign, digitMode, 2)} ${activeCurrency.symbol}\nআজকের রেট: ১ ${activeCurrency.code} = ${formatDisplayNumber(currentRate, digitMode, 2)} ৳\nমূল টাকা: ${formatDisplayNumber(baseBdt, digitMode, 2)} ৳\n${includeIncentive ? `সরকারি প্রণোদনা (${formatDisplayNumber(incentiveRate, digitMode)}%): +${formatDisplayNumber(incentiveAmount, digitMode, 2)} ৳\n` : ''}সর্বমোট পাবেন: ${formatDisplayNumber(totalBdtWithIncentive, digitMode, 2)} ৳`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSaveToHistory = () => {
    if (derivedForeign <= 0 && baseBdt <= 0) return;
    if (soundEnabled) soundFx.playSuccess();

    const title = `রেমিট্যান্স (${activeCurrency.flag} ${activeCurrency.nameBn})`;
    const subtitle = `${formatDisplayNumber(derivedForeign, digitMode, 2)} ${activeCurrency.currencyNameBn} @ ${formatDisplayNumber(currentRate, digitMode, 2)} ৳ = ${formatDisplayNumber(totalBdtWithIncentive, digitMode, 2)} ৳`;

    onSaveHistory({
      type: 'remittance',
      title,
      subtitle,
      data: {
        foreignAmount: derivedForeign,
        bdtAmount: baseBdt,
        exchangeRate: currentRate,
        currencyCode: activeCurrency.code,
        currencyName: activeCurrency.currencyNameBn,
        countryName: activeCurrency.nameBn,
        flag: activeCurrency.flag,
        includeIncentive,
        incentivePercent: incentiveRate,
        incentiveAmount,
        totalWithIncentive: totalBdtWithIncentive,
        direction,
        date: new Date().toISOString(),
      },
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Direction Switch */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/90 dark:border-slate-800 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
                <Globe2 className="w-5 h-5" />
              </span>
              প্রবাসী রেমিট্যান্স ও বৈদেশিক মুদ্রা ক্যালকুলেটর
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              সৌদি, দুবাই, কাতার, কুয়েতসহ বিশ্বের যে কোনো দেশের টাকা ও ২.৫% সরকারি প্রণোদনা হিসাব
            </p>
          </div>

          {/* Direction Switcher */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playTap();
                setDirection('foreign_to_bdt');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                direction === 'foreign_to_bdt'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              বিদেশি টাকা ➔ বাংলাদেশি টাকা
            </button>
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playTap();
                setDirection('bdt_to_foreign');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                direction === 'bdt_to_foreign'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              বাংলাদেশি টাকা ➔ বিদেশি মুদ্রা
            </button>
          </div>
        </div>

        {/* Currency Selector Horizontal Scroll */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              দেশ ও মুদ্রা নির্বাচন করুন:
            </span>
            <button
              onClick={handleResetRates}
              className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ডিফল্ট রেট রিস্টোর</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
            {currencies.map((curr) => {
              const isSelected = selectedCurrencyCode === curr.code;
              return (
                <button
                  key={curr.code}
                  onClick={() => {
                    if (soundEnabled) soundFx.playTap();
                    setSelectedCurrencyCode(curr.code);
                    setIsEditingRate(false);
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 dark:border-teal-500 shadow-xs ring-1 ring-teal-500/30'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-xl sm:text-2xl">{curr.flag}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 dark:text-white truncate">
                      {curr.nameBn}
                    </div>
                    <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold truncate">
                      ১ {curr.code} = {formatDisplayNumber(curr.defaultRate, digitMode, 2)} ৳
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input & Rate Adjust Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left: Input Amount & Rate Setting */}
          <div className="lg:col-span-7 space-y-5">
            {/* Input Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>
                    {direction === 'foreign_to_bdt'
                      ? `${activeCurrency.nameBn} থেকে কত টাকা পাঠাবে? (${activeCurrency.currencyNameBn})`
                      : `বাংলাদেশে কত টাকা পাঠাতে চান? (টাকা)`}
                  </span>
                  <span className="text-teal-600 font-bold">*</span>
                </label>
                {(direction === 'foreign_to_bdt' ? foreignInputStr : bdtInputStr) && (
                  <button
                    onClick={() => {
                      if (direction === 'foreign_to_bdt') setForeignInputStr('');
                      else setBdtInputStr('');
                    }}
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
                  value={
                    direction === 'foreign_to_bdt'
                      ? (digitMode === 'bn' ? toBnDigits(foreignInputStr) : toEnDigits(foreignInputStr))
                      : (digitMode === 'bn' ? toBnDigits(bdtInputStr) : toEnDigits(bdtInputStr))
                  }
                  onChange={(e) => {
                    const raw = toEnDigits(e.target.value);
                    if (/^[0-9.]*$/.test(raw)) {
                      if (direction === 'foreign_to_bdt') setForeignInputStr(raw);
                      else setBdtInputStr(raw);
                    }
                  }}
                  placeholder={
                    direction === 'foreign_to_bdt'
                      ? (digitMode === 'bn' ? 'যেমন: ১০০০' : 'e.g. 1000')
                      : (digitMode === 'bn' ? 'যেমন: ৫০,০০০' : 'e.g. 50000')
                  }
                  className="w-full text-2xl sm:text-3xl font-bold px-4 py-3.5 pl-14 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-900 outline-none text-slate-900 dark:text-white transition"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400 dark:text-slate-500">
                  {direction === 'foreign_to_bdt' ? activeCurrency.symbol : '৳'}
                </span>
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <button
                  onClick={() => {
                    if (soundEnabled) soundFx.playTap();
                    if (direction === 'foreign_to_bdt') setForeignInputStr('1000');
                    else setBdtInputStr('36000');
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 hover:bg-teal-200 cursor-pointer border border-teal-300/60 dark:border-teal-700/60 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  <span>উদাহরণ: {direction === 'foreign_to_bdt' ? `${formatDisplayNumber(1000, digitMode, 0)} ${activeCurrency.currencyNameBn}` : `${formatDisplayNumber(36000, digitMode, 0)} ৳`}</span>
                </button>
                {(direction === 'foreign_to_bdt' ? [500, 1000, 2000, 5000] : [10000, 25000, 50000, 100000]).map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      if (soundEnabled) soundFx.playTap();
                      if (direction === 'foreign_to_bdt') {
                        const curr = parseNumberInput(foreignInputStr);
                        setForeignInputStr(String(curr + val));
                      } else {
                        const curr = parseNumberInput(bdtInputStr);
                        setBdtInputStr(String(curr + val));
                      }
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition active:scale-95"
                  >
                    +{formatDisplayNumber(val, digitMode, 0)}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Exchange Rate Card with In-place Edit */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    <span>আজকের রেট ({activeCurrency.currencyNameBn} ➔ টাকা)</span>
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    রেট পরিবর্তন হলে আপনি নিজের মতো রেট লিখে সংরক্ষণ করতে পারেন
                  </p>
                </div>

                {!isEditingRate && (
                  <button
                    onClick={() => {
                      setTempRateStr(String(currentRate));
                      setIsEditingRate(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 hover:bg-teal-50 cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>রেট পরিবর্তন</span>
                  </button>
                )}
              </div>

              {isEditingRate ? (
                <div className="flex items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={digitMode === 'bn' ? toBnDigits(tempRateStr) : toEnDigits(tempRateStr)}
                      onChange={(e) => setTempRateStr(toEnDigits(e.target.value))}
                      placeholder="১ ইউনিটের রেট"
                      className="w-full text-base font-bold px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-teal-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleSaveRate}
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 cursor-pointer shadow-xs"
                  >
                    সেভ করুন
                  </button>
                  <button
                    onClick={() => setIsEditingRate(false)}
                    className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    বাতিল
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeCurrency.flag}</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                      ১ {activeCurrency.currencyNameBn} ({activeCurrency.code})
                    </span>
                  </div>
                  <div className="text-lg font-extrabold text-teal-600 dark:text-teal-400">
                    = {formatDisplayNumber(currentRate, digitMode, 2)} টাকা
                  </div>
                </div>
              )}

              {/* 2.5% Government Incentive Toggle */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="incentive-toggle"
                    checked={includeIncentive}
                    onChange={(e) => {
                      if (soundEnabled) soundFx.playTap();
                      setIncludeIncentive(e.target.checked);
                    }}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600 cursor-pointer accent-teal-600"
                  />
                  <label htmlFor="incentive-toggle" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>বাংলাদেশ সরকারের ২.৫% রেমিট্যান্স প্রণোদনা যোগ করুন</span>
                  </label>
                </div>
                {includeIncentive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    +২.৫% সক্রিয়
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Result Display Card */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 text-white shadow-xl shadow-teal-900/20 relative overflow-hidden">
              {/* Background Flag / Currency icon */}
              <div className="absolute -right-4 -bottom-4 text-7xl opacity-15 pointer-events-none select-none">
                {activeCurrency.flag}
              </div>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-teal-500/40 pb-3">
                <span className="text-xs font-semibold text-teal-200 uppercase tracking-wider">
                  {direction === 'foreign_to_bdt' ? 'বাংলাদেশে সর্বমোট পাবেন' : 'বিদেশ থেকে পাঠাতে হবে'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/30 text-teal-100 border border-teal-400/30">
                  {activeCurrency.nameBn}
                </span>
              </div>

              {/* Big Result Output */}
              <div className="my-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-xs">
                    {formatDisplayNumber(
                      direction === 'foreign_to_bdt' ? totalBdtWithIncentive : derivedForeign,
                      digitMode,
                      2
                    )}
                  </span>
                  <span className="text-2xl font-bold text-teal-200">
                    {direction === 'foreign_to_bdt' ? 'টাকা' : activeCurrency.currencyNameBn}
                  </span>
                </div>
                <p className="text-xs text-teal-100/90 mt-1 line-clamp-1 font-medium">
                  কথায়: {amountToBanglaWords(direction === 'foreign_to_bdt' ? totalBdtWithIncentive : derivedForeign)}
                </p>
              </div>

              {/* Details Breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-teal-500/30 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-teal-100">
                  <span>বৈদেশিক মুদ্রা ({activeCurrency.code}):</span>
                  <span className="font-bold text-white">
                    {formatDisplayNumber(derivedForeign, digitMode, 2)} {activeCurrency.symbol}
                  </span>
                </div>

                <div className="flex items-center justify-between text-teal-100">
                  <span>এক্সচেঞ্জ রেট:</span>
                  <span className="font-bold text-amber-300">
                    ১ = {formatDisplayNumber(currentRate, digitMode, 2)} ৳
                  </span>
                </div>

                <div className="flex items-center justify-between text-teal-100">
                  <span>মূল বাংলাদেশি টাকা:</span>
                  <span className="font-bold text-white">
                    {formatDisplayNumber(baseBdt, digitMode, 2)} ৳
                  </span>
                </div>

                {includeIncentive && (
                  <div className="flex items-center justify-between text-emerald-200 pt-1 border-t border-teal-600/40">
                    <span>সরকারি প্রণোদনা ({formatDisplayNumber(incentiveRate, digitMode)}%):</span>
                    <span className="font-extrabold text-amber-300">
                      + {formatDisplayNumber(incentiveAmount, digitMode, 2)} ৳
                    </span>
                  </div>
                )}
              </div>

              {/* Real World Scenario Pill */}
              <div className="mt-4 p-2.5 rounded-xl bg-black/15 text-[11px] text-teal-100 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                <span>
                  {direction === 'foreign_to_bdt'
                    ? `${activeCurrency.nameBn} থেকে ${formatDisplayNumber(derivedForeign, digitMode, 0)} ${activeCurrency.currencyNameBn} পাঠালে আজকের রেটে মূল টাকা ${formatDisplayNumber(baseBdt, digitMode, 2)} ৳${includeIncentive ? ` এবং সরকারি প্রণোদনা সহ সর্বমোট ${formatDisplayNumber(totalBdtWithIncentive, digitMode, 2)} ৳ পাবেন।` : ' পাবেন।'}`
                    : `বাংলাদেশে ${formatDisplayNumber(baseBdt, digitMode, 0)} টাকা পেতে ${activeCurrency.nameBn} থেকে ${formatDisplayNumber(derivedForeign, digitMode, 2)} ${activeCurrency.currencyNameBn} পাঠাতে হবে।`}
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
                    <Check className="w-4 h-4 text-teal-500" />
                    <span className="text-teal-600">কপি হয়েছে!</span>
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
                    <Check className="w-4 h-4 text-teal-500" />
                    <span className="text-teal-600">সংরক্ষিত!</span>
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
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 text-xs font-bold transition cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>মেমো স্লিপ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Remittance Digital Receipt */}
      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        title="বৈদেশিক রেমিট্যান্স বিবরণী স্লিপ"
        subtitle={`দেশ: ${activeCurrency.flag} ${activeCurrency.nameBn}`}
        items={[
          { label: 'মুদ্রার নাম', value: `${activeCurrency.currencyNameBn} (${activeCurrency.code})` },
          { label: 'বৈদেশিক টাকার পরিমাণ', value: `${formatDisplayNumber(derivedForeign, digitMode, 2)} ${activeCurrency.symbol}`, isBold: true },
          { label: 'প্রতি ১ ইউনিটের রেট', value: `${formatDisplayNumber(currentRate, digitMode, 2)} ৳` },
          { label: 'মূল রেমিট্যান্স টাকা', value: `${formatDisplayNumber(baseBdt, digitMode, 2)} ৳`, isBold: true },
          ...(includeIncentive
            ? [
                {
                  label: `সরকারি প্রণোদনা (${formatDisplayNumber(incentiveRate, digitMode)}%)`,
                  value: `+${formatDisplayNumber(incentiveAmount, digitMode, 2)} ৳`,
                  isHighlight: true,
                },
              ]
            : []),
          {
            label: 'সর্বমোট প্রাপ্ত বাংলাদেশি টাকা',
            value: `${formatDisplayNumber(totalBdtWithIncentive, digitMode, 2)} ৳`,
            isBold: true,
          },
        ]}
        totalAmountText={`${formatDisplayNumber(totalBdtWithIncentive, digitMode, 2)} টাকা`}
        rawAmount={totalBdtWithIncentive}
        digitMode={digitMode}
        notes="বৈধ ব্যাংকিং চ্যানেলে রেমিট্যান্স পাঠিয়ে বাংলাদেশ সরকারের ২.৫% প্রণোদনা গ্রহণ করুন।"
      />
    </div>
  );
};
