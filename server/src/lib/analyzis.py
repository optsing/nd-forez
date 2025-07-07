import numpy as np

from lib.sdfind import SDFind
from lib.glfind import GLFind

from models.models import SizeStandard, GenLib, AnalyzeResult, AnalyzeResultData


def analyze(size_standard: SizeStandard, gen_libs: list[GenLib]) -> AnalyzeResult:
    sdfind_result = SDFind(
        np.array(size_standard.data),
        np.array(size_standard.sizes),
        np.array(size_standard.release_times),
        np.array(size_standard.concentrations)
    )

    results: list[AnalyzeResultData] = []
    for gl_d in gen_libs:
        (
            t_main, denoised_data, st_peaks, st_length, t_unrecognized_peaks, unrecognized_peaks,
            lib_length, lib_peak_locations, t_final_locations, final_filtered_below_threshold_locations,
            hpx, unr, stp, main_corr, gl_areas, peaks_corr, library_peaks, area_corr, molarity,
            max_lib_peak, max_lib_value, total_lib_area, total_lib_conc, total_lib_molarity,
            x_fill, y_fill, x_lib_fill, y_lib_fill
        ) = GLFind(gl_d.data, sdfind_result.selected_peaks, size_standard.sizes, size_standard.concentrations)
        results.append(AnalyzeResultData(
            title=gl_d.title,
            t_main=t_main.tolist(),
            denoised_data=denoised_data.tolist(),
            st_peaks=st_peaks.tolist(),
            st_length=list(map(int, st_length)),
            t_unrecognized_peaks=t_unrecognized_peaks.tolist(),
            unrecognized_peaks=unrecognized_peaks.tolist(),
            lib_length=lib_length.tolist(),
            LibPeakLocations=lib_peak_locations.tolist(),
            t_final_locations=t_final_locations.tolist(),
            final_filtered_below_threshold_locations=final_filtered_below_threshold_locations.tolist(),
            hpx=hpx.tolist(),
            unr=unr.tolist(),
            stp=stp.tolist(),
            mainCorr=main_corr.tolist(),
            GLAreas=gl_areas.tolist(),
            peaksCorr=peaks_corr.tolist(),
            library_peaks=library_peaks.tolist(),
            areaCorr=area_corr.tolist(),
            molarity=molarity.tolist(),

            maxLibPeak=float(max_lib_peak[0]),
            maxLibValue=float(max_lib_value[0]),
            totalLibArea=float(total_lib_area),
            totalLibConc=float(total_lib_conc),
            totalLibMolarity=float(total_lib_molarity),

            x_fill=x_fill.tolist(),
            y_fill=y_fill.tolist(),
            x_Lib_fill=x_lib_fill.tolist(),
            y_Lib_fill=y_lib_fill.tolist(),
        ))
    return AnalyzeResult(
        title=size_standard.title,
        peak=sdfind_result.selected_peaks.tolist(),
        led_area=sdfind_result.led_area.tolist(),
        led_conc=sdfind_result.led_conc.tolist(),
        ZrRef=sdfind_result.corrected_data.tolist(),
        SD_molarity=sdfind_result.sd_molarity.tolist(),
        liz_fit=sdfind_result.liz_fit.tolist(),
        locs_fit=sdfind_result.locs_fit.tolist(),
        sizes=size_standard.sizes,
        concentrations=size_standard.concentrations,
        genlib_data=results,
    )
