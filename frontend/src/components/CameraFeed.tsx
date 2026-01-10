import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hands } from "@mediapipe/hands";
import { Camera as MpCamera } from "@mediapipe/camera_utils";

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface CameraFeedProps {
  isActive: boolean;
  onToggle: () => void;
  onLandmarks: (landmarks: number[]) => void;
}

const CameraFeed = ({ isActive, onToggle, onLandmarks }: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<MpCamera | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Landmark flattening ---------------- */

  const flattenLandmarks = useCallback((hands: HandLandmark[][]): number[] => {
    const flat: number[] = [];
    hands.slice(0, 2).forEach(hand =>
      hand.forEach(lm => flat.push(lm.x, lm.y, lm.z))
    );
    while (flat.length < 126) flat.push(0);
    return flat.slice(0, 126);
  }, []);

  /* ---------------- MediaPipe results ---------------- */

  const onResults = useCallback((results: any) => {
    console.log("🟢 onResults fired");

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    const hands: HandLandmark[][] = [];

    if (results.multiHandLandmarks) {
      results.multiHandLandmarks.forEach((landmarks: any) => {
        hands.push(
          landmarks.map((lm: any) => ({ x: lm.x, y: lm.y, z: lm.z }))
        );

        // Draw landmark points
        landmarks.forEach((lm: any) => {
          ctx.beginPath();
          ctx.arc(
            lm.x * canvas.width,
            lm.y * canvas.height,
            4,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = "hsl(174, 72%, 45%)";
          ctx.fill();
        });
      });
    }

    if (hands.length) {
      const flatLandmarks = flattenLandmarks(hands);

      console.log("📤 Sending landmarks:", flatLandmarks.slice(0, 10));

      onLandmarks(flatLandmarks);
    }
  }, [flattenLandmarks, onLandmarks]);

  /* ---------------- MediaPipe init ---------------- */

  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    setIsLoading(true);
    setError(null);

    const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
});


    hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,      // 🔥 REQUIRED
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});


    hands.onResults(onResults);

    const videoEl = videoRef.current!;
    const camera = new MpCamera(videoEl, {
      onFrame: async () => {
        console.log("📷 Frame sent");
        await hands.send({ image: videoEl });
      },
      width: 640,
      height: 480,
    });

    camera.start();
    cameraRef.current = camera;
    setIsLoading(false);

    return () => {
      cameraRef.current?.stop();
    };
  }, [isActive, onResults]);

  /* ---------------- UI ---------------- */

  return (
    <div className="camera-container bg-card aspect-video w-full relative">
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        playsInline
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <AnimatePresence>
        {!isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/80 backdrop-blur-sm"
          >
            <CameraOff className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg mb-4">Camera is off</p>
            <Button onClick={onToggle}>
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive/20">
          <p className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg">
            {error}
          </p>
        </div>
      )}

      {isActive && (
        <Button
          onClick={onToggle}
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4"
        >
          <CameraOff className="w-4 h-4 mr-2" />
          Stop
        </Button>
      )}
    </div>
  );
};

export default CameraFeed;
