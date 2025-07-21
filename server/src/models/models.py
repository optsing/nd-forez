from datetime import datetime
from typing import Literal
from pydantic import BaseModel


class SizeStandardDescription(BaseModel):
    title: str
    filename: str


type SizeStandardRawSignal = list[int]


class SizeStandardCalibration(BaseModel):
    sizes: list[float]
    concentrations: list[float]
    release_times: list[int]


class SizeStandardAnalyzePeaks(BaseModel):
    data: list[int]
    sizes: list[float]
    concentrations: list[float]


class SizeStandardAnalyzeResult(BaseModel):
    state: Literal['success']
    ZrRef: list[float]
    peaks: SizeStandardAnalyzePeaks
    led_area: list[float]
    led_conc: list[float]
    SD_molarity: list[float]
    liz_fit: list[float]
    locs_fit: list[float]


class SizeStandardAnalyzeError(BaseModel):
    state: Literal['error']
    message: str


class GenLibDescription(BaseModel):
    title: str
    filename: str


type GenLibRawSignal = list[int]


class GenLibAnalyzeResult(BaseModel):
    state: Literal['success']
    t_main: list[float]
    denoised_data: list[float]
    st_peaks: list[float]
    st_length: list[int]
    t_unrecognized_peaks: list[float]
    unrecognized_peaks: list[float]
    lib_length: list[float]
    LibPeakLocations: list[float]
    t_final_locations: list[float]
    final_filtered_below_threshold_locations: list[float]
    hpx: list[float]
    unr: list[float]
    stp: list[float]
    mainCorr: list[float]
    GLAreas: list[float]
    peaksCorr: list[float]
    library_peaks: list[float]
    areaCorr: list[float]
    molarity: list[float]
    maxLibPeak: float
    maxLibValue: float
    totalLibArea: float
    totalLibConc: float
    totalLibMolarity: float
    x_fill: list[float]
    y_fill: list[float]
    x_Lib_fill: list[float]
    y_Lib_fill: list[float]


class GenLibAnalyzeError(BaseModel):
    state: Literal['error']
    message: str


class SizeStandardParseResult(BaseModel):
    description: SizeStandardDescription
    calibration: SizeStandardCalibration
    signal: SizeStandardRawSignal


class GenLibParseResult(BaseModel):
    description: GenLibDescription
    signal: GenLibRawSignal


class ParseResult(BaseModel):
    id: int | None
    size_standards: list[SizeStandardParseResult]
    gen_libs: list[GenLibParseResult]


class ParseResultDescription(BaseModel):
    id: int
    size_standards: list[SizeStandardDescription]
    gen_libs: list[GenLibDescription]
    created_at: datetime


class SizeStandardAnalyzeInputItem(BaseModel):
    raw_signal: SizeStandardRawSignal
    calibration: SizeStandardCalibration


class SizeStandardAnalyzeInput(BaseModel):
    items: list[SizeStandardAnalyzeInputItem]


class SizeStandardAnalyzeOutput(BaseModel):
    data: list[SizeStandardAnalyzeResult | SizeStandardAnalyzeError]


class GenLibsAnalyzeInput(BaseModel):
    raw_signals: list[GenLibRawSignal]
    size_standard_analyze_peaks: SizeStandardAnalyzePeaks


class GenLibsAnalyzeOutput(BaseModel):
    data: list[GenLibAnalyzeResult | GenLibAnalyzeError]
