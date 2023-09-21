include("solve_p4p.jl")

inputFile = open("match_data.txt")
outputFile = open("match_res.txt","w")

res_text = ""

while true
    frameLine = readline(inputFile)
    if frameLine == ""
        break
    end

    println(frameLine)
    global res_text = res_text * frameLine * "\n"

    #every 17 lines corresponds to one frame
    #so 4 screen and 4 world points
    u1 = parse(Float64, strip(readline(inputFile), ['\n']))
    v1 = parse(Float64, strip(readline(inputFile), ['\n']))
    u2 = parse(Float64, strip(readline(inputFile), ['\n']))
    v2 = parse(Float64, strip(readline(inputFile), ['\n']))
    u3 = parse(Float64, strip(readline(inputFile), ['\n']))
    v3 = parse(Float64, strip(readline(inputFile), ['\n']))
    u4 = parse(Float64, strip(readline(inputFile), ['\n']))
    v4 = parse(Float64, strip(readline(inputFile), ['\n']))
    x1 = parse(Float64, strip(readline(inputFile), ['\n']))
    z1 = parse(Float64, strip(readline(inputFile), ['\n']))
    x2 = parse(Float64, strip(readline(inputFile), ['\n']))
    z2 = parse(Float64, strip(readline(inputFile), ['\n']))
    x3 = parse(Float64, strip(readline(inputFile), ['\n']))
    z3 = parse(Float64, strip(readline(inputFile), ['\n']))
    x4 = parse(Float64, strip(readline(inputFile), ['\n']))
    z4 = parse(Float64, strip(readline(inputFile), ['\n']))

    u_1 = [u1,v1,1]
    u_2 = [u2,v2,1]
    u_3 = [u3,v3,1]
    u_4 = [u4,v4,1]
    x_1 = [x1,0,z1,1]
    x_2 = [x2,0,z2,1]
    x_3 = [x3,0,z3,1]
    x_4 = [x4,0,z4,1]

    res_pos = solve_p4p(u_1,u_2,u_3,u_4,x_1,x_2,x_3,x_4)

    println(res_pos)
    println("")

    res_text = res_text * string(res_pos[1]) * "\n" * string(res_pos[2]) * "\n" * string(res_pos[3]) * "\n"
end

write(outputFile, res_text)

close(inputFile)
close(outputFile)