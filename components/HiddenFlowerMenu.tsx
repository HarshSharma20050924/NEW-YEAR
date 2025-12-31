import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, PenTool, Share2, Pause, Play } from 'lucide-react';
import { ASSETS } from '../constants';

interface Props {
  onEdit: () => void;
  onShare: () => void;
  isPlaying: boolean;
  togglePlay: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const HiddenFlowerMenu: React.FC<Props> = ({ onEdit, onShare, isPlaying, togglePlay, audioRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMusicControls, setShowMusicControls] = useState(false);

  // Seek bar logic
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const time = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = time;
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-50 flex items-end">
      {/* The Music Control Panel (Blooms out to the right) */}
      <AnimatePresence>
        {showMusicControls && (
          <motion.div
            initial={{ opacity: 0, width: 0, x: -20 }}
            animate={{ opacity: 1, width: 'auto', x: 0 }}
            exit={{ opacity: 0, width: 0, x: -20 }}
            className="mb-4 ml-2 p-4 bg-vintage-cream/90 backdrop-blur-md rounded-lg shadow-paper border border-vintage-gold/30 flex items-center gap-4 overflow-hidden"
          >
             <button onClick={togglePlay} className="text-vintage-dark hover:text-vintage-gold">
               {isPlaying ? <Pause size={18} /> : <Play size={18} />}
             </button>
             <div className="flex flex-col w-32">
                <span className="text-[10px] font-heading text-vintage-dark/60 tracking-wider mb-1">ATMOSPHERE</span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue="0"
                  onChange={handleSeek}
                  className="h-1 bg-vintage-gold/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-vintage-gold [&::-webkit-slider-thumb]:rounded-full"
                />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Main Flower Trigger */}
      <div className="relative group">
        
        {/* Action Petals */}
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Music Petal */}
                    <motion.button
                        initial={{ opacity: 0, y: 0, x: 0 }}
                        animate={{ opacity: 1, y: -80, x: 10 }}
                        exit={{ opacity: 0, y: 0, x: 0 }}
                        onClick={() => setShowMusicControls(!showMusicControls)}
                        className="absolute bottom-0 left-0 w-12 h-12 bg-vintage-dark text-vintage-gold rounded-full shadow-lg flex items-center justify-center border border-vintage-gold/50 hover:bg-vintage-brown transition-colors z-0"
                    >
                        <Music size={18} />
                    </motion.button>

                    {/* Edit Petal */}
                    <motion.button
                        initial={{ opacity: 0, y: 0, x: 0 }}
                        animate={{ opacity: 1, y: -60, x: 60 }}
                        exit={{ opacity: 0, y: 0, x: 0 }}
                        onClick={onEdit}
                        className="absolute bottom-0 left-0 w-12 h-12 bg-vintage-dark text-vintage-gold rounded-full shadow-lg flex items-center justify-center border border-vintage-gold/50 hover:bg-vintage-brown transition-colors z-0"
                    >
                        <PenTool size={18} />
                    </motion.button>

                    {/* Share Petal */}
                    <motion.button
                        initial={{ opacity: 0, y: 0, x: 0 }}
                        animate={{ opacity: 1, y: 0, x: 80 }}
                        exit={{ opacity: 0, y: 0, x: 0 }}
                        onClick={onShare}
                        className="absolute bottom-0 left-0 w-12 h-12 bg-vintage-dark text-vintage-gold rounded-full shadow-lg flex items-center justify-center border border-vintage-gold/50 hover:bg-vintage-brown transition-colors z-0"
                    >
                        <Share2 size={18} />
                    </motion.button>
                </>
            )}
        </AnimatePresence>

        {/* The Flower Center (Toggle) */}
        <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center bg-transparent focus:outline-none"
        >
             {/* Using a custom SVG or Image for the flower to look really aesthetic */}
             <div className="w-full h-full relative">
                 <img 
                    src="https://images.unsplash.com/photo-1596436570678-7965416f9c96?q=80&w=200&auto=format&fit=crop" 
                    alt="Flower Menu" 
                    className="w-full h-full object-cover rounded-full border-2 border-vintage-cream shadow-2xl sepia hover:sepia-0 transition-all duration-500"
                 />
                 <div className="absolute inset-0 rounded-full border border-vintage-gold/30 animate-ping opacity-20"></div>
             </div>
        </motion.button>
      </div>
    </div>
  );
};
