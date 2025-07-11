import numpy as np
from numpy.typing import NDArray


def refine_lib_peak_locations(
    lib_peak_locations: NDArray[np.integer],
    hidden_lib_peak_locations: NDArray[np.integer],
    final_lib_local_minimums: NDArray[np.integer],
) -> tuple[NDArray[np.integer], NDArray[np.integer]]:
    # Проверка на то, лежат ли LibPeakLocations в пределах Hidden_LibPeakLocations: если нет, то удаляются
    in_bounds_mask = (lib_peak_locations >= hidden_lib_peak_locations[0]) & (lib_peak_locations <= hidden_lib_peak_locations[-1])
    # Удаляем все элементы check_LibPeakLocations из LibPeakLocations
    refined_lib_peaks = lib_peak_locations[in_bounds_mask]

    refined_lib_local_minima = np.copy(final_lib_local_minimums)

    # Добавляем самое первое значение Hidden_LibPeakLocations в качестве первой границы
    left_boundary = hidden_lib_peak_locations[0]
    if np.any(lib_peak_locations < left_boundary):
        refined_lib_peaks = np.insert(refined_lib_peaks, 0, left_boundary)
        left_candidates = max(refined_lib_local_minima[refined_lib_local_minima < left_boundary])
        refined_lib_local_minima = refined_lib_local_minima[refined_lib_local_minima >= left_candidates]

    # Аналогично для второй границы
    right_boundary = hidden_lib_peak_locations[-1]
    if np.any(lib_peak_locations > right_boundary):
        refined_lib_peaks = np.append(refined_lib_peaks, right_boundary)
        right_candidates = min(refined_lib_local_minima[refined_lib_local_minima > right_boundary])
        refined_lib_local_minima = refined_lib_local_minima[refined_lib_local_minima <= right_candidates]

    # Чистим повторы и сортируем массив
    refined_lib_peaks = np.unique(refined_lib_peaks)

    return refined_lib_peaks, refined_lib_local_minima
