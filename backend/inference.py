import json
import numpy as np
from collections import deque
from tensorflow.keras.models import load_model

MODEL_PATH = "models/alphabet_number_model.h5"
LABEL_MAP_PATH = "models/label_map.json"

CONFIDENCE_THRESHOLD = 0.88
SMOOTHING_WINDOW = 4

model = load_model(MODEL_PATH)

with open(LABEL_MAP_PATH) as f:
    label_map = {int(k): v for k, v in json.load(f).items()}

prediction_queue = deque(maxlen=SMOOTHING_WINDOW)
last_char = ""

def predict_landmarks(landmarks):
    global last_char

    if np.count_nonzero(landmarks) < 40:
        return None, 0.0

    x = np.array(landmarks, dtype=np.float32).reshape(1, -1)
    probs = model.predict(x, verbose=0)[0]

    idx = int(np.argmax(probs))
    confidence = float(probs[idx])

    if confidence < CONFIDENCE_THRESHOLD:
        return None, confidence

    prediction_queue.append(idx)

    if prediction_queue.count(idx) > SMOOTHING_WINDOW // 2:
        char = label_map[idx]
        if char != last_char:
            last_char = char
            return char, confidence

    return None, confidence
