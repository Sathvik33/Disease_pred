from PIL import Image
import numpy as np

IMG_SIZE = 224

MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)

def preprocess_image(image: Image.Image):
    image = image.resize((IMG_SIZE, IMG_SIZE))
    
    img = np.array(image).astype(np.float32) / 255.0

    img = (img - MEAN) / STD

    img = np.transpose(img, (2, 0, 1))

    img = np.expand_dims(img, axis=0)

    return img.astype(np.float32)