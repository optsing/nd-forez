import numpy as np
from numpy.typing import NDArray


def filter_lonely_peaks(
    corrected_signal: NDArray[np.floating],
    selected_peaks: NDArray[np.integer],
    lonely_peaks: NDArray[np.integer],
) -> NDArray[np.integer]:
    """Удаление одного из двух подряд идущих одиночных пиков, если между ними нет других пиков"""

    filtered_lonely = np.copy(lonely_peaks)

    i = 0
    while i < len(filtered_lonely) - 1:
        current_peak = filtered_lonely[i]
        next_peak = filtered_lonely[i + 1]

        # Проверка: есть ли другие пики между current и next
        in_between = (selected_peaks > current_peak) & (selected_peaks < next_peak)
        if not np.any(in_between):  # если НЕ найдены локальные пики ГБ, значит текующие пики лежат слева или справа от ГБ
            # Границы для текущего и следующего пика
            left1 = max(current_peak - 4, 0)
            right1 = min(current_peak + 4, len(corrected_signal) - 1)
            left2 = max(next_peak - 4, 0)
            right2 = min(next_peak + 4, len(corrected_signal) - 1)

            # Определяем меньшую из площадей и удаляем соответствующий пик
            area1 = np.trapezoid(corrected_signal[left1:right1 + 1])
            area2 = np.trapezoid(corrected_signal[left2:right2 + 1])
            if area1 > area2:
                filtered_lonely = np.delete(filtered_lonely, i + 1)
            else:
                filtered_lonely = np.delete(filtered_lonely, i)
            # Обновляем: начинаем сначала
            i = 0
        else:
            i += 1

    return filtered_lonely
