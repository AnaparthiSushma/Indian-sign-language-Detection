import json
import numpy as np
from tensorflow.keras.models import load_model

MODEL_PATH = "models/alphabet_number_model.h5"
LABEL_MAP_PATH = "models/label_map.json"

model = load_model(MODEL_PATH)

with open(LABEL_MAP_PATH, "r") as f:
    label_map = json.load(f)
label_map = {int(k): v for k, v in label_map.items()}

def predict_landmarks(landmarks):
    data = np.array(landmarks, dtype=np.float32).reshape(1, -1)
    probs = model.predict(data, verbose=0)[0]
    idx = int(np.argmax(probs))
    return {
        "label": label_map[idx],
        "confidence": float(probs[idx])
    }
