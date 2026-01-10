import cv2
import csv
import string
import os
import time
from src.hand_tracking.mediapipe_hand import HandTracker

# ================= CONFIG =================
CSV_PATH = "data/landmarks/alphabet_number_landmarks_2hand.csv"
SAMPLES_PER_CLASS = 200
CAMERA_INDEX = 0

ALPHABETS = list(string.ascii_uppercase)
NUMBERS = [str(i) for i in range(10)]
CLASSES = ALPHABETS + NUMBERS
# ==========================================

os.makedirs("data/landmarks", exist_ok=True)

tracker = HandTracker(static_mode=True)
cap = cv2.VideoCapture(CAMERA_INDEX)

with open(CSV_PATH, mode="w", newline="") as f:
    writer = csv.writer(f)
    header = [f"f{i}" for i in range(126)] + ["label"]
    writer.writerow(header)

    print("📸 ISL DATA COLLECTION STARTED")

    for label in CLASSES:
        print(f"\n👉 Prepare sign for: {label}")
        print("⏳ Starting in 3 seconds...")
        time.sleep(3)

        collected = 0

        while collected < SAMPLES_PER_CLASS:
            ret, frame = cap.read()
            if not ret:
                break

            landmarks, hand_present, frame = tracker.find_hand_landmarks(frame)

            if hand_present:
                writer.writerow(landmarks + [label])
                collected += 1

                cv2.putText(
                    frame,
                    f"{label} : {collected}/{SAMPLES_PER_CLASS}",
                    (20, 50),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    (0, 255, 0),
                    2
                )
            else:
                cv2.putText(
                    frame,
                    "Show hands clearly",
                    (20, 50),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    (0, 0, 255),
                    2
                )

            cv2.imshow("ISL Data Capture", frame)

            if cv2.waitKey(1) & 0xFF == 27:  # ESC
                break

cap.release()
cv2.destroyAllWindows()

print("\n✅ Data collection completed successfully!")
print(f"📁 Saved at: {CSV_PATH}")
