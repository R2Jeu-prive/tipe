import numpy as np
from sympy import poly
import math
from scipy import linalg
from sympy.abc import w, b, k
import sympy as sp
import math

from newton import *

#DATA
frame = 5339
U1 = np.array([[605/810],[50/810],[1]])
U2 = np.array([[172/810],[-84/810],[1]])
U3 = np.array([[-596/810],[-24/810],[1]])
U4 = np.array([[-533/810],[-187/810],[1]])
X1 = np.array([[9807],[21986],[0],[1]])
X2 = np.array([[9820.5],[22052.5],[0],[1]])
X3 = np.array([[9909],[22030.5],[0],[1]])
X4 = np.array([[9968.5],[22308.5],[0],[1]])
u = [U1[0][0], U2[0][0], U3[0][0], U4[0][0]]
v = [U1[1][0], U2[1][0], U3[1][0], U4[1][0]]
x = [X1[0][0], X2[0][0], X3[0][0], X4[0][0]]
y = [X1[1][0], X2[1][0], X3[1][0], X4[1][0]]
z = [X1[2][0], X2[2][0], X3[2][0], X4[2][0]]


M = np.array([[-v[0]*x[0], -v[0]*y[0], -v[0], u[0]*x[0], u[0]*y[0], u[0]],
              [-v[1]*x[1], -v[1]*y[1], -v[1], u[1]*x[1], u[1]*y[1], u[1]],
              [-v[2]*x[2], -v[2]*y[2], -v[2], u[2]*x[2], u[2]*y[2], u[2]],
              [-v[3]*x[3], -v[3]*y[3], -v[3], u[3]*x[3], u[3]*y[3], u[3]]])

n0 = linalg.null_space(M)
n1 = n0[:,[0]]
n2 = n0[:,[1]]

print(n1)
print(n2)

C = np.array([[u[0]*x[0], u[0]*y[0], u[0]],
              [u[1]*x[1], u[1]*y[1], u[1]],
              [u[2]*x[2], u[2]*y[2], u[2]]])

invC = np.linalg.inv(C)

A1 = np.array([x[0],y[0],1,0,0,0])
A2 = np.array([x[1],y[1],1,0,0,0])
A3 = np.array([x[2],y[2],1,0,0,0])
A4 = np.array([x[3],y[3],1,0,0,0])
A1n1 = np.matmul(A1, n1)[0]
A1n2 = np.matmul(A1, n2)[0]
A2n1 = np.matmul(A2, n1)[0]
A2n2 = np.matmul(A2, n2)[0]
A3n1 = np.matmul(A3, n1)[0]
A3n2 = np.matmul(A3, n2)[0]
A4n1 = np.matmul(A4, n1)[0]
A4n2 = np.matmul(A4, n2)[0]
r1sq = (u[0]**2) + (v[0]**2)
r2sq = (u[1]**2) + (v[1]**2)
r3sq = (u[2]**2) + (v[2]**2)
r4sq = (u[3]**2) + (v[3]**2)
D = np.array([[A1n1, r1sq*A1n1, r1sq*A1n2, A1n2],
              [A2n1, r2sq*A2n1, r2sq*A2n2, A2n2],
              [A3n1, r3sq*A3n1, r3sq*A3n2, A3n2]])

p11 = b*n1[0][0] + n2[0][0]
p12 = b*n1[1][0] + n2[1][0]
p14 = b*n1[2][0] + n2[2][0]
p21 = b*n1[3][0] + n2[3][0]
p22 = b*n1[4][0] + n2[4][0]
p24 = b*n1[5][0] + n2[5][0]
invCD = np.matmul(invC, D)
p31 = invCD[0][0]*b + invCD[0][1]*b*k + invCD[0][2]*k + invCD[0][3]
p32 = invCD[1][0]*b + invCD[1][1]*b*k + invCD[1][2]*k + invCD[1][3]
p33 = invCD[2][0]*b + invCD[2][1]*b*k + invCD[2][2]*k + invCD[2][3]

EQ24 = poly(w*w*p11*p12 + w*w*p21*p22 + p31*w*p32, w, b, k, domain="QQ")
EQ25 = poly(sp.expand(w*w*p11*p11 + w*w*p21*p21 + p31*p31 - w*w*p12*p12 - w*w*p22*p22 - p32*p32), w, b, k, domain="QQ")
EQ26 = poly(A4n1*b + r4sq*A4n1*b*k + r4sq*A4n2*k + A4n2, w, b, k, domain="QQ")
"""EQ24T = poly(2*w*w*b + 3*w*w + 5*w*b*b*b + 1e-99*w*b*b*k + 11*w* - 7, w, b, k, domain="QQ")
EQ25T = poly(b*b*k*k + b - k - 5, w, b, k, domain="QQ")
EQ26T = poly(w*b - 2, w, b, k, domain="QQ")"""
"""EQ24 = poly(EQ24, w, b, k, domain="RR")
EQ25 = poly(EQ25, w, b, k, domain="RR")
EQ26 = poly(EQ26, w, b, k, domain="RR")"""
G = sp.groebner([EQ24, EQ25, EQ26], w, b, k, order="lex")

GW = G[0]
GB = G[1]
GK = G[2]
#GK = lambdify(k, GK, "math")

coefsGK = poly(GK, k, domain="RR").all_coeffs()
kSolutions = np.roots(coefsGK)
print(kSolutions)
for i in range(len(kSolutions)):
    if(kSolutions[i].imag != 0):continue
    coefsGB = poly(GB.subs(k, kSolutions[i]), b, domain="RR").all_coeffs()
    coefsGW = poly(GW.subs(k, kSolutions[i]), w, domain="RR").all_coeffs()
    print(coefsGB)
    print(coefsGW)
    print("\n")
        
#print(kSolutions)




#plot(k**14 + 4.51716372181681e-5*k**13 + 8.62540181735922e-5*k**12 + 3.08719508325884e-9*k**11 + 5.06126674484195e-14*k**10 + 5.0256331078995e-19*k**9 + 3.36619360854272e-24*k**8 + 1.60225071618174e-29*k**7 + 5.55708081006366e-35*k**6 + 1.41501040501214e-40*k**5 + 2.6253160809279e-46*k**4 + 3.46110674325383e-52*k**3 + 3.07763847299593e-58*k**2 + 1.6572687186186e-64*k + 4.08693139291553e-71, (k, -2.5e-6, -2.45e-6))

"""findRootNewton(GK, k, -10000.1, 1000)
findRootNewton(GK, k, 1000000.1, 1000)
findRootNewton(GK, k, -2.6e-6, 1000)
findRootNewton(GK, k, -2.5e-6, 1000)
findRootNewton(GK, k, -2.47e-6, 1000)

#print(sp.nroots(GK, n=15, maxsteps=50, cleanup=True))

print(G)
#G = sp.solve_poly_system([EQ24, EQ25, EQ26], w, b, k, strict=True)
print("\n")
#G = sp.solve_poly_system([poly(b**14 + b**13 - 1, b, domain="RR")], b, strict=True)
print(G)"""