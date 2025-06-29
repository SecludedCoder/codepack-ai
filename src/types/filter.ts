// src/types/filter.ts
export type PresetType = 'all' | 'code' | 'web' | 'docs' | 'config' | 'custom';

export interface FilterPreset {
  name: string;
  value: PresetType;
  extensions: string[];
  excludePatterns: string[];
  description: string;
}

export interface FilterConfig {
  preset?: PresetType;
  includeExtensions: string[];
  excludePatterns: string[];
  maxFileSize: number; // in MB
}