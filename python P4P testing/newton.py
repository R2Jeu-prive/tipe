import numpy as np
from sympy import *
import math
from scipy import linalg
from sympy.abc import x
import sympy as sp

def findRootNewton(polynomial, var, currentX, iters):
    polynomial_diff = diff(polynomial, var)
    for i in range(iters):
        df_dx_x = polynomial_diff.eval(currentX)
        f_x = polynomial.eval(currentX)
        if(N(df_dx_x) == 0):
            raise Exception("Division by zero")
        d = -f_x/df_dx_x
        if(currentX == currentX + d):
            print(currentX)
            return currentX
        currentX = currentX + d
    raise Exception("Didn't converge in " + str(iters) + " iters")

def TryStartNewton(polynomial, var):
    deg = degree(polynomial, gen=var)
    print(deg)