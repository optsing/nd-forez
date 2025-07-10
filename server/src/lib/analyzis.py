import numpy as np

from lib.sdfind import sdfind
from lib.glfind import GLFind

from models.models import SizeStandard, GenLib, AnalyzeResult, AnalyzeResultData


def analyze(size_standard: SizeStandard, gen_libs: list[GenLib]) -> AnalyzeResult:
    standard_sizes = np.array(size_standard.sizes)
    standard_conc = np.array(size_standard.concentrations)
    sdfind_result = sdfind(
        np.array(size_standard.data),
        standard_sizes,
        np.array(size_standard.release_times),
        standard_conc
    )

    results: list[AnalyzeResultData] = []
    for gl_d in gen_libs:
        glfind_result = GLFind(np.array(gl_d.data), sdfind_result.peaks, standard_sizes, standard_conc)
        results.append(AnalyzeResultData(
            title=gl_d.title,
            t_main=glfind_result.t_main.tolist(),
            denoised_data=glfind_result.corrected_data.tolist(),
            st_peaks=glfind_result.st_peaks.tolist(),
            st_length=list(map(int, glfind_result.st_length)),
            t_unrecognized_peaks=glfind_result.t_unrecognized_peaks.tolist(),
            unrecognized_peaks=glfind_result.unrecognized_peaks.tolist(),
            lib_length=glfind_result.lib_length.tolist(),
            LibPeakLocations=glfind_result.lib_peak_locations.tolist(),
            t_final_locations=glfind_result.t_final_locations.tolist(),
            final_filtered_below_threshold_locations=glfind_result.final_lib_local_minimums.tolist(),
            hpx=glfind_result.hpx.tolist(),
            unr=glfind_result.unr.tolist(),
            stp=glfind_result.stp.tolist(),
            mainCorr=glfind_result.main_corr.tolist(),

            GLAreas=glfind_result.all_areas.tolist(),
            peaksCorr=glfind_result.all_peaks_corr.tolist(),
            library_peaks=glfind_result.all_peaks.tolist(),
            areaCorr=glfind_result.all_areas_conc.tolist(),
            molarity=glfind_result.molarity.tolist(),

            maxLibPeak=float(glfind_result.max_lib_peak[0]),
            maxLibValue=float(glfind_result.max_lib_value[0]),
            totalLibArea=float(glfind_result.total_lib_area),
            totalLibConc=float(glfind_result.total_lib_conc),
            totalLibMolarity=float(glfind_result.total_lib_molarity),

            x_fill=glfind_result.x_fill.tolist(),
            y_fill=glfind_result.y_fill.tolist(),
            x_Lib_fill=glfind_result.x_lib_fill.tolist(),
            y_Lib_fill=glfind_result.y_lib_fill.tolist(),
        ))
    return AnalyzeResult(
        title=size_standard.title,
        peak=sdfind_result.peaks.tolist(),
        led_area=sdfind_result.peak_areas.tolist(),
        led_conc=sdfind_result.concentrations.tolist(),
        ZrRef=sdfind_result.corrected_signal.tolist(),
        SD_molarity=sdfind_result.molarity.tolist(),
        liz_fit=sdfind_result.size_fit.tolist(),
        locs_fit=sdfind_result.peak_fit.tolist(),
        sizes=size_standard.sizes,
        concentrations=size_standard.concentrations,
        genlib_data=results,
    )
