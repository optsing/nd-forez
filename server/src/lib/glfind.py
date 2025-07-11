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


def glfind(raw_signal: NDArray, standard_peaks: NDArray[np.int64], standard_sizes: NDArray, standard_conc: NDArray) -> GLFindResult:
    # 1. Выбор первых 50 значений как шума
    noise = raw_signal[:50]
    # Вычитание шума из данных
    denoised_signal = raw_signal - np.mean(noise)
    x = np.arange(len(raw_signal))
    baseline_corrected = msbackadj(x, denoised_signal, window_size=140, step_size=300, quantile_value=0.05)  # коррекция бейзлайна

    selected_peak_locations = find_selected_peaks(baseline_corrected)

    if len(selected_peak_locations) == 0:
        raise ValueError('Пики геномной библиотеки не были найдены')

    selected_peak_locations, lonely_pks = refine_selected_peaks(baseline_corrected, selected_peak_locations)

    # Вычисление pace
    pace: np.int64 = standard_peaks[-1] - standard_peaks[0]
    reference_peaks, pre_unrecognized_peaks = find_reference_peaks(baseline_corrected, lonely_pks, pace)

    if len(reference_peaks) != 2:
        # TODO Добавить выбор реперных пиков
        # Мы обрабатывает несколько генных библиотек в одном анализе и для каждой может потребоваться свой выбор
        raise ValueError('Реперные пики не найдены.')

    # Удаляем пики, которые лежат за пределами реперов
    selected_peak_locations = selected_peak_locations[(selected_peak_locations >= reference_peaks[0]) & (selected_peak_locations <= reference_peaks[-1])]

    minima_candidates, all_local_minimums = find_signal_minima(baseline_corrected)

    complete_peaks_locations = refine_minima_near_reference_peaks(baseline_corrected, reference_peaks, pre_unrecognized_peaks, minima_candidates)

    # 4. Калибровка данных
    sdc = np.polyfit(standard_peaks, standard_sizes, 5)  # калибровка по стандарту
    sdc2 = np.polyfit(standard_sizes, standard_peaks, 5)  # калибровка в обратную сторону для проверки соотвествия границ

    # 5. Обработка данных с учётом калибровки
    # В этом блоке теперь находим и разбиваем все локальные пики по классам: реперные пики, пики геномной библиотеки и неопознанные пики
    is_smooth = False
    (
        lib_peak_locations,
        hidden_lib_peak_locations,
        hidden_lib_areas,
        final_lib_local_minimums,
        unrecognized_peaks,
        max_lib_value,

        st_areas,
        x_fill_1,
        x_lib_fill_1,
        y_fill,
        y_lib_fill,
    ) = classify_and_extract_library_peaks(
        baseline_corrected,
        selected_peak_locations,
        reference_peaks,
        complete_peaks_locations,
        pre_unrecognized_peaks,
        sdc,
        sdc2,
    )
    # Если ГБ гладкая/фаикс/слишком низкая
    if len(hidden_lib_peak_locations) == 0:
        is_smooth = True
        (
            lib_peak_locations,
            hidden_lib_peak_locations,
            new_hidden_lib_areas,
            final_lib_local_minimums,
            unrecognized_peaks,
            max_lib_value,
        ) = handle_smooth_library_case(
            baseline_corrected,
            selected_peak_locations,
            reference_peaks,
            complete_peaks_locations,
            all_local_minimums,
        )
        hidden_lib_areas = np.append(hidden_lib_areas, new_hidden_lib_areas)

    # Этот блок приводит электрофореграмму геномной библиотеки и стандарта
    # длин в одну шкалу (выравнивает по ширине и высоте)
    st_peaks = np.array([standard_peaks[0], standard_peaks[-1]])
    px = np.polyfit(reference_peaks, st_peaks, 1)  # выравнивание по ширине
    t = np.arange(len(baseline_corrected))
    t_main = np.polyval(px, t)

    # Подсчёт концентраций и молярности по реперам (ГБ будет дальше)
    main_corr = np.polyval(sdc, t_main)
    st_peaks_corr = np.polyval(sdc, st_peaks)

    st_areas = np.array([st_areas[0], st_areas[-1]])
    conc = np.array([standard_conc[0], standard_conc[-1]])

    led_one_area = st_areas / (st_peaks_corr / 100)  # считает корректно, проверено (в Matlab)
    a = np.polyfit(led_one_area, conc, 1)

    st_molarity = ((conc * 1e-3) / (649 * st_peaks_corr)) * 1e9

    hid_lib_length = np.polyval(px, hidden_lib_peak_locations)  # пересчёт по времени
    hid_lib_peaks_corr = np.polyval(sdc, hid_lib_length)

    hid_one_area = hidden_lib_areas / (hid_lib_peaks_corr / 100)  # пересчёт по длине
    hid_one_area_conc = np.polyval(a, hid_one_area)  # находим концентрацию в нг/мкл
    hid_molarity = ((hid_one_area_conc * 1e-3) / (649 * hid_lib_peaks_corr)) * 1e9  # в нмолях/л!

    #  Если ГБ гладкая/фаикс/слишком низкая (потому что там всего один пик - нет локальных)
    if is_smooth:
        (
            lib_length,
            lib_peaks_corr,
            lib_areas,
            lib_one_area,
            lib_one_area_conc,
            lib_molarity,
        ) = compute_smooth_library_concentrations(
            lib_peak_locations,
            px,
            sdc,
            hidden_lib_areas,
            hid_one_area,
            hid_one_area_conc,
            hid_molarity,
        )
    # Если ГБ содержит локальные пики и она была идентифицирована как ГБ (был найдет максимум и скрытые пики):
    else:
        (
            lib_length,
            lib_peaks_corr,
            lib_areas,
            lib_one_area,
            lib_one_area_conc,
            lib_molarity,
        ) = compute_fragmented_library_concentrations(
            lib_peak_locations,
            hidden_lib_peak_locations,
            final_lib_local_minimums,
            px,
            sdc,
            hidden_lib_areas,
            hid_one_area,
            hid_one_area_conc,
            hid_molarity,
        )

    # one_area = np.concatenate(([led_one_area[0]], lib_one_area, [led_one_area[-1]]))  # площадь на один фрагмент, не нужен в коде, но может понадобиться для проверки!!!
    all_areas_conc = np.concatenate(([standard_conc[0]], lib_one_area_conc, [standard_conc[-1]]))  # концентрация
    all_areas = np.concatenate(([st_areas[0]], lib_areas, [st_areas[-1]]))  # общая площадь фрагмента
    molarity = np.concatenate(([st_molarity[0]], lib_molarity, [st_molarity[-1]]))  # молярность

    all_peaks = np.concatenate(([reference_peaks[0]], lib_peak_locations, [reference_peaks[-1]]))  # время выхода
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
        x_fill = np.empty(0)

    if len(x_lib_fill_1):
        x_lib_fill_1 = np.array([x_lib_fill_1[0], x_lib_fill_1[-1]])
        x_lib_fill_1 = t_main[x_lib_fill_1.astype(int)]
        x_lib_fill = np.linspace(x_lib_fill_1[0], x_lib_fill_1[-1], 100)
    else:
        x_lib_fill = np.empty(0)

    hpx = matlab_round(lib_peaks_corr)
    unr = matlab_round(unrecognized_peaks_corr)
    stp = matlab_round([standard_sizes[0], standard_sizes[-1]])

    return GLFindResult(
        t_main=t_main,
        corrected_data=baseline_corrected,

        st_peaks=st_peaks,
        st_length=reference_peaks,
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


def find_selected_peaks(baseline_corrected: NDArray):
    """Обнаружение значимых пиков"""

    smoothed = savgol_filter(baseline_corrected, 5, 1)
    first_derivative = np.diff(smoothed)
    first_derivative_smoothed = savgol_filter(first_derivative, 5, 1)
    second_derivative = np.diff(first_derivative_smoothed)
    second_derivative_smoothed = savgol_filter(second_derivative, 5, 1)

    peak_candidate_signal = -second_derivative_smoothed
    peak_candidate_signal[peak_candidate_signal < 0] = 0

    # Нахождение пиков
    peak_indices = find_peaks(peak_candidate_signal)[0]
    peak_heights = baseline_corrected[peak_indices]

    threshold = np.mean(peak_heights) / 3  # применили порог: берём среднюю высоту по всем найденным пикам и и делим на 3 (иначе слишком высоко)
    significant_peak_mask = peak_heights >= threshold
    significant_peak_indices = peak_indices[significant_peak_mask]  # удалили все пики, которые лежат ниже порога

    selected_peaks = significant_peak_indices[
        (significant_peak_indices >= 10) & (significant_peak_indices <= (len(baseline_corrected) - 10))
    ]

    return selected_peaks


def refine_selected_peaks(baseline_corrected: NDArray, selected_peaks: NDArray) -> tuple[NDArray, NDArray]:
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

    return refined_peaks, np.array(lonely_peaks)


def find_signal_minima(baseline_corrected: NDArray) -> tuple[NDArray, NDArray]:
    """Нахождение минимумов электрофореграммы"""

    inverted_signal = -baseline_corrected
    strong_minima_indices = find_peaks(inverted_signal, distance=9)[0]  # Equal MinPeakDistance=8
    minima_heights = inverted_signal[strong_minima_indices]

    threshold = 0.6 * np.mean(inverted_signal)

    # Удаление пиков, которые лежат ниже порога
    weak_minima_mask = minima_heights < threshold
    weak_minima_indices = strong_minima_indices[weak_minima_mask]  # все минимумы, которые лежат ниже порога (в том числе одиночных пиков)
    strong_minima_indices = strong_minima_indices[~weak_minima_mask]  # удаляем из массива min_peakLocations все миниуммы, которые лежат ниже порога (оставляем только основные)

    # Объединение найденных пиков и точек пересечения
    zero_crossings = np.where(np.diff(baseline_corrected > 0))[0]
    combined_minima = np.union1d(strong_minima_indices, zero_crossings)

    return combined_minima, weak_minima_indices


def refine_minima_near_reference_peaks(baseline_corrected: NDArray, reference_peaks: NDArray, unrecognized_peaks: NDArray, minima_candidates: NDArray) -> NDArray:
    """Уточнение списка минимумов, проверяя расстояние от реперных пиков до ближайших минимумов"""

    additional_minima = []

    # Проверка минимумов (массив complete_Peaks_Locations): если ближайший минимум дальше, чем 10, то переназначаем все минимумы текущего пика на 7
    for ref_idx in reference_peaks:
        # Ищем ближайшее значение в массиве complete_Peaks_Locations
        left = np.max(minima_candidates[minima_candidates < ref_idx])
        right = np.min(minima_candidates[minima_candidates > ref_idx])
        closest_value = [left, right]

        idx = np.abs(closest_value - ref_idx)

        # Проверяем расстояние с двух сторон
        if np.any(idx > 10):
            # Если хотя бы одно расстояние превышает 10, добавляем значения в min_st_length
            additional_minima.append(ref_idx - 7)
            additional_minima.append(ref_idx + 7)

    # Объединяем массивы, удаляем дубликаты и сортируем массив
    refined_minima = np.union1d(minima_candidates, additional_minima)

    # На случай, если репер и неопознанный пик находятся слишком близко (расстояние < 10) - иначе впоследствии программа не понимает,
    # какой минимум между ними должен быть (их минимумы накладываются)
    for ref_idx in reference_peaks:
        # Поиск значений в pre_unrecognized_peaks, лежащих в пределах [current_st_length - 10, current_st_length + 10]
        close_unrecognized = unrecognized_peaks[(unrecognized_peaks >= (ref_idx - 10)) & (unrecognized_peaks <= (ref_idx + 10))]

        for unrec_idx in close_unrecognized:
            # Определение диапазона в denoised_data для поиска минимума
            start = min(ref_idx, unrec_idx)
            end = max(ref_idx, unrec_idx)

            # Поиск наименьшего значения в указанном диапазоне и его индекса
            min_idx = start + np.argmin(baseline_corrected[start:end + 1])

            # Удаление значений из complete_Peaks_Locations, лежащих в этом диапазоне
            refined_minima = refined_minima[
                (refined_minima < start) | (refined_minima > end)
            ]
            # Добавление найденного индекса в complete_Peaks_Locations
            refined_minima = np.union1d(refined_minima, min_idx)

    return refined_minima


def find_reference_peaks(baseline_corrected: NDArray, candidate_peaks: NDArray, expected_spacing: np.int64) -> tuple[NDArray, NDArray]:
    """Нахождение двух реперных пиков на основе ожидаемого расстояния между ними"""

    if len(candidate_peaks) < 2:
        return np.empty(0, dtype=np.int64), np.empty(0, dtype=np.int64)

    start_peak_idx = candidate_peaks[0]
    recognized_peaks = []
    rejected_peaks = []

    # Поиск второго пика
    for cur_peak_idx in candidate_peaks[1:]:
        # Вычитание базового значения
        distance = cur_peak_idx - start_peak_idx
        # Проверка расстоянияs
        if np.abs(distance - expected_spacing) <= 0.2 * expected_spacing:  # Используем 20% допуск
            recognized_peaks.append(cur_peak_idx)
        else:
            rejected_peaks.append(cur_peak_idx)

    if len(recognized_peaks) == 0:
        end_peak = candidate_peaks[-1]
    elif len(recognized_peaks) == 1:
        end_peak = recognized_peaks[0]
    else:
        # Создаем массив для хранения площадей
        areas = []

        # Перебираем все значения, начиная со второго
        for peak_idx in recognized_peaks:
            # Определяем границы (±7)
            left_idx = peak_idx - 7
            right_idx = peak_idx + 7

            # Интегрируем площадь между границами
            area = trapezoid(baseline_corrected[left_idx:right_idx + 1])
            areas.append(area)

        # Находим индекс наибольшей площади
        max_area_idx = np.argmax(areas)
        # Выбираем как второй реперный пик
        end_peak = recognized_peaks[max_area_idx]

    return np.array([start_peak_idx, end_peak]), np.array(rejected_peaks)


def classify_and_extract_library_peaks(
    baseline_corrected: NDArray,
    selected_peak_locations: NDArray,
    reference_peaks: NDArray,
    complete_peaks_locations: NDArray,
    pre_unrecognized_peaks: NDArray,
    sdc: NDArray,
    sdc2: NDArray,
) -> tuple[NDArray, NDArray, NDArray, NDArray, NDArray, NDArray, NDArray, NDArray, NDArray, NDArray, NDArray]:
    """Обработка данных с учётом калибровки: классификация пиков и извлечение информации о библиотеке"""

    lib_peak_locations = np.empty(0, dtype=np.int64)
    hidden_lib_peak_locations = np.empty(0, dtype=np.int64)
    unrecognized_peaks = np.empty(0, dtype=np.int64)
    hidden_lib_areas = np.empty(0)
    final_lib_local_minimums = np.empty(0)
    x_fill_1 = np.empty(0)
    x_lib_fill_1 = np.empty(0)
    y_fill = np.empty(0)
    y_lib_fill = np.empty(0)
    st_areas = np.empty(0)

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
                    x_vals = np.arange(len(baseline_corrected))
                    # Получаем соответствующие y-координаты, используя интерполяцию
                    y_fill = np.interp(x_fill_1, x_vals, baseline_corrected)
                elif np.any(np.isin(x_range, reference_peaks)):
                    x_vals = np.arange(len(baseline_corrected))
                    area = quad(lambda x: np.interp(x, x_vals, baseline_corrected), x_range[0], x_range[-1])[0]  # реперный пик
                    st_areas = np.append(st_areas, area)
        elif num_points_between_peaks >= 4:
            # Найдем максимальное значение denoised_data между текущими точками
            # Получаем индексы для complete_Peaks_Locations
            start_index = complete_peaks_locations[i]
            end_index = complete_peaks_locations[i + 1]
            f = complete_peaks_locations[i + 1]

            # Находим максимальное значение между этими индексами
            max_value_lib = np.max(baseline_corrected[start_index:end_index + 1])
            max_lib_value = np.where(baseline_corrected == max_value_lib)[0]
            max_lib_value_corr = np.polyval(sdc, max_lib_value)

            lower_bound = np.polyval(sdc2, max_lib_value_corr - 200)
            upper_bound = np.polyval(sdc2, max_lib_value_corr + 200)

            # Проверяем, лежит ли диапазон внутри [start_index, end_index]
            if lower_bound > start_index or upper_bound < end_index:
                # Если диапазон выходит за пределы, создаем плавный диапазон
                x_lib_fill_1 = np.linspace(start_index, end_index, 100)  # Разбиваем на 100 точек для плавности

                # Интерполируем значения y для x_fill_1
                x_vals = np.arange(len(baseline_corrected))
                y_lib_fill = np.interp(x_lib_fill_1, x_vals, baseline_corrected)

            # %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
            final_lib_local_minimums = np.concatenate((final_lib_local_minimums, selected_peak_locations[indices_between_peaks], [f]))  # берём текущую пару точек вместо локальных минимумов (теперь это просто один большой пик ГБ)

            # Ищем локальные максимумы между найденными локальными минимумами final_Lib_local_minimums
            for j in range(len(final_lib_local_minimums) - 1):
                # Ищем индексы массива denoised_data, которые находятся между final_Lib_local_minimums(i) и final_Lib_local_minimums(i+1)
                x_start = final_lib_local_minimums[j]
                x_end = final_lib_local_minimums[j + 1]
                # Находим соответствующие индексы в массиве denoised_data
                indices = np.where((np.arange(len(baseline_corrected)) >= x_start) & (np.arange(len(baseline_corrected)) <= x_end))[0]

                if len(indices) > 0:
                    # Находим максимальное значение в массиве denoised_data между этими индексами
                    max_value = np.max(baseline_corrected[indices])
                    indices_max_value = np.where(baseline_corrected == max_value)[0]
                    # Добавляем это максимальное значение в LibPeakLocations
                    lib_peak_locations = np.append(lib_peak_locations, indices_max_value)

            lib_peak_locations = np.unique(lib_peak_locations)

            # На случай, если алгоритм посчитал тонкие ГБ (типа фаикс) в качестве большой библиотеки
            diff_values = np.abs(baseline_corrected[lib_peak_locations.astype(int)] - max_value_lib)  # вычитаем из найденных пиков ГБ максимальный пик

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
                lib_peak_locations = np.empty(0, dtype=np.int64)
            else:
                hidden_lib_peak_locations, new_hidden_lib_areas, _ = compute_hidden_library_area(
                    baseline_corrected, start_index, end_index, max_lib_value
                )
                hidden_lib_areas = np.append(hidden_lib_areas, new_hidden_lib_areas)
            # %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    return (
        lib_peak_locations,
        hidden_lib_peak_locations,
        hidden_lib_areas,
        final_lib_local_minimums,
        unrecognized_peaks,
        max_lib_value,
        st_areas,
        x_fill_1,
        x_lib_fill_1,
        y_fill,
        y_lib_fill,
    )


def handle_smooth_library_case(
    baseline_corrected: NDArray,
    selected_peak_locations: NDArray,
    reference_peaks: NDArray,
    complete_peaks_locations: NDArray,
    all_local_minimums: NDArray,
) -> tuple[NDArray, NDArray, NDArray, NDArray, NDArray, Any]:
    """Обработка случая, когда геномная библиотека гладкая или содержит один невыраженный пик"""
    rest_peaks_areas = np.empty(0)
    rest_peaks = np.copy(selected_peak_locations)  # Собираем все найденные пики
    # Удаляем значения из rest_peaks, которые попадают в диапазон реперных пиков
    rest_peaks = rest_peaks[~((rest_peaks >= (reference_peaks[0] - 10)) & (rest_peaks <= (reference_peaks[0] + 10)) | (rest_peaks >= (reference_peaks[1] - 10)) & (rest_peaks <= (reference_peaks[1] + 10)))]

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
            rest_peaks_locations = np.union1d(rest_peaks_locations, new_peak)  # Добавляем новый минимум: если между текущими минимумами нашли несколько максимумов, добавляем новые минимумы, чтобы разделить эти максимумы
            i -= 1
        elif len(peaks_between) == 1:
            # Определяем границы текущей области
            x_points = rest_peaks_locations[i:i + 2]

            # Рассчитываем площади между пиками
            for j in range(len(x_points) - 1):
                x_range = np.arange(x_points[j], x_points[j + 1] + 1)

                # Интегрируем площадь под кривой
                x_vals = np.arange(len(baseline_corrected))

                def interp_func(x):
                    return np.interp(x, x_vals, baseline_corrected, left=0.0, right=0.0)
                area = quad(interp_func, x_range[0], x_range[-1])[0]
                rest_peaks_areas = np.append(rest_peaks_areas, area)

        i += 1

    # Находим индекс наибольшей площади
    max_index = np.argmax(rest_peaks_areas)
    max_lib_value = rest_peaks[max_index]

    # Записываем соответствующий пик в LibPeakLocations
    lib_peak_locations = np.array([max_lib_value])

    # Находим минимумы, которые принадлежат найденному максимому
    start_index = max(rest_peaks_locations[rest_peaks_locations < lib_peak_locations])
    end_index = min(rest_peaks_locations[rest_peaks_locations > lib_peak_locations])

    hidden_lib_peak_locations, new_hidden_lib_areas, hidden_final_lib_local_minimums = compute_hidden_library_area(
        baseline_corrected, start_index, end_index, max_lib_value)

    # Определяем "неопознанные" пики и их площади
    unrecognized_peaks = np.copy(rest_peaks)

    # Удаляем главный пик и его площадь из "неопознанных"
    unrecognized_peaks = np.delete(unrecognized_peaks, max_index)

    final_lib_local_minimums = np.array([hidden_final_lib_local_minimums[0], hidden_final_lib_local_minimums[-1]])

    return (
        lib_peak_locations,
        hidden_lib_peak_locations,
        new_hidden_lib_areas,
        final_lib_local_minimums,
        unrecognized_peaks,
        max_lib_value,
    )


def compute_fragmented_library_concentrations(
    lib_peak_locations: NDArray,
    hidden_lib_peak_locations: NDArray,
    final_lib_local_minimums: NDArray,
    px: NDArray,
    sdc: NDArray,
    hidden_lib_areas: NDArray,
    hid_one_area: NDArray,
    hid_one_area_conc: NDArray,
    hid_molarity: NDArray,
) -> tuple[NDArray, NDArray, NDArray, NDArray, NDArray, NDArray]:
    """Вычисление суммарных характеристик (площадь, концентрацию, молярность) для библиотеки с выраженными локальными пиками"""
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
    lib_areas = np.empty(0)
    lib_one_area = np.empty(0)
    lib_one_area_conc = np.empty(0)
    lib_molarity = np.empty(0)
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

    return (
        lib_length,
        lib_peaks_corr,
        lib_areas,
        lib_one_area,
        lib_one_area_conc,
        lib_molarity,
    )


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
