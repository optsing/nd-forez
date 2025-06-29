# from lib.glfind import GLFind
# import numpy as np


# def load_matlab_data(filename: str) -> list[float]:
#     with open(filename, "r") as f:
#         return [float(cell.strip()) for cell in f.read().strip().split(',')]
#         # return [float(line.strip()) for line in f if line.strip()]


# denoised_data1 = load_matlab_data('MatlabData/denoised_data1.txt')
# peak = load_matlab_data('MatlabData/peak1.txt')
# sizes = load_matlab_data('MatlabData/sizes1.txt')
# concentrations = load_matlab_data('MatlabData/concentrations1.txt')

# GLFind(np.array(denoised_data1), peak, sizes, concentrations)
