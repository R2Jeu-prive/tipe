#this file is used to collect alpha results and synthesize them with graphs
import matplotlib.pyplot as plt
import numpy as np
import os
import json
import math

logFilePath = os.path.join(os.path.dirname(__file__), '..\\logs\\alpha.txt')
alphaLogs = open(logFilePath, 'r')

semiLengths = []
forces = []
results = []
 
while True:
    # Get next line from file
    line = alphaLogs.readline()
 
    # if line is empty
    # end of file is reached
    if not line:
        break
    
    data = json.loads(line)
    
    evT = data['evolutionTime']
    if (evT < 600000):
        continue
    
    mSL = data['mutationLength']
    if mSL == 0:
        mSL = "Variable"
    mF = data['mutationForce']
    ev = data['evaluation']

    if (mF not in forces):
        forces.append(mF)
        results.append([])
        for i in range(len(semiLengths)):
            results[-1].append([])
    if (mSL not in semiLengths):
        semiLengths.append(mSL)
        for i in range(len(forces)):
            results[i].append([])
    
    i = forces.index(mF)
    j = semiLengths.index(mSL)
    results[i][j].append(ev)
alphaLogs.close()


print(semiLengths)
print(forces)
print(results[0][0])

numOfPlotsPerLine = math.ceil(math.sqrt(len(forces)))
fig, axs = plt.subplots(numOfPlotsPerLine, numOfPlotsPerLine)
for f in range(len(forces)):
    i = f // numOfPlotsPerLine
    j = f % numOfPlotsPerLine
    axs[i, j].set_title("force : " + str(int(forces[f]*100)) + "%")
    for sl in range(len(semiLengths)):
        axs[i, j].scatter([sl for e in range(len(results[f][sl]))], results[f][sl])

plt.setp(axs, xticks=range(len(semiLengths)), xticklabels=semiLengths, xlabel='demi-longueur de mutation', ylabel='eval.')
fig.tight_layout()
fig.suptitle("Résultat des experiences Alpha")
plt.show()