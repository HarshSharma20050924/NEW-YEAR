import React from 'react';
import { motion } from 'framer-motion';
import { ASSETS } from '../constants';

interface Props {
  onEnter: () => void;
}

export const IntroGate: React.FC<Props> = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black text-vintage-cream">
        
        {/* Left Curtain */}
        <motion.div 
            initial={{ x: 0 }}
            exit={{ x: '-100%', transition: { duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] } }}
            className="absolute inset-y-0 left-0 w-1/2 bg-vintage-dark border-r border-vintage-gold/20 z-20 flex items-center justify-end pr-8 shadow-[10px_0_50px_rgba(0,0,0,0.5)]"
        >
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] mix-blend-overlay"></div>
        </motion.div>

        {/* Right Curtain */}
        <motion.div 
            initial={{ x: 0 }}
            exit={{ x: '100%', transition: { duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] } }}
            className="absolute inset-y-0 right-0 w-1/2 bg-vintage-dark border-l border-vintage-gold/20 z-20 flex items-center justify-start pl-8 shadow-[-10px_0_50px_rgba(0,0,0,0.5)]"
        >
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] mix-blend-overlay"></div>
        </motion.div>

        {/* Center Content (stays and scales out) */}
        <motion.div 
            className="relative z-30 flex flex-col items-center cursor-pointer group"
            onClick={onEnter}
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)', transition: { duration: 1 } }}
        >
            <motion.div
                animate={{ 
                    boxShadow: ['0 0 20px rgba(212, 175, 55, 0.2)', '0 0 60px rgba(212, 175, 55, 0.6)', '0 0 20px rgba(212, 175, 55, 0.2)']
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-64 h-64 rounded-full border border-vintage-gold/30 flex items-center justify-center bg-black/40 backdrop-blur-sm relative overflow-hidden"
            >
                 <img src={ASSETS.BG_PHOTO_BASE} className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale mix-blend-overlay" alt="texture" />
                 
                 <div className="text-center">
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="font-heading text-xs tracking-[0.4em] text-vintage-gold mb-2"
                    >
                        EST. 2026
                    </motion.p>
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="font-script text-6xl text-vintage-cream"
                    >
                        Enter
                    </motion.h1>
                 </div>
            </motion.div>
            
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1.5 }}
                className="mt-8 font-heading text-xs tracking-widest text-vintage-gold/60 uppercase"
            >
                Touch to Begin
            </motion.p>
        </motion.div>
    </div>
  );
};
