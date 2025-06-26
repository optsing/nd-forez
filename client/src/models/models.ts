/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

export interface AnalyzeInput {
  size_standart: SizeStandart;
  gen_libs: GenLib[];
}
export interface SizeStandart {
  title: string;
  data: number[];
  sizes: number[];
  concentrations: number[];
  release_times: number[];
}
export interface GenLib {
  title: string;
  data: number[];
}
export interface AnalyzeResult {
  title: string;
  peak: number[];
  led_area: number[];
  led_conc: number[];
  ZrRef: number[];
  SD_molarity: number[];
  liz_fit: number[];
  locs_fit: number[];
  sizes: number[];
  concentrations: number[];
  genlib_data: AnalyzeResultData[];
}
export interface AnalyzeResultData {
  title: string;
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
export interface ParsedData {
  size_standarts: SizeStandart[];
  gen_libs: GenLib[];
}
