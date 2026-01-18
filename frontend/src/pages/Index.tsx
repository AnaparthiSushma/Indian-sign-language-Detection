import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Hand, Type, BarChart3 } from 'lucide-react';
import Header from '@/components/Header';
import CameraFeed from '@/components/CameraFeed';
import PredictionDisplay from '@/components/PredictionDisplay';
import TranslationHistory from '@/components/TranslationHistory';
import TextToSign from '@/components/TextToSign';
import ModeToggle from '@/components/ModeToggle';
import StatsCard from '@/components/StatsCard';
import { predictLandmarks } from "@/lib/mlApi";

interface Prediction {
  text: string;
  confidence: number;
  type: 'letter' | 'word' | 'gesture';
  timestamp: Date;
}

interface HistoryEntry {
  id: string;
  text: string;
  timestamp: Date;
  mode: 'sign-to-text' | 'text-to-sign';
}

const Index = () => {
  const [mode, setMode] = useState<'sign-to-text' | 'text-to-sign'>('sign-to-text');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isConnected] = useState(true);
  const [currentPrediction, setCurrentPrediction] = useState<Prediction | null>(null);

  // ✅ MUST NEVER BE NULL
  const [translatedText, setTranslatedText] = useState<string>("");

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [textToSignInput, setTextToSignInput] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const [stats, setStats] = useState({
    signsDetected: 0,
    wordsTranslated: 0,
    accuracy: 0.98
  });

  /* ---------------- Python realtime_predict.py equivalents ---------------- */
  const frameCountRef = useRef(0);                 // FRAME_SKIP = 3
  const predictionQueueRef = useRef<string[]>([]); // deque(maxlen=4)
  const lastCharRef = useRef<string>("");          // suppress duplicates

  /* ---------------- Handle landmarks from CameraFeed ---------------- */

  const handleLandmarksDetected = useCallback(
    async (flatLandmarks: number[] | null) => {

      console.log("📥 Index received landmarks:", flatLandmarks?.length);

      if (!flatLandmarks || flatLandmarks.length !== 126) return;

      /* FRAME SKIP */
      frameCountRef.current++;
      if (frameCountRef.current % 3 !== 0) return;

      /* Reject weak landmark frames */
      

      try {
        const result = await predictLandmarks(flatLandmarks);

        // ✅ Guard against null / low confidence
        if (!result || !result.label || result.confidence < 0.6) return;

        console.log("FINAL LABEL:", result.label);

        /* Smoothing window */
        const queue = predictionQueueRef.current;
        queue.push(result.label);
        if (queue.length > 4) queue.shift();

        const stableCount = queue.filter(v => v === result.label).length;
        if (stableCount <1) return;

        /* Prevent duplicate characters */
        /*if (result.label === lastCharRef.current) return;
        lastCharRef.current = result.label;*/

        const prediction: Prediction = {
          text: result.label,          // ✅ MUST be label
          confidence: result.confidence,
          type: 'letter',
          timestamp: new Date()
        };

        setCurrentPrediction({
  text: result.label,
  confidence: result.confidence,
  type: 'letter',
  timestamp: new Date()
});

        // ✅ SAFE APPEND (NO NULL POSSIBLE)

setTranslatedText(prev => prev + result.label);
        setStats(prev => ({
          ...prev,
          signsDetected: prev.signsDetected + 1
        }));

      } catch (err) {
        console.error("Prediction error:", err);
      }
    },
    []
  );

  /* ---------------- Text → Sign ---------------- */

  const handleTextToSign = useCallback((text: string) => {
    setIsTranslating(true);

    setTimeout(() => {
      setTextToSignInput(text);
      setIsTranslating(false);

      const entry: HistoryEntry = {
        id: Date.now().toString(),
        text,
        timestamp: new Date(),
        mode: 'text-to-sign'
      };
      setHistory(prev => [entry, ...prev].slice(0, 50));
    }, 500);
  }, []);

  const handleClearHistory = useCallback(() => setHistory([]), []);

  /* ---------------- Save history when camera stops ---------------- */

  useEffect(() => {
    if (!isCameraActive && translatedText) {
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        text: translatedText,
        timestamp: new Date(),
        mode: 'sign-to-text'
      };

      setHistory(prev => [entry, ...prev].slice(0, 50));

      setTranslatedText("");
      setCurrentPrediction(null);
      lastCharRef.current = "";
      predictionQueueRef.current = [];
    }
  }, [isCameraActive, translatedText]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Header isConnected={isConnected} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 flex flex-col sm:flex-row justify-between gap-4"
        >
          <ModeToggle mode={mode} onModeChange={setMode} />

          <div className="grid grid-cols-3 gap-3">
            <StatsCard icon={Hand} label="Signs" value={stats.signsDetected} color="primary" />
            <StatsCard icon={Type} label="Words" value={stats.wordsTranslated} color="accent" />
            <StatsCard
              icon={BarChart3}
              label="Accuracy"
              value={`${Math.round(stats.accuracy * 100)}%`}
              color="success"
            />
          </div>
        </motion.div>

        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <motion.div className="lg:col-span-2">
            {mode === 'sign-to-text' ? (
              <>
                <CameraFeed
                  onLandmarks={handleLandmarksDetected}
                  isActive={isCameraActive}
                  onToggle={() => setIsCameraActive(!isCameraActive)}
                />
                <PredictionDisplay
                  currentPrediction={currentPrediction}
                  translatedText={translatedText}
                  isDetecting={isCameraActive}
                />
              </>
            ) : (
              <TextToSign
                onTranslate={handleTextToSign}
                isTranslating={isTranslating}
                currentSignDisplay={textToSignInput}
              />
            )}
          </motion.div>

          <motion.div className="h-[600px]">
            <TranslationHistory history={history} onClear={handleClearHistory} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
