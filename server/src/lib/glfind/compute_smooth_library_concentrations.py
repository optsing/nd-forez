import numpy as np
from numpy.typing import NDArray


def compute_smooth_library_concentrations(
    lib_peak_locations: NDArray[np.integer],
    px: NDArray[np.floating],
    sdc: NDArray[np.floating],
    hidden_lib_areas: NDArray[np.floating],
    hid_one_area: NDArray[np.floating],
    hid_one_area_conc: NDArray[np.floating],
    hid_molarity: NDArray[np.floating],
) -> tuple[
    NDArray[np.floating],
    NDArray[np.floating],
    NDArray[np.floating],
    NDArray[np.floating],
    NDArray[np.floating],
    NDArray[np.floating],
]:
    """Вычисление суммарных характеристик (площадь, концентрацию, молярность) для гладкой геномной библиотеки"""
    #  считаем концентрации ГБ
    lib_length = np.polyval(px, lib_peak_locations)
    lib_peaks_corr = np.polyval(sdc, lib_length)

    lib_areas = np.array([np.sum(hidden_lib_areas)])
    lib_one_area = np.array([np.sum(hid_one_area)])
    lib_one_area_conc = np.array([np.sum(hid_one_area_conc)])
    lib_molarity = np.array([np.sum(hid_molarity)])

    return (
        lib_length,
        lib_peaks_corr,
        lib_areas,
        lib_one_area,
        lib_one_area_conc,
        lib_molarity,
    )
