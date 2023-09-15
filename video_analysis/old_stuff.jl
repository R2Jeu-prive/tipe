using HomotopyContinuation
using LinearAlgebra
print("Starting\n")

#=
OLD POINTS
u1 = [605/810,50/810,1]
u2 = [172/810,-84/810,1]
u3 = [-596/810,-24/810,1]
u4 = [-533/810,-187/810,1]
x1 = [9807.0,21986,0,1]
x2 = [9820.5,22052.5,0,1]
x3 = [9909,22030.5,0,1]
x4 = [9968.5,22308.5,0,1]
=#

#POINTED DATA (frame : 5339)
u4 = [-0.345703125, 0.12239583333333334, 1]
u3 = [-0.3873697916666667, 0.015625, 1]
u2 = [0.11067708333333337, 0.0546875, 1]
u1 = [0.392578125, -0.035807291666666685, 1]
x1 = [9810.0,0,21985.5,1]
x2 = [9820.0,0,22052.0,1]
x3 = [9909.0,0,22031.0,1]
x4 = [9968.5,0,22308.5,1]
#=
u5 = [0.015625, 0.09700520833333334, 1]
x5 = [9817.5,0,22128.5, 1]
=#

#SYSTEM
@var b c d k t1 t2 t3 t4 w x y z 

f_1 = ((1 + b*b - c*c - d*d)*x1[1] + (2*b*c - 2*d)*x1[2] + (2*c + 2*b*d)*x1[3] + x*x1[4]) - t1*u1[1]
f_2 = ((2*d + 2*b*c)*x1[1] + (1 - b*b + c*c - d*d)*x1[2] + (2*c*d - 2*b)*x1[3] + y*x1[4]) - t1*u1[2]
f_3 = w*((2*b*d - 2*c)*x1[1] + (2*b + 2*c*d)*x1[2] + (1 - b*b - c*c + d*d)*x1[3] + z*x1[4]) - t1*(1 + k*(u1[1]^2 + u1[2]^2))

f_4 = ((1 + b*b - c*c - d*d)*x2[1] + (2*b*c - 2*d)*x2[2] + (2*c + 2*b*d)*x2[3] + x*x2[4]) - t2*u2[1]
f_5 = ((2*d + 2*b*c)*x2[1] + (1 - b*b + c*c - d*d)*x2[2] + (2*c*d - 2*b)*x2[3] + y*x2[4]) - t2*u2[2]
f_6 = w*((2*b*d - 2*c)*x2[1] + (2*b + 2*c*d)*x2[2] + (1 - b*b - c*c + d*d)*x2[3] + z*x2[4]) - t2*(1 + k*(u2[1]^2 + u2[2]^2))

f_7 = ((1 + b*b - c*c - d*d)*x3[1] + (2*b*c - 2*d)*x3[2] + (2*c + 2*b*d)*x3[3] + x*x3[4]) - t3*u3[1]
f_8 = ((2*d + 2*b*c)*x3[1] + (1 - b*b + c*c - d*d)*x3[2] + (2*c*d - 2*b)*x3[3] + y*x3[4]) - t3*u3[2]
f_9 = w*((2*b*d - 2*c)*x3[1] + (2*b + 2*c*d)*x3[2] + (1 - b*b - c*c + d*d)*x3[3] + z*x3[4]) - t3*(1 + k*(u3[1]^2 + u3[2]^2))

f_10 = ((1 + b*b - c*c - d*d)*x4[1] + (2*b*c - 2*d)*x4[2] + (2*c + 2*b*d)*x4[3] + x*x4[4]) - t4*u4[1]
f_11 = ((2*d + 2*b*c)*x4[1] + (1 - b*b + c*c - d*d)*x4[2] + (2*c*d - 2*b)*x4[3] + y*x4[4]) - t4*u4[2]
f_12 = w*((2*b*d - 2*c)*x4[1] + (2*b + 2*c*d)*x4[2] + (1 - b*b - c*c + d*d)*x4[3] + z*x4[4]) - t4*(1 + k*(u4[1]^2 + u4[2]^2))

#=
f_13 = ((1 + b*b - c*c - d*d)*x5[1] + (2*b*c - 2*d)*x5[2] + (2*c + 2*b*d)*x5[3] + x*x5[4]) - t4*u5[1]
f_14 = ((2*d + 2*b*c)*x5[1] + (1 - b*b + c*c - d*d)*x5[2] + (2*c*d - 2*b)*x5[3] + y*x5[4]) - t4*u5[2]
f_15 = w*((2*b*d - 2*c)*x5[1] + (2*b + 2*c*d)*x5[2] + (1 - b*b - c*c + d*d)*x5[3] + z*x5[4]) - t4*(1 + k*(u5[1]^2 + u5[2]^2))
=#
F = System([f_1, f_2, f_3, f_4, f_5, f_6, f_7, f_8, f_9, f_10, f_11, f_12])


#SOLVER
result = solve(F)
sols = real_solutions(result)

for sol in sols
    b_val = sol[1]
    c_val = sol[2]
    d_val = sol[3]
    k_val = sol[4]
    t1_val = sol[5]
    t2_val = sol[6]
    t3_val = sol[7]
    t4_val = sol[8]
    w_val = sol[9]
    x_val = sol[10]
    y_val = sol[11]
    z_val = sol[12]

    #NORMALIZE QUATERNION
    oldQuatNorm = sqrt(1 + (b_val^2) + (c_val^2) + (d_val^2))
    rot_a = 1/oldQuatNorm
    rot_b = b_val/oldQuatNorm
    rot_c = c_val/oldQuatNorm
    rot_d = d_val/oldQuatNorm

    #REBUILD R|T MATRIX (lambda values should be changed to satisfy system but we don't use them)
    new_x = x_val/(oldQuatNorm^2)
    new_y = y_val/(oldQuatNorm^2)
    new_z = z_val/(oldQuatNorm^2)
    R = [(rot_a^2)+(rot_b^2)-(rot_c^2)-(rot_d^2) 2*rot_b*rot_c-(2*rot_d*rot_a) 2*rot_c*rot_a+(2*rot_b*rot_d) ; 2*rot_d*rot_a+(2*rot_b*rot_c) (rot_a^2)-(rot_b^2)+(rot_c^2)-(rot_d^2) 2*rot_c*rot_d-(2*rot_b*rot_a) ; 2*rot_b*rot_d-(2*rot_c*rot_a) 2*rot_b*rot_a+(2*rot_c*rot_d) (rot_a^2)-(rot_b^2)-(rot_c^2)+(rot_d^2)]
    #print(R)
    T = [new_x ; new_y ; new_z] #in cam coord
    Tworld = -transpose(R)*T #in world coord https://en.wikipedia.org/wiki/Camera_resectioning

    #COMPUTE EULER ANGLES FROM R
    if R[3,1] == 1
        th1 = pi/2
        psi1 = atand(R[1,2],R[1,3])
        phi1 = 0
    elseif R[3,1] == -1
        th1 = -pi/2
        psi1 = atand(-R[1,2],-R[1,3])
        phi1 = 0
    else
        th1 = -asind(R[3,1])
        th2 = pi - th1
        psi1 = atand(R[3,2]/cosd(th1), R[3,3]/cosd(th2))
        psi2 = atand(R[3,2]/cosd(th2), R[3,3]/cosd(th2))
        phi1 = atand(R[2,1]/cosd(th1), R[1,1]/cosd(th2))
        phi2 = atand(R[2,1]/cosd(th2), R[1,1]/cosd(th2))
    end
    print("pos: ")
    print(Tworld)
    print("\nf: ")
    print(1/w_val)
    print("\nk: ")
    print(k_val)
    print("\nrot1: ")
    print(th1)
    print(" ")
    print(psi1)
    print(" ")
    print(phi1)
    print("\nrot2: ")
    print(th2)
    print(" ")
    print(psi2)
    print(" ")
    print(phi2)
    print("\n\n")
    #=
    quat_norm = (1 + b_val^2 + c_val^2 + d_val^2)^(0.5)
    eval = f_7(x => x_val, y => y_val, z => z_val, b => b_val, c => c_val, d => d_val, w => w_val, k => k_val, t1 => t1_val, t2 => t2_val, t3 => t3_val, t4 => t4_val)
    a_ = 1/quat_norm
    b_ = b_val/quat_norm
    c_ = c_val/quat_norm
    d_ = d_val/quat_norm
    roll = atand(2*(a_*b_ + c_*d_), a_^2 - b_^2 - c_^2 + d_^2)
    pitch = asind(2*(a_*c_ - b_*d_))
    yaw = atand(2*(a_*d_ + b_*c_), a_^2 + b_^2 - c_^2 - d_^2)
    tVector = [x_val/quat_norm ; y_val/quat_norm ; z_val/quat_norm]
    print(-transpose(rotMatrix)*tVector)

    print("pos: ")
    print(x_val/quat_norm)
    print(" ")
    print(y_val/quat_norm)
    print(" ")
    print(z_val/quat_norm)
    print("\n")

    print("rot: ")
    print(yaw)
    print(" ")
    print(pitch)
    print(" ")
    print(roll)
    print("\n")

    print("k: ")
    print(k_val)
    print("\n")
    print("f: ")
    print(1/w_val)
    print("\n")
    print("lambda vals: ")
    print(t1_val)
    print(" ")
    print(t2_val)
    print(" ")
    print(t3_val)
    print(" ")
    print(t4_val)
    print("\n")
    print("\n")
    =#
end

#=

print(sols[1])
print("\n")
print(sols[2])
print("\n")
print(sols[3])
print("\n")
print(sols[4])
print("\n")
print(sols[5])
print("\n")
print(sols[6])
print("\n")
print(sols[7])
print("\n")
print(sols[8])
print("\n")
print(sols[9])
print("\n")
print(sols[10])
print("\n")
print(sols[11])
print("\n")
print(sols[12])
print("\n")

eval_1 = f_1(x => sols[1][1], y => sols[1][2], z => sols[1][3], b => sols[1][4], c => sols[1][5], d => sols[1][6], w => sols[1][7], k => sols[1][8], t1 => sols[1][9], t2 => sols[1][10], t3 => sols[1][11], t4 => sols[1][12]) 
eval_2 = f_1(b => sols[1][1], c => sols[1][2], d => sols[1][3], k => sols[1][4], t1 => sols[1][5], t2 => sols[1][6], t3 => sols[1][7], t4 => sols[1][8], w => sols[1][9], x => sols[1][10], y => sols[1][11], z => sols[1][12]) 

print("\n")
print(eval_1)
print("\n")
print(eval_2)



print(sols[13])
print("\n")
print(sols[14])
print("\n")
print(sols[15])
print("\n")
print(sols[16])
print("\n")
print(sols[17])
print("\n")
print(sols[18])
print("\n")
print(sols[19])
print("\n")
print(sols[20])
print("\n")
print(sols[21])
print("\n")
print(sols[22])
print("\n")
print(sols[23])
print("\n")
print(sols[24])
print("\n")

=#