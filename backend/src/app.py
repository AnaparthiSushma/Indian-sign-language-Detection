import cv2
from src.hand_tracking.mediapipe_hand import HandTracker

cap = cv2.VideoCapture(0)
tracker = HandTracker()

while True:
    success, frame = cap.read()
    if not success:
        break

    landmarks, output = tracker.find_hand_landmarks(frame)

    if len(landmarks) == 63:
        cv2.putText(
            output,
            "Hand Detected",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

    cv2.imshow("ISL Hand Tracking", output)

    if cv2.waitKey(1) & 0xFF == 27:  # ESC
        break

cap.release()
cv2.destroyAllWindows()
