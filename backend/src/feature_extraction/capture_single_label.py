import cv2
import csv
import os
import time
import pandas as pd
from src.hand_tracking.mediapipe_hand import HandTracker

# ================= CONFIG =================
CSV_PATH = "data/landmarks/alphabet_number_landmarks_2hand.csv"
TARGET_SAMPLES_PER_LABEL = 200
CAMERA_INDEX = 0
# ==========================================

os.makedirs("data/landmarks", exist_ok=True)

LABEL = input("Enter alphabet (A-Z) or number (0-9) to REPLACE: ").strip().upper()
if not LABEL or len(LABEL) > 1:
    raise ValueError("Please enter a single alphabet (A-Z) or number (0-9)")

# ---------- LOAD EXISTING DATA ----------
if os.path.isfile(CSV_PATH):
    df = pd.read_csv(CSV_PATH, low_memory=False)
else:
    raise FileNotFoundError("Dataset not found. Run full capture first.")

original_count = df.shape[0]
label_count = (df["label"].astype(str) == LABEL).sum()

print(f"\n📊 Existing samples for '{LABEL}': {label_count}")

# ---------- REMOVE OLD LABEL SAMPLES ----------
df = df[df["label"].astype(str) != LABEL]

removed = original_count - df.shape[0]
print(f"🗑️ Removed {removed} old samples of '{LABEL}'")

# ---------- SAVE CLEANED DATASET ----------
df.to_csv(CSV_PATH, index=False)

print(f"📁 Dataset cleaned. Now collecting fresh samples for '{LABEL}'")

# ---------- CAPTURE NEW SAMPLES ----------
tracker = HandTracker(static_mode=True)
cap = cv2.VideoCapture(CAMERA_INDEX)

with open(CSV_PATH, mode="a", newline="") as f:
    writer = csv.writer(f)

    print("⏳ Starting in 3 seconds...")
    time.sleep(3)

    collected = 0

    while collected < TARGET_SAMPLES_PER_LABEL:
        ret, frame = cap.read()
        if not ret:
            break

        landmarks, hand_present, frame = tracker.find_hand_landmarks(frame)

        if hand_present:
            writer.writerow(landmarks + [LABEL])
            collected += 1

            cv2.putText(
                frame,
                f"{LABEL}: {collected}/{TARGET_SAMPLES_PER_LABEL}",
                (20, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2
            )
        else:
            cv2.putText(
                frame,
                "Show hand(s) clearly",
                (20, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 0, 255),
                2
            )

        cv2.imshow("Replace Label Capture", frame)

        if cv2.waitKey(1) & 0xFF == 27:  # ESC
            break

cap.release()
cv2.destroyAllWindows()

print(f"\n✅ '{LABEL}' now has exactly {TARGET_SAMPLES_PER_LABEL} samples")
print("🎯 Dataset is balanced for this label")
