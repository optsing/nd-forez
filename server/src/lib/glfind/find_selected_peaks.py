import numpy as np
from numpy.typing import NDArray
from scipy.signal import find_peaks, savgol_filter


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
