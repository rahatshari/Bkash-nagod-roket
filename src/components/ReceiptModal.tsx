import React, { useState } from 'react';
import { X, Printer, Copy, Check, Share2 } from 'lucide-react';
import { DigitMode } from '../types';
import { formatDisplayNumber, amountToBanglaWords, soundFx } from '../utils/numberConverter';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  items: Array<{ label: string; value: string; isBold?: boolean; isHighlight?: boolean }>;
  totalAmountText: string;
  rawAmount: number;
  digitMode: DigitMode;
  notes?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  items,
  totalAmountText,
  rawAmount,
  digitMode,
  notes
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const generateShareText = () => {
    let text = `🧾 *${title}*\n`;
    if (subtitle) text += `📌 ${subtitle}\n`;
    text += `📅 তারিখ: ${dateFormatted} | ${timeFormatted}\n`;
    text += `--------------------------\n`;
    items.forEach((it) => {
      text += `• ${it.label}: ${it.value}\n`;
    });
    text += `--------------------------\n`;
    text += `💰 *সর্বমোট: ${totalAmountText}*\n`;
    text += `🗣️ কথায়: ${amountToBanglaWords(rawAmount)}\n`;
    if (notes) text += `📝 নোট: ${notes}\n`;
    text += `\nহিসাব বন্ধু অ্যাপ দ্বারা প্রস্তুতকৃত।`;
    return text;
  };

  const handleCopy = async () => {
    try {
      soundFx.playTap();
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    soundFx.playTap();
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: generateShareText(),
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handlePrint = () => {
    soundFx.playTap();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 className="font-bold text-slate-800 dark:text-white">ডিজিটাল ক্যাশ মেমো / স্লিপ</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Memo Content */}
        <div className="p-5 overflow-y-auto space-y-4" id="printable-receipt">
          {/* Shop / App Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              তারিখ: {dateFormatted}, সময়: {timeFormatted}
            </p>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-2 text-sm">
            {items.map((it, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between py-1.5 ${
                  it.isHighlight
                    ? 'px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>{it.label}</span>
                <span className={it.isBold ? 'font-bold text-slate-900 dark:text-white' : ''}>
                  {it.value}
                </span>
              </div>
            ))}
          </div>

          {/* Total Box */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                সর্বমোট
              </span>
              <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                {totalAmountText}
              </span>
            </div>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80 mt-1.5 pt-1.5 border-t border-emerald-200/60 dark:border-emerald-800/40">
              কথায়: {amountToBanglaWords(rawAmount)}
            </p>
          </div>

          {notes && (
            <div className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
              নোট: {notes}
            </div>
          )}

          <div className="text-center pt-2 text-[10px] text-slate-400 dark:text-slate-600">
            * হিসাব বন্ধু ডিজিটাল ক্যালকুলেটর দ্বারা সংরক্ষিত *
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>কপি করুন</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition cursor-pointer shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>শেয়ার করুন</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer shadow-xs"
            title="প্রিন্ট করুন"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
