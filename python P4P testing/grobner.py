from sympy.abc import x, y, z
import sympy as sp

F = [x**3 + y + z - 1, x + y**2 + z - 1, x + y + z**2 - 1]
G = sp.solve_poly_system([x*y*z - 2.0*y + 2, 2.0*y**6 - x**2 - 1, 3*x*z**4 + 3], x, y, z, strict=True)
print(G)