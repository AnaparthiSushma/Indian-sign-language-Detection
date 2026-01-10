export async function predictLandmarks(landmarks: number[]) {
  const response = await fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ landmarks }),
  });

  if (!response.ok) {
    throw new Error("Prediction failed");
  }

  return response.json(); // { label, confidence }
}
