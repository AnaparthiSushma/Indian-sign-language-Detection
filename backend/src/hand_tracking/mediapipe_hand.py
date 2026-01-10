import cv2
import mediapipe as mp

class HandTracker:
    def __init__(self, static_mode=False, max_hands=2, detection_conf=0.8, tracking_conf=0.8):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=static_mode,
            max_num_hands=max_hands,
            min_detection_confidence=detection_conf,
            min_tracking_confidence=tracking_conf
        )
        self.drawer = mp.solutions.drawing_utils

    def find_hand_landmarks(self, image, draw=True):
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        result = self.hands.process(image_rgb)

        landmarks = []
        hand_present = False

        if result.multi_hand_landmarks:
            hand_present = True
            for hand_lms in result.multi_hand_landmarks[:2]:
                for lm in hand_lms.landmark:
                    landmarks.extend([lm.x, lm.y, lm.z])

                if draw:
                    self.drawer.draw_landmarks(
                        image, hand_lms, self.mp_hands.HAND_CONNECTIONS
                    )

        # Force EXACT size
        if len(landmarks) < 126:
            landmarks.extend([0.0] * (126 - len(landmarks)))
        elif len(landmarks) > 126:
            landmarks = landmarks[:126]

        return landmarks, hand_present, image
