from dataclasses import dataclass
from typing import Any
import numpy as np
from numpy.typing import NDArray
from scipy.signal import find_peaks, savgol_filter
from scipy.integrate import quad
from lib.matlab.wden import wden
from lib.matlab.msbackadj import msbackadj


@dataclass
class SDFindResult:
    corrected_signal: NDArray
    peaks: NDArray[np.int64]
    peak_areas: NDArray
    concentrations: NDArray
    molarity: NDArray[np.float64]
    size_fit: NDArray
    peak_fit: NDArray


def sdfind(raw_signal: NDArray, standard_sizes: NDArray, release_times: NDArray, standard_conc: NDArray) -> SDFindResult:
    x = np.arange(len(raw_signal))
    baseline_corrected = msbackadj(x, raw_signal, window_size=140, step_size=40, quantile_value=0.1)  # коррекция бейзлайна
    denoised_signal = wden(baseline_corrected, 'sqtwolog', 's', 'sln', 1, 'sym2')  # фильтр данных

    denoised_flipped = np.flip(denoised_signal)
    matching_peaks_flipped = find_matching_peaks_flipped(denoised_flipped, standard_sizes, release_times)

    if len(matching_peaks_flipped) != len(standard_sizes):
        raise ValueError('Не удалось найти подходящее количество пиков. Проверьте калибровку стандартов длины.')

    peak_areas_flipped = compute_peak_areas_flipped(baseline_corrected, denoised_flipped, matching_peaks_flipped)

    if len(peak_areas_flipped) != len(standard_sizes):
        raise ValueError("Количество рассчитанных площадей не совпадает с количеством калибровочных стандартов.")

    matching_peaks = np.flip(-matching_peaks_flipped + len(baseline_corrected) - 1)
    peak_areas = np.flip(peak_areas_flipped)
    concentrations = peak_areas / (standard_sizes ** 2 / 100)
    molarity = ((np.array(standard_conc) * 1e-3) / (649 * standard_sizes)) * 1e9

    # Подгонка полинома 4-й степени
    poly_coef = np.polyfit(standard_sizes, matching_peaks, 4)
    size_fit = np.linspace(np.min(standard_sizes), np.max(standard_sizes), 100)
    peak_fit = np.polyval(poly_coef, size_fit)

    return SDFindResult(
        corrected_signal=baseline_corrected,
        peaks=matching_peaks,
        peak_areas=peak_areas,
        concentrations=concentrations,
        molarity=molarity,
        size_fit=size_fit,
        peak_fit=peak_fit,
    )


def find_matching_peaks_flipped(denoised_flipped: NDArray[Any], standard_sizes: NDArray[Any], release_times: NDArray[Any]) -> NDArray[np.int64]:
    # Понадобится для отсеивания найденных пиков в соотвествии с выбранным законом
    poly_coef = np.polyfit(standard_sizes, release_times, 4)  # полином 4 степени
    new_sizes = np.polyval(poly_coef, np.flip(standard_sizes))
    size_deltas = np.abs(np.diff(new_sizes))

    overmuch = 2.4  # порог, значение взято из опыта
    threshold = np.quantile(denoised_flipped, 0.995, method='hazen')  # для начала возьмем порог на уровне 99.5%, будем его снижать, если надо

    # *** НАЙДЕМ В СПЕКТРЕ ПИКИ, СООТВЕТВУЮЩИЕ ПИКАМ СТАНДАРТА ***
    for _ in range(30):   # главный цикл (30 попыток)
        # ищем пики, пытаемся среди найденных отобрать подходящие, если не
        # удалось - снижаем порог и повторяем процедуру

        # ** ИЩЕМ ПИКИ В СПЕКТРЕ **
        threshold *= 0.9

        peaks = np.empty(0, dtype=np.int64)
        for _ in range(20):
            peaks = find_peaks(denoised_flipped, height=threshold, distance=9)[0]  # Equal MinPeakDistance=8
            if len(peaks) >= len(standard_sizes):
                break
            threshold *= 0.9

        if len(peaks) >= overmuch * len(standard_sizes):
            break

        #  ОТСЕИВАЕМ ЛИШНИЕ
        for k in range(len(standard_sizes) - 1):
            for j in range(k + 1, len(peaks)):
                base_step = (peaks[j] - peaks[k]) / size_deltas[0]  # кандидат на "базовый шаг"
                step = base_step  # pace - текущий шаг
                filtered_peaks = [0]  # кандидат

                liz_idx, peak_idx, next_pos = 0, 0, 0
                # проверим является ли кандидат на "базовый шаг" настоящим
                while next_pos < peaks[-1] and liz_idx < len(standard_sizes) - 1:
                    prev_pos = peaks[peak_idx]
                    delta = step * size_deltas[liz_idx]
                    next_pos = prev_pos + delta
                    dists = np.abs(peaks - next_pos)
                    nearest_idx = np.argmin(dists)   # индекс ближайшего значения
                    dist = dists[nearest_idx]

                    if dist < delta / 2:  # пик лежит примерно там где и ожидалось
                        peak_idx = int(nearest_idx)
                        filtered_peaks.append(peak_idx)
                        step = (peaks[nearest_idx] - prev_pos) / size_deltas[liz_idx]  # фактический шаг
                        liz_idx += 1
                    else:  # пика в ожидаемом месте нет - возможно начальный пик ложный
                        peak_idx = filtered_peaks[0] + 1  # примем следующий пик за начальный
                        filtered_peaks = [peak_idx]
                        step = base_step
                        liz_idx = 0  # стандарт начнем с начала

                if len(filtered_peaks) == len(standard_sizes):  # нужное количество пиков нашли - выходим из цикла
                    return peaks[filtered_peaks]

    return np.empty(0, dtype=np.int64)


def compute_peak_areas_flipped(baseline_corrected: NDArray, denoised_flipped: NDArray, matching_peaks_flipped: NDArray):
    baseline_corrected_flipped = np.flip(baseline_corrected)

    #  Нахождение минимумов
    smoothed = savgol_filter(denoised_flipped, 3, 1)
    zero_crossings = np.where(np.diff(smoothed > 0))[0]
    local_minima = find_peaks(-smoothed)[0]
    split_points = np.union1d(local_minima, zero_crossings)

    # *** нарисуем что нашли ***
    # строим площади под графиком и считаем их
    peak_areas_flipped = []
    for i in range(len(split_points) - 1):
        # ищем индексы между текущей парой точек
        peaks_between = (matching_peaks_flipped >= split_points[i]) & (matching_peaks_flipped <= split_points[i + 1])
        # считаем количество значений между текущей парой точек
        if np.sum(peaks_between) == 1:
            # Выделим текущую область
            x_range = np.arange(split_points[i], split_points[i + 1] + 1)
            y_range = baseline_corrected_flipped[x_range]

            # Убедимся, что размерности совпадают
            if len(x_range) == len(y_range):
                x_vals = np.arange(len(baseline_corrected_flipped))

                def interp_func(x):
                    return np.interp(x, x_vals, baseline_corrected_flipped, left=0.0, right=0.0)

                area = quad(interp_func, x_range[0], x_range[-1])[0]
                peak_areas_flipped.append(area)

    return peak_areas_flipped
