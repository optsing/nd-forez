import numpy as np
from numpy.typing import ArrayLike


def matlab_round(x: ArrayLike) -> np.ndarray | int:
    """
    Rounds input like MATLAB: half values are rounded away from zero.

    Parameters:
        x (ArrayLike): A scalar or array of numbers to round.

    Returns:
        np.ndarray if input is array-like, or a single rounded number.
    """
    x_arr = np.asarray(x)
    result = np.where(x_arr >= 0, np.floor(x_arr + 0.5), np.ceil(x_arr - 0.5))

    # Return scalar if scalar was passed
    if np.isscalar(x):
        return int(result.item())
    return result.astype(int)
