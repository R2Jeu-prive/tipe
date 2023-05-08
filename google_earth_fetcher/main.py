from PIL import Image
import requests
from io import BytesIO
import time

"""r1 = requests.get("http://khm1.googleapis.com/kh?v=945&hl=fr-FR&x=620247&y=750141&z=21") #top
r2 = requests.get("http://khm1.googleapis.com/kh?v=945&hl=fr-FR&x=620232&y=750220&z=21") #left
r3 = requests.get("http://khm1.googleapis.com/kh?v=945&hl=fr-FR&x=620275&y=750285&z=21") #bottom
r4 = requests.get("http://khm1.googleapis.com/kh?v=945&hl=fr-FR&x=620280&y=750282&z=21") #right"""

# SITE TO INSPECT AND FIND BORDERS :
# http://www.chengfolio.com/google_map_customizer#satellitemap

headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}

xRange = [620232, 620280]
yRange = [750141, 750285]
width = (xRange[1] - xRange[0] + 1)
height = (yRange[1] - yRange[0] + 1)

def fetch():
    for x in range(xRange[0], xRange[1] + 1):
        for y in range(yRange[0], yRange[1] + 1):
            print(x,y)
            res = requests.get("http://khm1.googleapis.com/kh?v=945&hl=fr-FR&x=" + str(x) + "&y=" + str(y) + "&z=21", headers=headers)
            if(res.status_code != 200):
                print(res)
                error = error + 1
            patch = Image.open(BytesIO(res.content))
            patch.save("villeneuve/" + str(x) + "_" + str(y) + ".png")
            time.sleep(.5)
            if y%7 == 0:
                time.sleep(.7)
            if y%11 == 0:
                time.sleep(1)
            if y%30 == 0:
                time.sleep(7)

def group():
    img = Image.new(mode="RGB", size=(width*256, height*256))
    for x in range(width):
        for y in range(height):
            print(x,y)
            patch = Image.open("villeneuve/" + str(x + xRange[0]) + "_" + str(y + yRange[0]) + ".png")
            img.paste(patch, (x*256, y*256))

    img.show()
    img.save("result.png")

group()