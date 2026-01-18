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
  const [translatedText, setTranslatedText] = useState<string>("");

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [textToSignInput, setTextToSignInput] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const [stats, setStats] = useState({
    signsDetected: 0,
    wordsTranslated: 0,
    accuracy: 0.98
  });

  const frameCountRef = useRef(0);
  const predictionQueueRef = useRef<string[]>([]);
  const lastCharRef = useRef<string>("");
  const lastPredictionTimeRef = useRef<number>(Date.now());

  const clearAll = useCallback(() => {
    setTranslatedText("");
    setCurrentPrediction(null);
    lastCharRef.current = "";
    predictionQueueRef.current = [];
    frameCountRef.current = 0;
    console.log("🧹 Cleared all predictions");
  }, []);

  const handleLandmarksDetected = useCallback(
    async (flatLandmarks: number[] | null) => {
      if (!flatLandmarks || flatLandmarks.length !== 126) return;

      frameCountRef.current++;
      if (frameCountRef.current % 3 !== 0) return;

      try {
        const result = await predictLandmarks(flatLandmarks);
        if (!result || !result.label || result.confidence < 0.6) return;

        lastPredictionTimeRef.current = Date.now();

        const queue = predictionQueueRef.current;
        queue.push(result.label);
        if (queue.length > 4) queue.shift();

        const stableCount = queue.filter(v => v === result.label).length;
        if (stableCount < 1) return;

        if (result.label === lastCharRef.current) return;
        lastCharRef.current = result.label;

        setCurrentPrediction({
          text: result.label,
          confidence: result.confidence,
          type: 'letter',
          timestamp: new Date()
        });

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

  // Auto-space on pause
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (
        isCameraActive &&
        translatedText.length > 0 &&
        now - lastPredictionTimeRef.current > 2000 &&
        !translatedText.endsWith(" ")
      ) {
        setTranslatedText(prev => prev + " ");
        lastCharRef.current = "";
      }
    }, 300);

    return () => clearInterval(interval);
  }, [isCameraActive, translatedText]);

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

        {/* MODE + STATS */}
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

        {/* MAIN GRID */}
        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            {mode === 'sign-to-text' ? (
              <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
                <CameraFeed
                  onLandmarks={handleLandmarksDetected}
                  isActive={isCameraActive}
                  onToggle={() => setIsCameraActive(!isCameraActive)}
                />

                <div className="flex justify-end">
                  <button
                    onClick={clearAll}
                    className="px-4 py-2 rounded-md bg-destructive text-white text-sm hover:opacity-90"
                  >
                    Clear
                  </button>
                </div>

                <PredictionDisplay
                  currentPrediction={currentPrediction}
                  translatedText={translatedText}
                  isDetecting={isCameraActive}
                />
              </div>
            ) : (
              <TextToSign
                onTranslate={handleTextToSign}
                isTranslating={isTranslating}
                currentSignDisplay={textToSignInput}
              />
            )}
          </motion.div>

          {/* RIGHT COLUMN */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="h-[600px]"
          >
            <TranslationHistory
              history={history}
              onClear={handleClearHistory}
            />
          </motion.div>
        </div>

        {/* FOOTER */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center text-sm text-muted-foreground"
        >
          Powered by MediaPipe & Machine Learning •{" "}
          <span className="text-primary">Gesture Bridge</span> • Indian Sign Language
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
