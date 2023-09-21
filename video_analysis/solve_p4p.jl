using HomotopyContinuation
using LinearAlgebra

camPreferedHeight = 19 # 1 meter so ~19 pixels following the ratio in ../js/villeneuve.js

function solve_p4p(u1,u2,u3,u4,x1,x2,x3,x4)
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

    F = System([f_1, f_2, f_3, f_4, f_5, f_6, f_7, f_8, f_9, f_10, f_11, f_12])

    #SOLVER
    result = solve(F)
    sols = real_solutions(result)
    bestSol = nothing

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

        if w_val < 0
            continue #impossible focal length
        end

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
        #=if R[3,1] == 1
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
        end=#

        if Tworld[2] < 0
            continue #impossible camera position (underground)
        end

        if bestSol == nothing
            bestSol = Tworld
        elseif abs(bestSol[2] - camPreferedHeight) > abs(Tworld[2] - camPreferedHeight)
            bestSol = Tworld
        end
    end

    return bestSol
end