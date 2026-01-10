import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Sparkles, TrendingUp } from 'lucide-react';

interface Prediction {
  text: string;
  confidence: number;
  type: 'letter' | 'word' | 'gesture';
  timestamp: Date;
}

interface PredictionDisplayProps {
  currentPrediction: Prediction | null;
  translatedText: string;
  isDetecting: boolean;
}

const PredictionDisplay = ({ currentPrediction, translatedText, isDetecting }: PredictionDisplayProps) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-success';
    if (confidence >= 0.5) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="glass-panel-strong p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Hand className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Live Detection</h2>
          <p className="text-sm text-muted-foreground">
            {isDetecting ? 'Analyzing gestures...' : 'Start camera to begin'}
          </p>
        </div>
      </div>

      {/* Current Prediction */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Current Sign
        </p>
        <AnimatePresence mode="wait">
          {currentPrediction ? (
            <motion.div
              key={currentPrediction.text}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glow-border rounded-xl p-4 bg-secondary"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl font-display font-bold text-gradient">
                  {currentPrediction.text}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  currentPrediction.type === 'word' ? 'bg-accent/20 text-accent' : 
                  currentPrediction.type === 'gesture' ? 'bg-info/20 text-info' : 
                  'bg-primary/20 text-primary'
                }`}>
                  {currentPrediction.type}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 confidence-bar">
                  <motion.div
                    className={`confidence-bar-fill ${getConfidenceColor(currentPrediction.confidence)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${currentPrediction.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {Math.round(currentPrediction.confidence * 100)}%
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl p-4 bg-secondary/50 border border-dashed border-muted text-center"
            >
              <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                No gesture detected
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Translated Text */}
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Translated Text
        </p>
        <div className="h-32 rounded-xl bg-secondary/50 p-4 overflow-y-auto scrollbar-thin">
          {translatedText ? (
            <motion.p
              className="text-lg font-medium leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {translatedText}
              <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-pulse" />
            </motion.p>
          ) : (
            <p className="text-muted-foreground italic">
              Your translated text will appear here...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionDisplay;
