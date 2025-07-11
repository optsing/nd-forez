from lib.matlab.round import matlab_round


import numpy as np
from numpy.typing import NDArray
from scipy.integrate import quad


def compute_hidden_library_area(baseline_corrected: NDArray, start_index, end_index, max_peak_idx) -> tuple[NDArray, NDArray, NDArray]:
    """Вычисление расположения и площади скрытого пика библиотеки"""

    left_median = (start_index + max_peak_idx) / 2  # Находим медианное значение между start_index и maxLibValue (левая середина пика ГБ)
    right_median = (max_peak_idx + end_index) / 2  # Находим медианное значение между maxLibValue и end_index (правая середина пика ГБ)

    left_idx = matlab_round(left_median)
    right_idx = matlab_round(right_median)

    # Создаем массив чисел от первого округленного значения до второго с шагом 1
    library_peak_range = np.arange(left_idx, right_idx + 1)

    # TODO: Почему добавляем индекс начала?
    hidden_final_lib_local_minimums = np.concatenate(([start_index], library_peak_range))  # все площади

    x_vals = np.arange(len(baseline_corrected))

    def interp_func(x):
        return np.interp(x, x_vals, baseline_corrected, left=0.0, right=0.0)

    hidden_lib_areas = []
    # ДЛЯ ЗАКРАСКИ И ОБЩЕЙ ПЛОЩАДИ
    for i in range(len(hidden_final_lib_local_minimums) - 1):
        x_start = hidden_final_lib_local_minimums[i]
        x_end = hidden_final_lib_local_minimums[i + 1]
        # Поиск площади методом Симпсона
        area = quad(interp_func, x_start, x_end)[0]
        hidden_lib_areas.append(area)

    return library_peak_range, np.array(hidden_lib_areas), hidden_final_lib_local_minimums
