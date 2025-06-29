from lib.sdfind import SDFind
from lib.glfind import GLFind

from models.models import SizeStandard, GenLib, AnalyzeResult, AnalyzeResultData


def analyze(size_standard: SizeStandard, gen_libs: list[GenLib]) -> AnalyzeResult:
    [peak, led_area, led_conc, ZrRef, SD_molarity, liz_fit, locs_fit] = SDFind(size_standard.data, size_standard.sizes, size_standard.release_times, size_standard.concentrations)

    results: list[AnalyzeResultData] = []
    for gl_d in gen_libs:
        (
            t_main, denoised_data, st_peaks, st_length, t_unrecognized_peaks, unrecognized_peaks,
            lib_length, lib_peak_locations, t_final_locations, final_filtered_below_threshold_locations,
            hpx, unr, stp, main_corr, gl_areas, peaks_corr, library_peaks, area_corr, molarity,
            max_lib_peak, max_lib_value, total_lib_area, total_lib_conc, total_lib_molarity,
            x_fill, y_fill, x_lib_fill, y_lib_fill
        ) = GLFind(gl_d.data, peak, size_standard.sizes, size_standard.concentrations)
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
        peak=peak.tolist(),
        led_area=led_area.tolist(),
        led_conc=led_conc.tolist(),
        ZrRef=ZrRef.tolist(),
        SD_molarity=SD_molarity.tolist(),
        liz_fit=liz_fit.tolist(),
        locs_fit=locs_fit.tolist(),
        sizes=size_standard.sizes,
        concentrations=size_standard.concentrations,
        genlib_data=results,
    )
