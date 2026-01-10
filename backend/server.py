from fastapi import FastAPI
from pydantic import BaseModel
from inference import predict_landmarks
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # 🔥 allow frontend
    allow_credentials=True,
    allow_methods=["*"],        # 🔥 allow OPTIONS, POST, etc.
    allow_headers=["*"],
)

class Input(BaseModel):
    landmarks: list[float]

@app.post("/predict")
def predict(data: Input):
    char, confidence = predict_landmarks(data.landmarks)
    return {
        "label": char,
        "confidence": confidence
    }
