from dataclasses import dataclass
from typing import Any
import numpy as np
from numpy.typing import NDArray
from lib.matlab.msbackadj import msbackadj
from lib.matlab.round import matlab_round
from scipy.signal import savgol_filter, find_peaks
from scipy.integrate import trapezoid, quad


@dataclass
class GLFindResult:
    t_main: NDArray
    corrected_data: NDArray
    st_peaks: NDArray
    st_length: NDArray
    t_unrecognized_peaks: NDArray
    unrecognized_peaks: NDArray
    lib_length: NDArray
    lib_peak_locations: NDArray
    t_final_locations: NDArray
    final_lib_local_minimums: NDArray
    hpx: NDArray
    unr: NDArray
    stp: NDArray
    main_corr: NDArray
    all_areas: NDArray
    all_peaks_corr: NDArray
    all_peaks: NDArray
    all_areas_conc: NDArray
    molarity: NDArray
    max_lib_peak: NDArray
    max_lib_value: NDArray
    total_lib_area: NDArray
    total_lib_conc: NDArray
    total_lib_molarity: NDArray
    x_fill: NDArray
    y_fill: NDArray
    x_lib_fill: NDArray
    y_lib_fill: NDArray


def GLFind(data: NDArray, peak: NDArray[np.int64], sizes: NDArray, concentrations: NDArray) -> GLFindResult:
    # 1. Выбор первых 50 значений как шума
    noise = data[0:50]
    # Вычитание шума из данных
    denoised_data = data - np.mean(noise)

    x = np.arange(len(data))
    corrected_data = msbackadj(x, denoised_data, window_size=140, step_size=300, quantile_value=0.05)  # коррекция бейзлайна

    # 2. Обработка данных
    filtered_data = savgol_filter(corrected_data, 5, 1)
    diff_data = np.diff(filtered_data)
    filtered_diff_data = savgol_filter(diff_data, 5, 1)
    diff_diff_data = np.diff(filtered_diff_data)
    filtered_diff_diff_data = savgol_filter(diff_diff_data, 5, 1)

    flipped_data = -filtered_diff_diff_data
    flipped_data[flipped_data < 0] = 0

    # Нахождение пиков
    peak_locations = find_peaks(flipped_data)[0]
    selected_peaks = corrected_data[peak_locations]
    threshold = np.mean(selected_peaks) / 3  # применили порог: береём среднюю высоту по всем найденным пикам и и делим на 3 (иначе слишком высоко)
    selected_peaks = selected_peaks[selected_peaks >= threshold]  # удалили все пики, которые лежат ниже порога

    selected_peak_locations = np.where(np.isin(corrected_data, selected_peaks))[0]
    selected_peak_locations = selected_peak_locations[
        (selected_peak_locations >= 10) & (selected_peak_locations <= (len(x) - 10))
    ]

    if len(selected_peak_locations) == 0:
        raise ValueError('Пики геномной библиотеки не были найдены')

    lonely_pks, selected_peak_locations = dl_peaks(selected_peak_locations, corrected_data)

    # 3. Нахождение минимумов электрофореграммы
    flip = -corrected_data
    min_peak_locations = find_peaks(flip, distance=9)[0]  # Equal MinPeakDistance=8
    peaks1 = flip[min_peak_locations]

    peaks_threshold = 0.6 * np.mean(flip)

    # Удаление пиков, которые лежат ниже порога
    below_threshold = peaks1 < peaks_threshold
    all_local_minimums = min_peak_locations[below_threshold]  # все минимумы, которые лежат ниже порога (в том числе одиночных пиков)
    min_peak_locations = min_peak_locations[~below_threshold]  # удаляем из массива min_peakLocations все миниуммы, которые лежат ниже порога (оставляем только основные)

    # Объединение найденных пиков и точек пересечения
    crossings2 = np.where(np.diff(corrected_data > 0))[0]

    complete_peaks_locations = np.union1d(min_peak_locations, crossings2)

    # 4. Калибровка данных
    lib_peak_locations = np.array([], dtype=np.int64)
    hidden_lib_peak_locations = np.array([], dtype=np.int64)

    unrecognized_peaks = np.array([], dtype=np.int64)
    pre_unrecognized_peaks = np.array([], dtype=np.int64)

    hidden_lib_areas = np.array([])
    rest_peaks_areas = np.array([])

    final_lib_local_minimums = np.array([])

    st_length = np.array([])
    st_areas = np.array([])

    st_peaks = np.array([peak[0], peak[-1]])
    conc = np.array([concentrations[0], concentrations[-1]])

    sdc = np.polyfit(peak, sizes, 5)
    sdc2 = np.polyfit(sizes, peak, 5)

    for i in range(len(lonely_pks) - 1):
        # Вычисление pace
        pace = st_peaks[1] - st_peaks[0]
        # Инициализация массивов
        st_length = [lonely_pks[0]]  # Инициализируем массив st_length первым значением lonely_pks
        # Базовое значение
        base_value = lonely_pks[0]

        # Поиск пиков
        for i in range(1, len(lonely_pks)):
            # Вычитание базового значения
            distance = lonely_pks[i] - base_value
            # Проверка расстоянияs
            if np.abs(distance - pace) <= 0.2 * pace:  # Используем 20% допуск
                st_length.append(lonely_pks[i])
            else:
                pre_unrecognized_peaks = np.append(pre_unrecognized_peaks, lonely_pks[i])

        if len(lonely_pks) > 1 and len(st_length) < 2:
            st_length = [lonely_pks[0], lonely_pks[-1]]

        if len(st_length) > 2:
            # Создаем массив для хранения площадей
            areas = []

            # Перебираем все значения, начиная со второго
            for i in range(1, len(st_length)):
                # Определяем границы (±7)
                left_idx = st_length[i] - 7
                right_idx = st_length[i] + 7

                # Интегрируем площадь между границами
                area = trapezoid(corrected_data[left_idx:right_idx])

                areas.append(area)

            # Находим индекс наибольшей площади
            max_idx = np.argmax(areas)

            # Выбираем соответствующее значение из st_length
            best_value = st_length[max_idx + 1]  # +1 из-за смещения

            # Обновляем st_length
            st_length = [st_length[0], best_value]

    if len(st_length) != 2:
        # TODO Добавить выбор реперных пиков
        # Мы обрабатывает несколько генных библиотек в одном анализе и для каждой может потребоваться свой выбор
        raise ValueError('Реперные пики не найдены.')

    pre_unrecognized_peaks = np.unique(pre_unrecognized_peaks)
    pre_unrecognized_peaks = pre_unrecognized_peaks[~np.isin(pre_unrecognized_peaks, st_length)]  # если найденный неопознанный пик отнесён к реперному, то он удаляется из массива

    min_st_length = []

    # Проверка минимумов (массив complete_Peaks_Locations): если ближайший минимум дальше, чем 10, то переназначаем все минимумы текущего пика на 7
    for i in range(len(st_length)):
        # Ищем ближайшее значение в массиве complete_Peaks_Locations
        current_value = st_length[i]

        left_candidates = np.max(complete_peaks_locations[complete_peaks_locations < current_value])
        right_candidates = np.min(complete_peaks_locations[complete_peaks_locations > current_value])
        closest_value = [left_candidates, right_candidates]

        idx = np.abs(closest_value - current_value)

        # Проверяем расстояние с двух сторон
        if np.any(idx > 10):
            # Если хотя бы одно расстояние превышает 10, добавляем значения в min_st_length
            min_st_length.append(current_value - 7)
            min_st_length.append(current_value + 7)

    # Объединяем массивы, удаляем дубликаты и сортируем массив
    complete_peaks_locations = np.union1d(complete_peaks_locations, min_st_length)
    # На случай, если репер и неопознанный пик находятся слишком близко (расстояние < 10) - иначе впоследствии программа не понимает,
    # какой минимум между ними должен быть (их минимумы накладываются)
    for i in range(len(st_length)):
        current_value = st_length[i]
        # Поиск значений в pre_unrecognized_peaks, лежащих в пределах [current_st_length - 10, current_st_length + 10]
        nearby_peaks = pre_unrecognized_peaks[(pre_unrecognized_peaks >= (current_value - 10)) & (pre_unrecognized_peaks <= (current_value + 10))]

        for k in range(len(nearby_peaks)):
            # Берем первое найденное значение
            target_peak = nearby_peaks[k]

            # Определение диапазона в denoised_data для поиска минимума
            range_start = min(current_value, target_peak)
            range_end = max(current_value, target_peak)

            # Поиск наименьшего значения в указанном диапазоне и его индекса
            min_index = np.argmin(corrected_data[range_start:range_end + 1])
            min_index += range_start  # Коррекция индекса

            # Удаление значений из complete_Peaks_Locations, лежащих в этом диапазоне
            complete_peaks_locations = complete_peaks_locations[
                (complete_peaks_locations < range_start) | (complete_peaks_locations > range_end)
            ]
            # Добавление найденного индекса в complete_Peaks_Locations
            complete_peaks_locations = np.union1d(complete_peaks_locations, min_index)

    # Удаляем пики, которые лежат за пределами реперов
    selected_peak_locations = selected_peak_locations[(selected_peak_locations >= st_length[0]) & (selected_peak_locations <= st_length[-1])]

    # Этот блок приводит электрофореграмму геномной библиотеки и стандарта
    # длин в одну шкалу (выравнивает по ширине и высоте)
    px = np.polyfit(st_length, st_peaks, 1)  # выравнивание по ширине
    t = np.arange(len(corrected_data))
    t_main = np.polyval(px, t)

    x_fill_1 = np.array([])
    x_lib_fill_1 = np.array([])
    y_fill = np.array([])
    y_lib_fill = np.array([])

    # 5. Обработка данных с учётом калибровки
    # В этом блоке теперь находим и разбиваем все локальные пики по классам: реперные пики, пики геномной библиотеки и неопознанные пики
    for i in range(len(complete_peaks_locations) - 1):
        # Как обычно проверяем наличие локальных максимумов между текущей парой локальных минимумов
        indices_between_peaks = (selected_peak_locations >= complete_peaks_locations[i]) & (selected_peak_locations <= complete_peaks_locations[i + 1])
        # Считаем количество точек, попавших в пару локальных минимумов
        num_points_between_peaks = np.sum(indices_between_peaks)
        if 0 < num_points_between_peaks < 4:
            # Отмечаем пространство между текущими точками
            x_points = complete_peaks_locations[i:i + 2]
            # Для подсчёта площадей
            for j in range(len(x_points) - 1):
                # Выделяем текущую область
                x_range = np.arange(x_points[j], x_points[j + 1] + 1)
                # y_range = denoised_data[x_range]
                # Проверка наличия значений из unrecognized_peaks в x_range
                if np.any(np.isin(x_range, unrecognized_peaks)):  # неопознанный пик
                    unrecognized_peaks = np.append(unrecognized_peaks, pre_unrecognized_peaks[j])
                    # Определяем x-координаты области
                    x_fill_1 = np.linspace(x_range[0], x_range[-1], 100)  # Разбиваем на 100 точек для плавности
                    x_vals = np.arange(len(corrected_data))
                    # Получаем соответствующие y-координаты, используя интерполяцию
                    y_fill = np.interp(x_fill_1, x_vals, corrected_data)
                elif np.any(np.isin(x_range, st_length)):
                    x_vals = np.arange(len(corrected_data))
                    area = quad(lambda x: np.interp(x, x_vals, corrected_data), x_range[0], x_range[-1])[0]  # реперный пик
                    st_areas = np.append(st_areas, area)
        elif num_points_between_peaks >= 4:
            # Найдем максимальное значение denoised_data между текущими точками
            # Получаем индексы для complete_Peaks_Locations
            start_index = complete_peaks_locations[i]
            end_index = complete_peaks_locations[i + 1]
            f = complete_peaks_locations[i + 1]

            # Находим максимальное значение между этими индексами
            max_value_lib = np.max(corrected_data[start_index:end_index + 1])
            max_lib_value = np.where(corrected_data == max_value_lib)[0]
            max_lib_value_corr = np.polyval(sdc, max_lib_value)

            lower_bound = np.polyval(sdc2, max_lib_value_corr - 200)
            upper_bound = np.polyval(sdc2, max_lib_value_corr + 200)

            # Проверяем, лежит ли диапазон внутри [start_index, end_index]
            if lower_bound > start_index or upper_bound < end_index:
                # Если диапазон выходит за пределы, создаем плавный диапазон
                x_lib_fill_1 = np.linspace(start_index, end_index, 100)  # Разбиваем на 100 точек для плавности

                # Интерполируем значения y для x_fill_1
                x_vals = np.arange(len(corrected_data))
                y_lib_fill = np.interp(x_lib_fill_1, x_vals, corrected_data)

            # %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
            final_lib_local_minimums = np.concatenate((final_lib_local_minimums, selected_peak_locations[indices_between_peaks], [f]))  # берём текущую пару точек вместо локальных минимумов (теперь это просто один большой пик ГБ)

            # Ищем локальные максимумы между найденными локальными минимумами final_Lib_local_minimums
            for j in range(len(final_lib_local_minimums) - 1):
                # Ищем индексы массива denoised_data, которые находятся между final_Lib_local_minimums(i) и final_Lib_local_minimums(i+1)
                x_start = final_lib_local_minimums[j]
                x_end = final_lib_local_minimums[j + 1]
                # Находим соответствующие индексы в массиве denoised_data
                indices = np.where((np.arange(len(corrected_data)) >= x_start) & (np.arange(len(corrected_data)) <= x_end))[0]

                if len(indices) > 0:
                    # Находим максимальное значение в массиве denoised_data между этими индексами
                    max_value = np.max(corrected_data[indices])
                    indices_max_value = np.where(corrected_data == max_value)[0]
                    # Добавляем это максимальное значение в LibPeakLocations
                    lib_peak_locations = np.append(lib_peak_locations, indices_max_value)

            lib_peak_locations = np.unique(lib_peak_locations)

            # На случай, если алгоритм посчитал тонкие ГБ (типа фаикс) в качестве большой библиотеки
            diff_values = np.abs(corrected_data[lib_peak_locations.astype(int)] - max_value_lib)  # вычитаем из найденных пиков ГБ максимальный пик

            # Определяем порог 20% от maxLibValue - расстояние (высота) между пиками не должно быть больше, чем 20% от
            # максимального пика: максимум на 100, минимум на 50, расстояние между ними 50 > 20 - это плохо (+1 на следующем шагу);
            # минимум на 90, расстояние 10 < 20 - хорошо (0)
            threshold = 0.2 * max_value_lib

            # Проверяем, какие значения превышают порог и заполняем check_LibPeaks
            check_lib_peaks = diff_values > threshold  # ищем пики, которые расположены слишком низко (ниже, чем 20% от максимального пика): если больше порога, то возвращается 1 (находим их количество)

            # Считаем разницу между длиной LibPeakLocations и количеством "плохих" значений
            diff_count = len(lib_peak_locations) - np.sum(check_lib_peaks)

            # Если больше 50% значений превышают порог, удаляем массивы
            if diff_count < 0.3 * len(lib_peak_locations):
                lib_peak_locations = np.array([], dtype=np.int64)
            else:
                hidden_lib_peak_locations, hidden_lib_areas, _ = hid_fun(
                    corrected_data, start_index, end_index, hidden_lib_areas, max_lib_value
                )
            # %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    # Подсчёт концентраций и молярности по реперам (ГБ будет дальше)
    main_corr = np.polyval(sdc, t_main)
    st_peaks_corr = np.polyval(sdc, st_peaks)

    st_areas = np.array([st_areas[0], st_areas[-1]])
    led_one_area = st_areas / (st_peaks_corr / 100)  # считает корректно, проверено (в Matlab)
    a = np.polyfit(led_one_area, conc, 1)

    st_molarity = ((conc * 1e-3) / (649 * st_peaks_corr)) * 1e9

    # Если ГБ гладкая/фаикс/слишком низкая
    if len(hidden_lib_peak_locations) == 0:
        rest_peaks = np.copy(selected_peak_locations)  # Собираем все найденные пики
        # Удаляем значения из rest_peaks, которые попадают в диапазон реперных пиков
        rest_peaks = rest_peaks[~((rest_peaks >= (st_length[0] - 10)) & (rest_peaks <= (st_length[0] + 10)) | (rest_peaks >= (st_length[1] - 10)) & (rest_peaks <= (st_length[1] + 10)))]

        # Инициализация массива для хранения площадей
        rest_peaks_locations = np.union1d(complete_peaks_locations, all_local_minimums)

        # Проходим по парам пиков
        i = 0
        while i < len(rest_peaks_locations) - 1:
            # Индексы точек между текущей парой пиков
            indices_between_peaks = (rest_peaks >= rest_peaks_locations[i]) & (rest_peaks <= rest_peaks_locations[i + 1])
            # Точки между пиками
            peaks_between = rest_peaks[indices_between_peaks]

            if len(peaks_between) > 1:
                new_peak = np.mean(peaks_between[:2])  # Среднее значение rest_peaks между двумя соседствующими пиками (минимум между двумя текущими значениями)
                rest_peaks_locations = np.union1d(rest_peaks_locations, new_peak) # Добавляем новый минимум: если между текущими минимумами нашли несколько максимумов, добавляем новые минимумы, чтобы разделить эти максимумы
                i -= 1
            elif len(peaks_between) == 1:
                # Определяем границы текущей области
                x_points = rest_peaks_locations[i:i + 2]

                # Рассчитываем площади между пиками
                for j in range(len(x_points) - 1):
                    x_range = np.arange(x_points[j], x_points[j + 1] + 1)

                    # Интегрируем площадь под кривой
                    x_vals = np.arange(len(corrected_data))

                    def interp_func(x):
                        return np.interp(x, x_vals, corrected_data, left=0.0, right=0.0)
                    area = quad(interp_func, x_range[0], x_range[-1])[0]
                    rest_peaks_areas = np.append(rest_peaks_areas, area)

            i += 1

        # Находим индекс наибольшей площади
        max_index = np.argmax(rest_peaks_areas)

        # Записываем соответствующий пик в LibPeakLocations
        lib_peak_locations = np.array([rest_peaks[max_index]])

        # Находим минимумы, которые принадлежат найденному максимому
        start_index = max(rest_peaks_locations[rest_peaks_locations < lib_peak_locations])
        end_index = min(rest_peaks_locations[rest_peaks_locations > lib_peak_locations])

        hidden_lib_peak_locations, hidden_lib_areas, hidden_final_lib_local_minimums = hid_fun(
            corrected_data, start_index, end_index, hidden_lib_areas, lib_peak_locations)

        # Определяем "неопознанные" пики и их площади
        unrecognized_peaks = np.copy(rest_peaks)
        unrec_areas = np.copy(rest_peaks_areas)

        # Удаляем главный пик и его площадь из "неопознанных"
        unrecognized_peaks = np.delete(unrecognized_peaks, max_index)
        unrec_areas = np.delete(unrec_areas, max_index)

        final_lib_local_minimums = np.array([hidden_final_lib_local_minimums[0], hidden_final_lib_local_minimums[-1]])

    hid_lib_length = np.polyval(px, hidden_lib_peak_locations)  # пересчёт по времени
    hid_lib_peaks_corr = np.polyval(sdc, hid_lib_length)

    hid_one_area = hidden_lib_areas / (hid_lib_peaks_corr / 100)  # пересчёт по длине
    hid_one_area_conc = np.polyval(a, hid_one_area)  # находим концентрацию в нг/мкл
    hid_molarity = ((hid_one_area_conc * 1e-3) / (649 * hid_lib_peaks_corr)) * 1e9  # в нмолях/л!

    lib_areas = np.array([])
    lib_one_area = np.array([])
    lib_one_area_conc = np.array([])
    lib_molarity = np.array([])

    # Если ГБ содержит локальные пики и она была идентифицирована как
    # ГБ (был найдет максимум и скрытые пики):
    if len(rest_peaks_areas) == 0:
        # Проверка на то, лежат ли LibPeakLocations в пределах Hidden_LibPeakLocations: если нет, то удаляются
        check_lib_peak_locations = lib_peak_locations[(lib_peak_locations < hidden_lib_peak_locations[0]) | (lib_peak_locations > hidden_lib_peak_locations[-1])]
        # Проверяем, если хотя бы одно значение лежит за границами
        if len(check_lib_peak_locations) > 0:
            # Удаляем все элементы check_LibPeakLocations из LibPeakLocations
            lib_peak_locations = np.setdiff1d(lib_peak_locations, check_lib_peak_locations)
            # Добавляем самое первое значение Hidden_LibPeakLocations в качестве первой границы
            if np.any(check_lib_peak_locations < hidden_lib_peak_locations[0]):
                lib_peak_locations = np.insert(lib_peak_locations, 0, hidden_lib_peak_locations[0])
                left_candidates = max(final_lib_local_minimums[final_lib_local_minimums < lib_peak_locations[0]])
                final_lib_local_minimums = final_lib_local_minimums[final_lib_local_minimums >= left_candidates]
            # Аналогично для второй границы
            if np.any(check_lib_peak_locations > hidden_lib_peak_locations[-1]):
                lib_peak_locations = np.append(lib_peak_locations, hidden_lib_peak_locations[-1])
                right_candidates = min(final_lib_local_minimums[final_lib_local_minimums > lib_peak_locations[-1]])
                final_lib_local_minimums = final_lib_local_minimums[final_lib_local_minimums <= right_candidates]

        # Чистим повторы и сортируем массив
        lib_peak_locations = np.unique(lib_peak_locations)

        # считаем концентрации ГБ
        lib_length = np.polyval(px, lib_peak_locations)
        lib_peaks_corr = np.polyval(sdc, lib_length)

        # Находим индексы элементов LibPeakLocations в Hidden_LibPeakLocations
        # TODO searchsorted не фильтрует отсутствующие элементы! Нужно заменить на правильную реализацию
        indices = np.searchsorted(hidden_lib_peak_locations, lib_peak_locations)

        # Суммируем площади по индексам
        prev_idx = 0
        # Так как Hidden_LibPeakLocations - это куски фрагментов по 1 пн, а LibPeakLocations - это фрагменты, которые были
        # найдены (нужно для визуализации), нам нужно найти концентрацию этих фрагментов: концентрация каждого
        # фрагмента - сумма предыдущего площадей Hidden_LibPeakLocations
        for current_idx in indices:
            lib_areas = np.append(lib_areas, np.sum(hidden_lib_areas[prev_idx:current_idx + 1]))  # площадь
            lib_one_area = np.append(lib_one_area, np.sum(hid_one_area[prev_idx:current_idx + 1]))  # площадь на 1 пн
            lib_one_area_conc = np.append(lib_one_area_conc, np.sum(hid_one_area_conc[prev_idx:current_idx + 1]))  # концентрация
            lib_molarity = np.append(lib_molarity, np.sum(hid_molarity[prev_idx:current_idx + 1]))  # молярность
            prev_idx = current_idx + 1  # Начинаем следующий интервал с нового индекса +1

    #  Если ГБ гладкая/фаикс/слишком низкая (потому что там всего один пик - нет локальных)
    else:
        #  считаем концентрации ГБ
        lib_length = np.polyval(px, lib_peak_locations)
        lib_peaks_corr = np.polyval(sdc, lib_length)

        max_lib_value = lib_peak_locations

        lib_areas = np.append(lib_areas, np.sum(hidden_lib_areas))
        lib_one_area = np.append(lib_one_area, np.sum(hid_one_area))
        lib_one_area_conc = np.append(lib_one_area_conc, np.sum(hid_one_area_conc))
        lib_molarity = np.append(lib_molarity, np.sum(hid_molarity))

    one_area = np.concatenate(([led_one_area[0]], lib_one_area, [led_one_area[-1]]))  # площадь на один фрагмент, не нужен в коде, но может понадобиться для проверки!!!
    all_areas_conc = np.concatenate(([concentrations[0]], lib_one_area_conc, [concentrations[-1]]))  # концентрация
    all_areas = np.concatenate(([st_areas[0]], lib_areas, [st_areas[-1]]))  # общая площадь фрагмента
    molarity = np.concatenate(([st_molarity[0]], lib_molarity, [st_molarity[-1]]))  # молярность

    all_peaks = np.concatenate(([st_length[0]], lib_peak_locations, [st_length[-1]]))  # время выхода
    all_peaks_corr = np.concatenate(([st_peaks_corr[0]], lib_peaks_corr, [st_peaks_corr[-1]]))  # длина в пн

    t_final_locations = np.polyval(px, final_lib_local_minimums)
    t_unrecognized_peaks = np.polyval(px, unrecognized_peaks)  # пересчёт по времени неизвестных пиков
    unrecognized_peaks_corr = np.polyval(sdc, t_unrecognized_peaks)  # только неопознанные пики
    max_lib_peak = main_corr[max_lib_value]  # максимальный пик библиотеки

    total_lib_area = np.sum(lib_areas)
    total_lib_conc = np.sum(lib_one_area_conc)
    total_lib_molarity = np.sum(lib_molarity)

    # Закрашиваем красным ложные пики и широкую библиотеку
    if len(x_fill_1):
        x_fill_1 = np.array([x_fill_1[0], x_fill_1[-1]])
        x_fill_1 = t_main[x_fill_1.astype(int)]
        x_fill = np.linspace(x_fill_1[0], x_fill_1[-1], 100)
    else:
        x_fill = np.array([])

    if len(x_lib_fill_1):
        x_lib_fill_1 = np.array([x_lib_fill_1[0], x_lib_fill_1[-1]])
        x_lib_fill_1 = t_main[x_lib_fill_1.astype(int)]
        x_lib_fill = np.linspace(x_lib_fill_1[0], x_lib_fill_1[-1], 100)
    else:
        x_lib_fill = np.array([])

    hpx = matlab_round(lib_peaks_corr)
    unr = matlab_round(unrecognized_peaks_corr)
    stp = matlab_round([sizes[0], sizes[-1]])

    return GLFindResult(
        t_main=t_main,
        corrected_data=corrected_data,

        st_peaks=st_peaks,
        st_length=st_length,
        stp=stp,

        t_unrecognized_peaks=t_unrecognized_peaks,
        unrecognized_peaks=unrecognized_peaks,
        unr=unr,

        lib_length=lib_length,
        lib_peak_locations=lib_peak_locations,
        hpx=hpx,

        t_final_locations=t_final_locations,
        final_lib_local_minimums=final_lib_local_minimums,
        main_corr=main_corr,

        all_areas=all_areas,
        all_peaks_corr=all_peaks_corr,
        all_peaks=all_peaks,
        all_areas_conc=all_areas_conc,
        molarity=molarity,

        max_lib_peak=max_lib_peak,
        max_lib_value=max_lib_value,
        total_lib_area=total_lib_area,
        total_lib_conc=total_lib_conc,
        total_lib_molarity=total_lib_molarity,

        x_fill=x_fill,
        y_fill=y_fill,

        x_lib_fill=x_lib_fill,
        y_lib_fill=y_lib_fill,
    )


def dl_peaks(selected_peak_locations: NDArray, corrected_data: NDArray) -> tuple[NDArray, NDArray]:
    one_pks = []
    # Мы не мутируем аргумент, а возвращаем новый массив
    new_selected_peak_locations = np.copy(selected_peak_locations)
    # Проходим по каждому пику в selectedPeakLocations
    for i, peak_idx in enumerate(selected_peak_locations):
        left_idx = peak_idx - 4
        right_idx = peak_idx + 4

        # Ищем индекс максимума между текущими границами и его границы
        final_peak_idx = left_idx + np.argmax(corrected_data[left_idx:right_idx])
        final_left_idx = final_peak_idx - 4
        final_right_idx = final_peak_idx + 4

        # Значения в максимуме, слева и справа
        max_value = corrected_data[final_peak_idx]
        left_value = corrected_data[final_left_idx]
        right_value = corrected_data[final_right_idx]

        # Проверяем, если обе точки ниже 90% от основного пика (если обе лежат ниже, значит это отдельный пик, а не часть локальных минимумов)
        if left_value < 0.93 * max_value and right_value < 0.93 * max_value:
            # Добавляем в массив standard_pks максимальное значение
            one_pks.append(final_peak_idx)
            new_selected_peak_locations[i] = final_peak_idx  # заменяем на найденный максимум

    return np.array(one_pks), new_selected_peak_locations


def hid_fun(denoised_data, start_index, end_index, hidden_lib_areas, max_lib_value) -> tuple[Any, Any, Any]:

    median_before_max = np.median(np.arange(start_index, max_lib_value + 1))  # Находим медианное значение между start_index и maxLibValue (левая середина пика ГБ)
    median_after_max = np.median(np.arange(max_lib_value, end_index + 1))  # Находим медианное значение между maxLibValue и end_index (правая середина пика ГБ)

    rounded_before_max = matlab_round(median_before_max)
    rounded_after_max = matlab_round(median_after_max)

    # Создаем массив чисел от первого округленного значения до второго с шагом 1
    hidden_lib_peak_locations = np.arange(rounded_before_max, rounded_after_max + 1)
    hidden_final_lib_local_minimums = np.concatenate(([start_index], hidden_lib_peak_locations))  # все площади

    x_vals = np.arange(len(denoised_data))

    def interp_func(x):
        return np.interp(x, x_vals, denoised_data, left=0.0, right=0.0)

    # ДЛЯ ЗАКРАСКИ И ОБЩЕЙ ПЛОЩАДИ
    for i in range(len(hidden_final_lib_local_minimums) - 1):
        h_x_range1 = np.arange(hidden_final_lib_local_minimums[i], hidden_final_lib_local_minimums[i + 1] + 1)
        # Поиск площади методом Симпсона
        area = quad(interp_func, h_x_range1[0], h_x_range1[-1])[0]
        hidden_lib_areas = np.append(hidden_lib_areas, area)
    return hidden_lib_peak_locations, hidden_lib_areas, hidden_final_lib_local_minimums
