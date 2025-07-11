import numpy as np
from numpy.typing import NDArray


def compute_smooth_library_concentrations(
    lib_peak_locations: NDArray,
    px: NDArray,
    sdc: NDArray,
    hidden_lib_areas: NDArray,
    hid_one_area: NDArray,
    hid_one_area_conc: NDArray,
    hid_molarity: NDArray,
) -> tuple[NDArray, NDArray, NDArray, NDArray, NDArray, NDArray]:
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
