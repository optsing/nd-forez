from datetime import datetime
from pydantic import BaseModel


class SizeStandardDescription(BaseModel):
    title: str
    filename: str


class SizeStandard(SizeStandardDescription):
    data: list[int]
    sizes: list[float]
    concentrations: list[float]
    release_times: list[int]


class GenLibDescription(BaseModel):
    title: str
    filename: str


class GenLib(GenLibDescription):
    data: list[int]


class ParseResult(BaseModel):
    id: int | None
    size_standards: list[SizeStandard]
    gen_libs: list[GenLib]


class ParseResultDescription(BaseModel):
    id: int
    size_standards: list[SizeStandardDescription]
    gen_libs: list[GenLibDescription]
    created_at: datetime


class AnalyzeResultData(BaseModel):
    title: str
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


class AnalyzeResult(BaseModel):
    title: str
    peak: list[int]
    led_area: list[float]
    led_conc: list[float]
    ZrRef: list[float]
    SD_molarity: list[float]
    liz_fit: list[float]
    locs_fit: list[float]
    sizes: list[float]
    concentrations: list[float]
    genlib_data: list[AnalyzeResultData]


class AnalyzeInput(BaseModel):
    size_standard: SizeStandard
    gen_libs: list[GenLib]
