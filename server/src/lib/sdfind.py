from dataclasses import dataclass
from typing import Any
import numpy as np
from numpy.typing import NDArray
from scipy.signal import find_peaks, savgol_filter
from scipy.integrate import quad
from lib.matlab.wden import wden
from lib.matlab.msbackadj import msbackadj


def load_matlab_data(filename: str) -> list[float]:
    with open(filename, "r") as f:
        return [float(line.strip()) for line in f if line.strip()]


@dataclass
class SDFindResult:
    corrected_data: NDArray[Any]
    selected_peaks: NDArray[np.int64]
    led_area: NDArray[Any]
    led_conc: NDArray[Any]
    sd_molarity: NDArray[np.float64]
    liz_fit: NDArray[Any]
    locs_fit: NDArray[Any]


def SDFind(data: NDArray[Any], sizes: NDArray[Any], release_times: NDArray[Any], concentrations: NDArray[Any]) -> SDFindResult:
    x = np.arange(len(data))
    corrected_data = msbackadj(x, data, window_size=140, step_size=40, quantile_value=0.1)  # коррекция бейзлайна
    filtered_data = wden(corrected_data, 'sqtwolog', 's', 'sln', 1, 'sym2')  # фильтр данных

    # raw_data_ml = load_matlab_data('raw_data.txt')
    # delta = raw_data - raw_data_ml

    # # Mean Squared Error (MSE)
    # mse = np.mean((delta) ** 2)
    # # Mean Absolute Error (MAE)
    # mae = np.mean(np.abs(delta))
    # # Maximum absolute difference
    # max_diff = np.max(np.abs(delta))
    # # Pearson correlation coefficient
    # corr_coef = np.corrcoef(delta)

    # print(f"MSE: {mse}")
    # print(f"MAE: {mae}")
    # print(f"Max absolute difference: {max_diff}")
    # print(f"Correlation coefficient: {corr_coef}")

    flipped_filtered_data = np.flip(filtered_data)

    flipped_selected_peaks = find_flipped_selected_peaks(flipped_filtered_data, sizes, release_times)

    flipped_areas = []
    if len(flipped_selected_peaks) == len(sizes):
        #  Нахождение минимумов
        filtered_filtered_data = savgol_filter(flipped_filtered_data, 3, 1)
        crossings2 = np.where(np.diff(filtered_filtered_data > 0))[0]
        peak_locs = find_peaks(-filtered_filtered_data)[0]
        crossings = np.union1d(peak_locs, crossings2)

        # *** нарисуем что нашли ***
        # строим площади под графиком и считаем их
        flipped_corrected_data = np.flip(corrected_data)
        for i in range(len(crossings) - 1):
            # ищем индексы между текущей парой точек
            indices_between = (flipped_selected_peaks >= crossings[i]) & (flipped_selected_peaks <= crossings[i + 1])
            # считаем количество значений между текущей парой точек
            if np.sum(indices_between) == 1:
                # Выделим текущую область
                x_range = np.arange(crossings[i], crossings[i + 1] + 1)
                y_range = flipped_corrected_data[x_range]
                # Убедимся, что размерности совпадают
                if len(x_range) == len(y_range):
                    x_vals = np.arange(len(flipped_corrected_data))

                    def interp_func(x):
                        return np.interp(x, x_vals, flipped_corrected_data, left=0.0, right=0.0)
                    area_val = quad(interp_func, x_range[0], x_range[-1])[0]
                    flipped_areas.append(area_val)

    if len(flipped_areas) != len(sizes):
        # TODO Добавить калибровку на стороне клиента
        # Для первой реализации достаточно прервать анализ с просьбой уточнить калибровку
        # Потом можем возвращать особый класс ошибки и форсировать открытие окна калибровки на клиенте
        raise ValueError('Стандарт длин не был найден! Возможно, указанная калибровка не подходит выбранному стандарту длин.')

    selected_peaks = np.flip(-flipped_selected_peaks + len(corrected_data) - 1)
    led_area = np.flip(flipped_areas)
    led_conc = led_area / (sizes ** 2 / 100)
    sd_molarity = ((np.array(concentrations) * 1e-3) / (649 * sizes)) * 1e9

    # Подгонка полинома 4-й степени
    p = np.polyfit(sizes, selected_peaks, 4)
    liz_fit = np.linspace(np.min(sizes), np.max(sizes), 100)
    locs_fit = np.polyval(p, liz_fit)

    return SDFindResult(
        corrected_data=corrected_data,
        selected_peaks=selected_peaks,
        led_area=led_area,
        led_conc=led_conc,
        sd_molarity=sd_molarity,
        liz_fit=liz_fit,
        locs_fit=locs_fit,
    )


def find_flipped_selected_peaks(flipped_filtered_data: NDArray[Any], sizes: NDArray[Any], release_times: NDArray[Any]) -> NDArray[np.int64]:
    # Понадобится для отсеивания найденных пиков в соотвествии с выбранным законом
    poly_coef = np.polyfit(sizes, release_times, 4)  # полином 4 степени
    new_sizes = np.polyval(poly_coef, np.flip(sizes))
    d_sizes = np.abs(np.diff(new_sizes))

    threshold = np.quantile(flipped_filtered_data, 0.995)  # для начала возьмем порог на уровне 99.5%, будем его снижать, если надо

    # *** НАЙДЕМ В СПЕКТРЕ ПИКИ, СООТВЕТВУЮЩИЕ ПИКАМ СТАНДАРТА ***
    for _ in range(30):   # главный цикл (30 попыток)
        # ищем пики, пытаемся среди найденных отобрать подходящие, если не
        # удалось - снижаем порог и повторяем процедуру

        # ** ИЩЕМ ПИКИ В СПЕКТРЕ **
        threshold *= 0.9

        peaks = np.empty(0, dtype=np.int64)
        for _ in range(20):
            peaks = find_peaks(flipped_filtered_data, height=threshold, distance=9)[0]  # Equal MinPeakDistance=8
            if len(peaks) < len(sizes):
                threshold *= 0.9
            else:
                break

        overmuch = 2.4  # порог, значение взято из опыта
        if len(peaks) >= overmuch * len(sizes):
            break

        #  ОТСЕИВАЕМ ЛИШНИЕ
        data_peak_idx = []
        for k in range(len(sizes) - 1):
            for j in range(k + 1, len(peaks)):
                PACE = (peaks[j] - peaks[k]) / d_sizes[0]  # кандидат на "базовый шаг"
                pace = PACE  # pace - текущий шаг
                data_peak_idx = [0]  # кандидат

                i_liz, i_dat, d_next = 0, 0, 0
                # проверим является ли кандидат на "базовый шаг" настоящим
                while d_next < peaks[-1] and i_liz < len(sizes) - 1:
                    d_prev = peaks[i_dat]
                    d_d = pace * d_sizes[i_liz]
                    d_next = d_prev + d_d
                    dst = np.abs(peaks - d_next)
                    idx = np.argmin(dst)   # индекс ближайшего значения
                    minmin = dst[idx]

                    if minmin < d_d / 2:  # пик лежит примерно там где и ожидалось
                        data_peak_idx.append(int(idx))
                        pace = (peaks[idx] - d_prev) / d_sizes[i_liz]  # фактический шаг
                        i_liz += 1
                        i_dat = int(idx)
                    else:  # пика в ожидаемом месте нет - возможно начальный пик ложный
                        i_dat = data_peak_idx[0] + 1  # примем следующий пик за начальный
                        data_peak_idx = [i_dat]
                        pace = PACE
                        i_liz = 0  # стандарт начнем с начала

                if len(data_peak_idx) == len(sizes):  # нужное количество пиков нашли - выходим из цикла
                    return peaks[data_peak_idx]

    return np.empty(0, dtype=np.int64)
