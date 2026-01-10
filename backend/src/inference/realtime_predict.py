import cv2
import json
import numpy as np
from tensorflow.keras.models import load_model
from collections import deque
from src.hand_tracking.mediapipe_hand import HandTracker

# ================= CONFIG =================
MODEL_PATH = "models/alphabet_number_model.h5"
LABEL_MAP_PATH = "models/label_map.json"

CONFIDENCE_THRESHOLD = 0.88
SMOOTHING_WINDOW = 4
FRAME_SKIP = 3
CAMERA_INDEX = 0
# ==========================================

# Load model
model = load_model(MODEL_PATH)

# Load label map
with open(LABEL_MAP_PATH, "r") as f:
    label_map = json.load(f)
label_map = {int(k): v for k, v in label_map.items()}

tracker = HandTracker()
cap = cv2.VideoCapture(CAMERA_INDEX)

prediction_queue = deque(maxlen=SMOOTHING_WINDOW)
output_text = ""
last_char = ""
frame_count = 0

print("🚀 ISL → Text prediction started")
print("ESC: Exit | BACKSPACE: Clear")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_count += 1

    landmarks, hand_present, frame = tracker.find_hand_landmarks(frame)

    if frame_count % FRAME_SKIP == 0 and hand_present:
        # Reject weak detections (important)
        if np.count_nonzero(landmarks) < 40:
            continue

        input_data = np.array(landmarks, dtype=np.float32).reshape(1, -1)

        probs = model.predict(input_data, verbose=0)[0]
        pred_idx = int(np.argmax(probs))
        confidence = probs[pred_idx]

        if confidence >= CONFIDENCE_THRESHOLD:
            prediction_queue.append(pred_idx)

            if prediction_queue.count(pred_idx) > SMOOTHING_WINDOW // 2:
                char = label_map[pred_idx]
                if char != last_char:
                    output_text += char
                    last_char = char

    # UI
    cv2.rectangle(frame, (0, 0), (frame.shape[1], 90), (0, 0, 0), -1)
    cv2.putText(
        frame,
        f"Text: {output_text}",
        (10, 55),
        cv2.FONT_HERSHEY_SIMPLEX,
        1.3,
        (0, 255, 0),
        3
    )
    cv2.putText(
        frame,
        "ESC: Exit | BACKSPACE: Clear",
        (10, 85),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (200, 200, 200),
        1
    )

    cv2.imshow("ISL to Text", frame)

    key = cv2.waitKey(1) & 0xFF
    if key == 27:
        break
    elif key == 8:
        output_text = ""
        last_char = ""
        prediction_queue.clear()

cap.release()
cv2.destroyAllWindows()
