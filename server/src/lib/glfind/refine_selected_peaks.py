import numpy as np
from numpy.typing import NDArray


def refine_selected_peaks(
    baseline_corrected: NDArray[np.floating],
    selected_peaks: NDArray[np.integer],
) -> tuple[NDArray[np.integer], NDArray[np.integer]]:
    """Уточнение местоположения одиночных пиков"""

    lonely_peaks = []
    # Мы не мутируем аргумент, а возвращаем новый массив
    refined_peaks = np.copy(selected_peaks)
    # Проходим по каждому пику в selectedPeakLocations
    for i, peak_idx in enumerate(selected_peaks):
        search_start = peak_idx - 4
        search_end = peak_idx + 4

        # Ищем индекс максимума между текущими границами и его границы
        local_window = baseline_corrected[search_start:search_end + 1]
        local_max_idx = search_start + np.argmax(local_window)

        # Значения слева, справа и в пике
        flank_left = baseline_corrected[local_max_idx - 4]
        flank_right = baseline_corrected[local_max_idx + 4]
        peak_value = baseline_corrected[local_max_idx]

        # Проверяем, если обе точки ниже 90% от основного пика (если обе лежат ниже, значит это отдельный пик, а не часть локальных минимумов)
        if flank_left < 0.93 * peak_value and flank_right < 0.93 * peak_value:
            refined_peaks[i] = local_max_idx  # заменяем на найденный максимум
            lonely_peaks.append(local_max_idx)  # Добавляем в массив standard_pks максимальное значение

    return refined_peaks, np.array(lonely_peaks, dtype=np.int64)
