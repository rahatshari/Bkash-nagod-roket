import React, { useState } from 'react';
import { 
  BookOpen, 
  Trash2, 
  Copy, 
  Check, 
  Coins, 
  Globe2, 
  Scale, 
  FileText, 
  Search,
  Filter
} from 'lucide-react';
import { HistoryRecord, HistoryItemType, DigitMode } from '../types';
import { formatDisplayNumber, soundFx } from '../utils/numberConverter';
import { ReceiptModal } from './ReceiptModal';

interface HistoryViewProps {
  history: HistoryRecord[];
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  digitMode: DigitMode;
  soundEnabled: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onDeleteItem,
  digitMode,
  soundEnabled,
}) => {
  const [filterType, setFilterType] = useState<HistoryItemType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedReceiptItem, setSelectedReceiptItem] = useState<HistoryRecord | null>(null);

  const filteredHistory = history.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyItem = async (item: HistoryRecord) => {
    if (soundEnabled) soundFx.playTap();
    const text = `📋 ${item.title}\n${item.subtitle}\nতারিখ: ${new Date(item.timestamp).toLocaleString('bn-BD')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const getIcon = (type: HistoryItemType) => {
    switch (type) {
      case 'mfs':
        return <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'remittance':
        return <Globe2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'weight':
        return <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  const getBadgeColor = (type: HistoryItemType) => {
    switch (type) {
      case 'mfs':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'remittance':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'weight':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/90 dark:border-slate-800 transition-all">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </span>
              হিসাবের খাতা (সংরক্ষিত হিসাবের ইতিহাস)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              আপনার সম্পন্ন করা ক্যাশ আউট, প্রবাসী রেমিট্যান্স ও ওজনের হিসাবের তালিকা
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('আপনি কি নিশ্চিত যে সমস্ত হিসাবের ইতিহাস মুছে ফেলতে চান?')) {
                  if (soundEnabled) soundFx.playTap();
                  onClearHistory();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition cursor-pointer self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>সব মুছে ফেলুন</span>
            </button>
          )}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'সব হিসাব', count: history.length },
              { id: 'mfs', label: 'ক্যাশ আউট', count: history.filter((h) => h.type === 'mfs').length },
              { id: 'remittance', label: 'রেমিট্যান্স', count: history.filter((h) => h.type === 'remittance').length },
              { id: 'weight', label: 'ওজন ও দাম', count: history.filter((h) => h.type === 'weight').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (soundEnabled) soundFx.playTap();
                  setFilterType(tab.id as HistoryItemType | 'all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  filterType === tab.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] px-1 rounded-md bg-black/10 dark:bg-white/20">
                  {formatDisplayNumber(tab.count, digitMode, 0)}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="হিসাব খুঁজুন..."
              className="w-full text-xs font-medium px-3 py-2 pl-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* List Content */}
        <div className="mt-5 space-y-2.5">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {history.length === 0 ? 'হিসাবের খাতা ফাঁকা' : 'কোন হিসাব পাওয়া যায়নি'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {history.length === 0
                  ? 'ক্যালকুলেটরে হিসাব করার পর "খাতায় সেভ" বাটনে চাপলে এখানে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকবে।'
                  : 'অনুসন্ধানের সাথে মিল রেখে কোনো হিসাব খুঁজে পাওয়া যায়নি।'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xs flex-shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getBadgeColor(item.type)}`}>
                        {item.type === 'mfs' ? 'MFS' : item.type === 'remittance' ? 'রেমিট্যান্স' : 'ওজন'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                      {item.subtitle}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                      {new Date(item.timestamp).toLocaleString('bn-BD', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Item Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={() => handleCopyItem(item)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-700 transition cursor-pointer"
                    title="কপি করুন"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (soundEnabled) soundFx.playTap();
                      setSelectedReceiptItem(item);
                    }}
                    className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer"
                    title="মেমো দেখুন"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (soundEnabled) soundFx.playTap();
                      onDeleteItem(item.id);
                    }}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* History Receipt View Modal */}
      {selectedReceiptItem && (
        <ReceiptModal
          isOpen={!!selectedReceiptItem}
          onClose={() => setSelectedReceiptItem(null)}
          title={selectedReceiptItem.title}
          subtitle={`সংরক্ষিত হিসাব - ${new Date(selectedReceiptItem.timestamp).toLocaleDateString('bn-BD')}`}
          items={[
            { label: 'হিসাবের বিবরণ', value: selectedReceiptItem.subtitle, isBold: true },
            {
              label: 'তারিখ ও সময়',
              value: new Date(selectedReceiptItem.timestamp).toLocaleString('bn-BD'),
            },
          ]}
          totalAmountText={selectedReceiptItem.title}
          rawAmount={0}
          digitMode={digitMode}
          notes="হিসাব বন্ধু অ্যাপের মেমোরিতে অফলাইনে সংরক্ষিত ডেটা।"
        />
      )}
    </div>
  );
};
