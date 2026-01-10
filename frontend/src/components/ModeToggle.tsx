import { motion } from 'framer-motion';
import { Hand, MessageSquare, ArrowLeftRight } from 'lucide-react';

type TranslationMode = 'sign-to-text' | 'text-to-sign';

interface ModeToggleProps {
  mode: TranslationMode;
  onModeChange: (mode: TranslationMode) => void;
}

const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  return (
    <div className="glass-panel p-1 inline-flex items-center gap-1">
      <button
        onClick={() => onModeChange('sign-to-text')}
        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
          mode === 'sign-to-text' 
            ? 'text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {mode === 'sign-to-text' && (
          <motion.div
            layoutId="activeMode"
            className="absolute inset-0 bg-primary rounded-lg"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          />
        )}
        <Hand className="w-4 h-4 relative z-10" />
        <span className="relative z-10 hidden sm:inline">Sign to Text</span>
      </button>

      <div className="w-px h-6 bg-border" />

      <button
        onClick={() => onModeChange('text-to-sign')}
        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
          mode === 'text-to-sign' 
            ? 'text-accent-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {mode === 'text-to-sign' && (
          <motion.div
            layoutId="activeMode"
            className="absolute inset-0 bg-accent rounded-lg"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          />
        )}
        <MessageSquare className="w-4 h-4 relative z-10" />
        <span className="relative z-10 hidden sm:inline">Text to Sign</span>
      </button>
    </div>
  );
};

export default ModeToggle;
