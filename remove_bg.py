from PIL import Image
import os

def remove_white_bg_soft(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    newData = []
    
    for item in datas:
        r, g, b, a = item
        # If the pixel is very white, reduce its alpha
        # dist is distance from pure white (255, 255, 255)
        dist = ((255 - r)**2 + (255 - g)**2 + (255 - b)**2)**0.5
        
        threshold = 30.0  
        if dist < threshold:
            new_a = int(255 * (dist / threshold))
            if new_a < 10: new_a = 0
            # To avoid white halo on dark background, we can change the RGB slightly, 
            # but keeping original RGB with low alpha is usually okay-ish.
            newData.append((r, g, b, new_a))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")

remove_white_bg_soft("public/images/piggy_bank.png", "public/images/piggy_bank.png")
print("Done")
