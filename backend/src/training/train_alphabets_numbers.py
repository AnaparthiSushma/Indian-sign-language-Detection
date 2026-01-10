import pandas as pd
import numpy as np
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.utils import to_categorical

# ================= CONFIG =================
CSV_PATH = "data/landmarks/alphabet_number_landmarks_2hand.csv"
MODEL_PATH = "models/alphabet_number_model.h5"
LABEL_MAP_PATH = "models/label_map.json"

EPOCHS = 40
BATCH_SIZE = 32
# ==========================================

os.makedirs("models", exist_ok=True)

# Load CSV safely
df = pd.read_csv(CSV_PATH, low_memory=False)

# Safety check
if df.shape[0] == 0:
    raise ValueError("Dataset is empty. Collect data first.")

# Split features and labels
X = df.iloc[:, :-1].values          # 126 landmark features
y = df.iloc[:, -1].astype(str)      # 🔥 FORCE labels to string

# Encode labels
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# Save label map
label_map = {int(i): label for i, label in enumerate(label_encoder.classes_)}
with open(LABEL_MAP_PATH, "w") as f:
    json.dump(label_map, f, indent=4)

# One-hot encode
y_cat = to_categorical(y_encoded)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_cat,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

# ================= MODEL =================
model = Sequential([
    Dense(512, activation="relu", input_shape=(126,)),
    Dropout(0.4),
    Dense(256, activation="relu"),
    Dropout(0.3),
    Dense(y_cat.shape[1], activation="softmax")
])

model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

# Train
model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=EPOCHS,
    batch_size=BATCH_SIZE
)

# Save model
model.save(MODEL_PATH)

# Evaluate
loss, acc = model.evaluate(X_test, y_test)
print(f"\n✅ Training completed successfully")
print(f"🎯 Validation Accuracy: {acc * 100:.2f}%")
