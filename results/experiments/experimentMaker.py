import numpy as np
import os
newExpPath = 'delta.txt'
f = open(newExpPath, 'w')
expString = ""

genSize = 200
parentCounts = [2, 4, 6]
tournementSizes = [3, 6, 10]
mutationProbs = ["0.5", "0.8", "0.9"]
mutationForces = ["0.1", "0.3", "0.5"]
mutationZones = [[5,60,200], [3,40,150], [1,20,100]]


for i in range(3):
    for j in range(3):
        for k in range(3):
            for l in range(3):
                for m in range(3):
                    expString += "setParam parentCount " + str(parentCounts[i]) + ";\n"
                    expString += "setParam selectionPressure " + str(parentCounts[i] * tournementSizes[j] / genSize) + ";\n"
                    expString += "setParam mutationBumpProbability " + mutationProbs[k] + ";\n"
                    expString += "setParam mutationShiftProbability " + mutationProbs[k] + ";\n"
                    expString += "setParam mutationBumpForce " + mutationForces[l] + ";\n"
                    expString += "setParam mutationShiftForce " + mutationForces[l] + ";\n"
                    expString += "setParam mutationMinSemiLength " + str(mutationZones[m][0]) + ";\n"
                    expString += "setParam mutationMedSemiLength " + str(mutationZones[m][1]) + ";\n"
                    expString += "setParam mutationMaxSemiLength " + str(mutationZones[m][2]) + ";\n"
                    expString += "addRandomConstantTrajs " + str(genSize) + ";\n"
                    expString += "start delta;\nstop 15;\nwaitStopped;\nsaveBestTraj delta;\nclearTrajs;\n"
expString += "runExp delta;\n"
f.write(expString)
f.close()
