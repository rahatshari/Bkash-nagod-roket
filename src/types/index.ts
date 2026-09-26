export type TabType = 'mfs' | 'remittance' | 'weight' | 'history';

export type DigitMode = 'bn' | 'en';

export interface MfsPreset {
  id: string;
  name: string;
  subText: string;
  ratePerThousand: number;
  color: string;
  logoText: string;
}

export interface CurrencyItem {
  code: string;
  nameBn: string;
  nameEn: string;
  currencyNameBn: string;
  currencyNameEn: string;
  symbol: string;
  flag: string;
  defaultRate: number; // 1 unit in BDT
  customRate?: number;
}

export type MfsCalculationMode = 'net_in_hand' | 'from_balance';

export interface MfsResult {
  amount: number;
  ratePerThousand: number;
  fee: number;
  totalWithFee: number;
  netInHand: number;
  mode: MfsCalculationMode;
  providerName: string;
  date: string;
}

export type RemittanceDirection = 'foreign_to_bdt' | 'bdt_to_foreign';

export interface RemittanceResult {
  foreignAmount: number;
  bdtAmount: number;
  exchangeRate: number;
  currencyCode: string;
  currencyName: string;
  countryName: string;
  flag: string;
  includeIncentive: boolean;
  incentivePercent: number;
  incentiveAmount: number;
  totalWithIncentive: number;
  direction: RemittanceDirection;
  date: string;
}

export type WeightCalcMode = 'weight_to_price' | 'price_to_weight';

export type WeightUnit = 'kg_g' | 'total_g' | 'maund' | 'poya' | 'chhatak';

export interface WeightResult {
  pricePerKg: number;
  totalKg: number;
  totalGrams: number;
  totalPrice: number;
  itemGivenPrice?: number;
  itemName?: string;
  mode: WeightCalcMode;
  date: string;
}

export type HistoryItemType = 'mfs' | 'remittance' | 'weight';

export interface HistoryRecord {
  id: string;
  type: HistoryItemType;
  title: string;
  subtitle: string;
  timestamp: number;
  data: MfsResult | RemittanceResult | WeightResult;
}
