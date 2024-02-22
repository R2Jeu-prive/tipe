#this file is used to collect delta results and synthesize them with graphs
import matplotlib.pyplot as plt
import numpy as np
import os
import json
import math
from functools import reduce

tickColor = "#058C42"
barColor = "#E0525B88"
faceColor = "#ffffff"

logFilePath = '../logs/delta.txt'
deltaLogs = open(logFilePath, 'r')

discriminations = [["params","mutationBumpProbability"], ["params","mutationBumpForce"], ["params","selectionPressure"]]
discriminationCategories = [[],[],[]]
bestEvals = [[],[],[]]
 
while True:
    # Get next line from file
    line = deltaLogs.readline()
 
    # if line is empty
    # end of file is reached
    if not line:
        break
    
    data = json.loads(line)
    genNum = data['stats']['genNum']

    if(genNum != 1475):
        continue
    
    for i in range(len(discriminations)):
        discriminationCategory = data[discriminations[i][0]][discriminations[i][1]]
        if(not(discriminationCategory in discriminationCategories[i])):
            discriminationCategories[i].append(discriminationCategory)
            bestEvals[i].append([])
        bestEvals[i][discriminationCategories[i].index(discriminationCategory)].append(data['stats']['bestEval'])
deltaLogs.close()

numOfPlotsPerLine = math.ceil(math.sqrt(len(discriminations)))
fig, axs = plt.subplots(numOfPlotsPerLine, numOfPlotsPerLine, facecolor=faceColor)
for d in range(len(bestEvals)):
    i = d // numOfPlotsPerLine
    j = d % numOfPlotsPerLine
    axs[i, j].set_title("Discrimination : " + discriminations[d][1])
    axs[i, j].set_facecolor(faceColor)
    plt.setp(axs[i,j], xticks=range(len(bestEvals[d])), xticklabels=discriminationCategories[d], xlabel='critère de discrimination', ylabel='eval.')
    for catSubId in range(len(bestEvals[d])):
        avg = np.mean(bestEvals[d][catSubId])
        var = np.std(bestEvals[d][catSubId])
        axs[i, j].errorbar(catSubId, avg, xerr=0, yerr=var, c=barColor, zorder=2, linewidth=4)
        axs[i, j].scatter([catSubId for whatever in range(len(bestEvals[d][catSubId]))], bestEvals[d][catSubId], c=tickColor, marker="_", zorder=1, linewidth=0.5, s=100)

fig.tight_layout()
fig.suptitle("Résultat des experiences Delta")
plt.show()
