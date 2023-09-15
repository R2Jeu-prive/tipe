
function normalize(b,c,d)
    norm = 1 + b*b + c*c + d*d
    w = 1/norm
    x = b/norm
    y = c/norm
    z = d/norm
    (w,x,y,z)
end

println(normalize(1,1,1))