import cv2
from src.hand_tracking.mediapipe_hand import HandTracker

tracker = HandTracker(static_mode=True)

def extract_landmarks_from_image(image_path):
    image = cv2.imread(image_path)
    if image is None:
        return None

    landmarks, _ = tracker.find_hand_landmarks(image)
    if len(landmarks) == 63:
        return landmarks
    return None
