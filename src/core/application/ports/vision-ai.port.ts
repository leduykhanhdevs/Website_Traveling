import type { FoodRecognitionResult, VisionAnalysisParams } from '../../domain/vision/entity';

export interface VisionAiPort {
  readonly providerName: string;
  isAvailable(): Promise<boolean>;
  analyze(params: VisionAnalysisParams): Promise<FoodRecognitionResult>;
}
