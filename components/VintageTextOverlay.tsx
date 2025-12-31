import React from 'react';
import { ASSETS } from '../constants';
import { motion } from 'framer-motion';

interface Props {
  text: string;
  title?: string;
  backgroundUrl?: string;
  decorationUrl?: string;
}

export const VintageTextOverlay: React.FC<Props> = ({ text, title, backgroundUrl, decorationUrl }) => {
  const words = text.split(" ");
  const bgImage = backgroundUrl || ASSETS.BG_TEXT_BASE;

  return (
    <div className="relative w-full max-w-4xl mx-auto group perspective-1000 px-4 sm:px-0">
      
      {/* 3D Container Layer */}
      <motion.div 
        className="relative overflow-hidden rounded-md shadow-deep bg-[#e8dac0] transform-style-3d min-h-[500px] sm:min-h-[600px]"
        initial={{ rotateY: -2 }}
        whileInView={{ rotateY: 0 }}
        transition={{ duration: 1.5 }}
      >
        
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img 
            src={bgImage} 
            alt="Text Background" 
            className="w-full h-full object-cover opacity-100 contrast-110 saturate-50" 
          />
          <div className="absolute inset-0 bg-vintage-brown/10 mix-blend-multiply" />
        </div>

        {/* Custom Decoration (Flower/Sticker) */}
        {decorationUrl && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="absolute -top-6 -right-6 sm:-top-10 sm:-right-10 z-20 w-32 h-32 sm:w-48 sm:h-48 pointer-events-none mix-blend-multiply"
          >
             <img src={decorationUrl} className="w-full h-full object-contain rotate-12 drop-shadow-lg" alt="Decoration" />
          </motion.div>
        )}

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col items-center justify-center p-8 sm:p-24 text-center h-full">
          
          {/* Ornate Border */}
          <div className="absolute inset-4 sm:inset-6 border-2 border-vintage-ink/20 rounded-sm pointer-events-none" />
          <div className="absolute inset-6 sm:inset-8 border border-vintage-ink/10 rounded-sm pointer-events-none" />

          {title && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="mb-8 sm:mb-12 relative"
            >
                <h3 className="font-heading text-2xl sm:text-5xl text-vintage-ink tracking-[0.2em] uppercase">
                {title}
                </h3>
                <div className="w-16 sm:w-24 h-1 bg-vintage-gold mx-auto mt-4" />
            </motion.div>
          )}

          <div className="flex flex-wrap justify-center gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-2 leading-relaxed max-w-2xl relative z-10">
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, filter: 'blur(5px)' }}
                whileInView={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ delay: i * 0.04, duration: 1 }}
                className="font-handwriting text-4xl sm:text-6xl text-vintage-ink/90 drop-shadow-sm"
              >
                {word}
              </motion.span>
            ))}
          </div>
          
          {/* Animated Signature Stamp */}
          <motion.div 
            className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 opacity-80 mix-blend-multiply"
            initial={{ scale: 2, opacity: 0, rotate: 10 }}
            whileInView={{ scale: 1, opacity: 0.8, rotate: -10 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
          >
             <div className="w-20 h-20 sm:w-28 sm:h-28 border-[3px] border-vintage-brown rounded-full flex items-center justify-center bg-vintage-cream/10 backdrop-blur-sm">
                 <div className="text-center">
                    <span className="block font-heading text-[8px] sm:text-[10px] text-vintage-brown tracking-widest">SENT WITH</span>
                    <span className="block font-script text-lg sm:text-2xl text-vintage-dark">Love</span>
                    <span className="block font-heading text-[8px] sm:text-[10px] text-vintage-brown tracking-widest">2026</span>
                 </div>
             </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};