import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Mic, MicOff, Hand, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TextToSignProps {
  onTranslate: (text: string) => void;
  isTranslating: boolean;
  currentSignDisplay: string | null;
}

const TextToSign = ({ onTranslate, isTranslating, currentSignDisplay }: TextToSignProps) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = () => {
    if (inputText.trim()) {
      onTranslate(inputText.trim());
    }
  };

  const toggleSpeechRecognition = () => {
    if (!isListening) {
      // Check for speech recognition support
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
        };
        recognition.onerror = () => setIsListening(false);

        recognition.start();
      } else {
        alert('Speech recognition is not supported in this browser.');
      }
    } else {
      setIsListening(false);
    }
  };

  // Alphabet to simple hand representation
  const getHandEmoji = (letter: string): string => {
    const handSigns: Record<string, string> = {
      'A': '✊', 'B': '🤚', 'C': '🤏', 'D': '☝️', 'E': '✊',
      'F': '🤌', 'G': '🤙', 'H': '🤟', 'I': '🤙', 'J': '🤙',
      'K': '✌️', 'L': '🤟', 'M': '🤜', 'N': '🤜', 'O': '👌',
      'P': '👇', 'Q': '👇', 'R': '🤞', 'S': '✊', 'T': '✊',
      'U': '🤞', 'V': '✌️', 'W': '🤟', 'X': '🤙', 'Y': '🤙',
      'Z': '☝️', ' ': '  '
    };
    return handSigns[letter.toUpperCase()] || '🤚';
  };

  return (
    <div className="glass-panel-strong p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Text to Sign</h2>
          <p className="text-sm text-muted-foreground">
            Convert text or speech to sign language
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="relative mb-4">
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or speak your message..."
          className="min-h-[100px] pr-24 resize-none bg-secondary border-muted focus:border-accent"
        />
        <div className="absolute bottom-3 right-3 flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleSpeechRecognition}
            className={isListening ? 'text-destructive animate-pulse-soft' : 'text-muted-foreground'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!inputText.trim() || isTranslating}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isTranslating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Sign Display */}
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Sign Output
        </p>
        <div className="h-full min-h-[150px] rounded-xl bg-secondary/50 p-4 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {currentSignDisplay ? (
              <motion.div
                key={currentSignDisplay}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {currentSignDisplay.split('').map((char, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-4xl mb-1">{getHandEmoji(char)}</span>
                      <span className="text-xs text-muted-foreground uppercase font-medium">
                        {char === ' ' ? '␣' : char}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Play Animation
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <Hand className="w-12 h-12 text-muted-foreground/40 mx-auto mb-2 animate-float" />
                <p className="text-muted-foreground">
                  Enter text to see sign language output
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TextToSign;
