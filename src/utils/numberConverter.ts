import { DigitMode } from '../types';

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const enDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function toBnDigits(strOrNum: string | number): string {
  const str = String(strOrNum);
  return str.replace(/[0-9]/g, (match) => bnDigits[parseInt(match, 10)]);
}

export function toEnDigits(strOrNum: string | number): string {
  const str = String(strOrNum);
  let res = str;
  for (let i = 0; i < 10; i++) {
    res = res.replaceAll(bnDigits[i], enDigits[i]);
  }
  return res;
}

export function parseNumberInput(input: string): number {
  if (!input) return 0;
  const enStr = toEnDigits(input).replace(/,/g, '').trim();
  const val = parseFloat(enStr);
  return isNaN(val) ? 0 : val;
}

export function formatNumberWithCommas(num: number, decimals: number = 2): string {
  if (isNaN(num)) return '0';
  const parts = num.toFixed(decimals).split('.');
  // South Asian formatting or standard comma formatting
  const intPart = parts[0];
  const decPart = parts[1];

  // Format integer part with commas (Indian/South Asian style: e.g. 1,00,000 or 3-digit style)
  // Let's use clean 3-digit formatting with comma
  const formattedInt = Number(intPart).toLocaleString('en-US');
  
  // If decimals is 0 or all zeros in decimal part and we don't strictly need them
  if (decimals === 0 || (decPart && parseInt(decPart, 10) === 0 && decimals <= 2)) {
    // If exact integer
    if (Number(decPart) === 0) {
      return formattedInt;
    }
  }

  // Trim trailing zeros in decimal
  const trimmedDec = decPart ? decPart.replace(/0+$/, '') : '';
  if (!trimmedDec) {
    return formattedInt;
  }
  return `${formattedInt}.${trimmedDec}`;
}

export function formatDisplayNumber(
  num: number,
  digitMode: DigitMode = 'bn',
  decimals: number = 2
): string {
  const formatted = formatNumberWithCommas(num, decimals);
  return digitMode === 'bn' ? toBnDigits(formatted) : formatted;
}

// Convert amount to Bengali words (কথায়)
export function amountToBanglaWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'শূন্য টাকা মাত্র';
  const intPart = Math.floor(Math.abs(amount));
  const paisa = Math.round((Math.abs(amount) - intPart) * 100);

  const units = [
    '', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
    'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ',
    'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'ঊনত্রিশ', 'ত্রিশ',
    'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ', 'চল্লিশ',
    'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ', 'পঞ্চাশ',
    'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট', 'ষাট',
    'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর', 'সত্তর',
    'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি', 'আশি',
    'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'ঊননব্বই', 'নব্বই',
    'একানব্বই', 'বানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
  ];

  function convertSmall(n: number): string {
    let result = '';
    if (n >= 100) {
      result += units[Math.floor(n / 100)] + ' শত ';
      n %= 100;
    }
    if (n > 0) {
      result += units[n] + ' ';
    }
    return result.trim();
  }

  let words = '';
  let n = intPart;

  if (n >= 10000000) {
    const crore = Math.floor(n / 10000000);
    words += convertSmall(crore) + ' কোটি ';
    n %= 10000000;
  }
  if (n >= 100000) {
    const lakh = Math.floor(n / 100000);
    words += convertSmall(lakh) + ' লাখ ';
    n %= 100000;
  }
  if (n >= 1000) {
    const thousand = Math.floor(n / 1000);
    words += convertSmall(thousand) + ' হাজার ';
    n %= 1000;
  }
  if (n > 0) {
    words += convertSmall(n);
  }

  words = words.trim() + ' টাকা';

  if (paisa > 0) {
    words += ` ${convertSmall(paisa)} পয়সা`;
  }

  return words.trim() + ' মাত্র';
}

// Subtle Audio Feedback (works completely offline, 0 latency)
class SoundPlayer {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTap() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio not permitted or supported
    }
  }

  playSuccess() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // ignore
    }
  }
}

export const soundFx = new SoundPlayer();
