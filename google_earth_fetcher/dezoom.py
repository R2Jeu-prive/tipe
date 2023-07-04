from PIL import Image

xRange = [620232, 620280]
yRange = [750141, 750285]

def group(interval, origin, dest):
    mod = 2*interval
    for x in range(xRange[0], xRange[1] + 1):
        for y in range(yRange[0], yRange[1] + 1):
            print(x,y)
            if x%mod == xRange[0]%mod and y%mod == yRange[0]%mod:
                img = Image.new(mode="RGB", size=(256, 256))
                topR = Image.new(mode="RGB", size=(256, 256))
                botL = Image.new(mode="RGB", size=(256, 256))
                botR = Image.new(mode="RGB", size=(256, 256))
                topL = Image.open(origin + "/" + str(x) + "_" + str(y) + ".png")
                if x + interval <= xRange[1]:
                    topR = Image.open(origin + "/" + str(x + interval) + "_" + str(y) + ".png")
                if y + interval <= yRange[1]:
                    botL = Image.open(origin + "/" + str(x) + "_" + str(y + interval) + ".png")
                if x + interval <= xRange[1] and y + interval <= yRange[1]:
                    botR = Image.open(origin + "/" + str(x + interval) + "_" + str(y + interval) + ".png")

                img.paste(topL.resize((128, 128)), (0, 0, 128, 128))
                img.paste(topR.resize((128, 128)), (128, 0, 256, 128))
                img.paste(botL.resize((128, 128)), (0, 128, 128, 256))
                img.paste(botR.resize((128, 128)), (128, 128, 256, 256))
                img.save(dest + "/" + str(x) + "_" + str(y) + ".png")

#group(1, "villeneuve", "villeneuve_dezoom_1")
#group(2, "villeneuve_dezoom_1", "villeneuve_dezoom_2")
group(4, "villeneuve_dezoom_2", "villeneuve_dezoom_3")
group(8, "villeneuve_dezoom_3", "villeneuve_dezoom_4")
group(16, "villeneuve_dezoom_4", "villeneuve_dezoom_5")