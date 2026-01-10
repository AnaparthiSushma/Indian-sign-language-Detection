import { motion } from 'framer-motion';
import { Hand, Wifi, Settings, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeaderProps {
  isConnected: boolean;
}

const Header = ({ isConnected }: HeaderProps) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-lg">
            <Hand className="w-6 h-6 text-primary-foreground" />
          </div>
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-background"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-gradient">
            Gesture Bridge
          </h1>
          <p className="text-sm text-muted-foreground">
            Indian Sign Language Translator
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isConnected ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
            }`}>
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Backend API Status</p>
          </TooltipContent>
        </Tooltip>

        {/* Info Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Info className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>About Gesture Bridge</p>
          </TooltipContent>
        </Tooltip>

        {/* Settings Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </motion.header>
  );
};

export default Header;
