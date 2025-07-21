/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

export type GenLibRawSignal = number[];
export type SizeStandardRawSignal = number[];

export interface GenLibAnalyzeError {
  state: "error";
  message: string;
}
export interface GenLibAnalyzeResult {
  state: "success";
  t_main: number[];
  denoised_data: number[];
  st_peaks: number[];
  st_length: number[];
  t_unrecognized_peaks: number[];
  unrecognized_peaks: number[];
  lib_length: number[];
  LibPeakLocations: number[];
  t_final_locations: number[];
  final_filtered_below_threshold_locations: number[];
  hpx: number[];
  unr: number[];
  stp: number[];
  mainCorr: number[];
  GLAreas: number[];
  peaksCorr: number[];
  library_peaks: number[];
  areaCorr: number[];
  molarity: number[];
  maxLibPeak: number;
  maxLibValue: number;
  totalLibArea: number;
  totalLibConc: number;
  totalLibMolarity: number;
  x_fill: number[];
  y_fill: number[];
  x_Lib_fill: number[];
  y_Lib_fill: number[];
}
export interface GenLibDescription {
  title: string;
  filename: string;
}
export interface GenLibParseResult {
  description: GenLibDescription;
  signal: GenLibRawSignal;
}
export interface GenLibsAnalyzeInput {
  raw_signals: GenLibRawSignal[];
  size_standard_analyze_peaks: SizeStandardAnalyzePeaks;
}
export interface SizeStandardAnalyzePeaks {
  data: number[];
  sizes: number[];
  concentrations: number[];
}
export interface GenLibsAnalyzeOutput {
  data: (GenLibAnalyzeResult | GenLibAnalyzeError)[];
}
export interface ParseResult {
  id: number | null;
  size_standards: SizeStandardParseResult[];
  gen_libs: GenLibParseResult[];
}
export interface SizeStandardParseResult {
  description: SizeStandardDescription;
  calibration: SizeStandardCalibration;
  signal: SizeStandardRawSignal;
}
export interface SizeStandardDescription {
  title: string;
  filename: string;
}
export interface SizeStandardCalibration {
  sizes: number[];
  concentrations: number[];
  release_times: number[];
}
export interface ParseResultDescription {
  id: number;
  size_standards: SizeStandardDescription[];
  gen_libs: GenLibDescription[];
  created_at: string;
}
export interface SizeStandardAnalyzeError {
  state: "error";
  message: string;
}
export interface SizeStandardAnalyzeInput {
  items: SizeStandardAnalyzeInputItem[];
}
export interface SizeStandardAnalyzeInputItem {
  raw_signal: SizeStandardRawSignal;
  calibration: SizeStandardCalibration;
}
export interface SizeStandardAnalyzeOutput {
  data: (SizeStandardAnalyzeResult | SizeStandardAnalyzeError)[];
}
export interface SizeStandardAnalyzeResult {
  state: "success";
  ZrRef: number[];
  peaks: SizeStandardAnalyzePeaks;
  led_area: number[];
  led_conc: number[];
  SD_molarity: number[];
  liz_fit: number[];
  locs_fit: number[];
}
