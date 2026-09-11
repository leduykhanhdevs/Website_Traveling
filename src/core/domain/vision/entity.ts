/**
 * Pure Domain Entities for Food & Menu Vision Recognition
 * Zero external frameworks or libraries.
 */

export type ScanMode = 'dish' | 'menu' | 'auto';

export type FoodCategory =
  | 'Món chính'
  | 'Món nước'
  | 'Món nướng'
  | 'Khai vị'
  | 'Đồ uống'
  | 'Tráng miệng'
  | 'Ăn vặt'
  | 'Bánh ngọt';

export interface FoodItem {
  readonly original: string;
  readonly translated: string;
  readonly price: string;
  readonly category: FoodCategory | string;
  readonly confidence: number;
  readonly description?: string;
}

export interface FoodRecognitionResult {
  readonly items: readonly FoodItem[];
  readonly detectedLanguage: string;
  readonly source: string;
  readonly detectedAt: string;
  readonly isLiveCameraSupported: boolean;
}

export interface VisionAnalysisParams {
  readonly image: string; // Base64 data URL
  readonly scanMode: ScanMode;
  readonly categoryHint?: string;
  readonly apiKey?: string;
}
