import { motion } from 'framer-motion';
import { History, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HistoryEntry {
  id: string;
  text: string;
  timestamp: Date;
  mode: 'sign-to-text' | 'text-to-sign';
}

interface TranslationHistoryProps {
  history: HistoryEntry[];
  onClear: () => void;
}

const TranslationHistory = ({ history, onClear }: TranslationHistoryProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold">History</h3>
        </div>
        {history.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClear}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {history.length > 0 ? (
          <div className="space-y-2">
            {history.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="history-item"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium flex-1 line-clamp-2">
                    {entry.text}
                  </p>
                  <span className={`px-2 py-0.5 text-xs rounded-full shrink-0 ${
                    entry.mode === 'sign-to-text' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-accent/20 text-accent'
                  }`}>
                    {entry.mode === 'sign-to-text' ? 'S→T' : 'T→S'}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatTime(entry.timestamp)}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <History className="w-10 h-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              No translation history yet
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default TranslationHistory;
