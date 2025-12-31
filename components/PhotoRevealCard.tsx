import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS } from '../constants';
import { Camera, X, Maximize2 } from 'lucide-react';

interface Props {
  images: string[];
  backgroundUrl?: string;
}

export const VintagePhotoGallery: React.FC<Props> = ({ images, backgroundUrl }) => {
  const bgImage = backgroundUrl || ASSETS.BG_PHOTO_BASE;
  const hasImages = images && images.length > 0;
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  return (
    <>
        <div className="relative w-full max-w-5xl mx-auto min-h-[500px] sm:min-h-[700px] perspective-1000 px-4 sm:px-0">
            
        {/* Background Frame Container */}
        <motion.div 
            className="absolute inset-0 w-full h-full rounded-lg shadow-deep overflow-hidden bg-vintage-dark border-4 border-vintage-gold/30 z-0 mx-4 sm:mx-0"
            initial={{ rotateX: 10, opacity: 0 }}
            whileInView={{ rotateX: 0, opacity: 1 }}
            transition={{ duration: 1.2 }}
        >
            <img 
                src={bgImage} 
                alt="Gallery Background" 
                className="w-full h-full object-cover opacity-100 brightness-90"
            />
            <div className="absolute inset-0 bg-black/20" />
        </motion.div>

        {/* Scattered Photos Layer */}
        <div className="relative z-10 w-full h-full p-4 sm:p-8 flex flex-wrap justify-center content-center items-center gap-4 sm:gap-8 min-h-[500px] sm:min-h-[700px]">
            
            {!hasImages && (
                <div className="flex flex-col items-center justify-center text-vintage-cream/50">
                    <Camera size={48} className="mb-4"/>
                    <p className="font-heading text-xl">No Memories Added Yet</p>
                </div>
            )}

            {images.map((img, index) => {
                // Randomize rotation slightly for scrapbook feel
                const randomRotate = (index % 2 === 0 ? 1 : -1) * ((index * 5) % 15 + 2);
                
                return (
                    <motion.div
                        key={index}
                        initial={{ scale: 0.5, opacity: 0, y: 100 }}
                        whileInView={{ scale: 1, opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.1, rotate: 0, zIndex: 50, transition: { duration: 0.3 } }}
                        onClick={() => setSelectedImg(img)}
                        transition={{ delay: index * 0.2, type: "spring", stiffness: 100 }}
                        className="relative bg-white p-2 sm:p-3 shadow-2xl rounded-sm transform-style-3d cursor-pointer group"
                        style={{ rotate: randomRotate, maxWidth: '140px' }} 
                        // Mobile: max-w-140px, Desktop: reset in style via class or just let it flow, but inline style overrides usually.
                        // Let's use a responsive class approach via style prop logic:
                    >
                         <div style={{ width: '100%', minWidth: '120px', maxWidth: '300px' }} className="w-[120px] sm:w-[250px] aspect-[3/4]">
                            {/* Tape Effect */}
                            <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-6 sm:h-8 bg-[#ffffdb]/80 opacity-80 backdrop-blur-sm shadow-sm z-20 rotate-1" />

                            <div className="w-full h-full overflow-hidden bg-gray-100 relative">
                                <img 
                                    src={img} 
                                    alt={`Memory ${index}`} 
                                    className="w-full h-full object-cover sepia-[0.2] contrast-110 group-hover:sepia-0 transition-all duration-500" 
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <Maximize2 className="text-white drop-shadow-md" size={24} />
                                </div>
                            </div>
                        </div>
                        
                        {/* Handwritten Date/Note simulation */}
                        <div className="mt-2 sm:mt-4 pb-1 sm:pb-2 text-center">
                            <p className="font-handwriting text-xl sm:text-2xl text-gray-600 truncate px-1">
                            Moment #{index + 1}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
        </div>

        {/* 3D Lightbox Modal */}
        <AnimatePresence>
            {selectedImg && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-0 sm:p-4 backdrop-blur-md"
                    onClick={() => setSelectedImg(null)}
                >
                    <motion.button 
                        className="absolute top-4 right-4 sm:top-8 sm:right-8 text-white/50 hover:text-white transition-colors z-50 bg-black/20 rounded-full p-2"
                        onClick={() => setSelectedImg(null)}
                    >
                        <X size={24} />
                    </motion.button>

                    <motion.div 
                        initial={{ rotateY: 90, scale: 0.5, opacity: 0 }}
                        animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                        exit={{ rotateY: -90, scale: 0.5, opacity: 0 }}
                        transition={{ type: "spring", damping: 15, stiffness: 100 }}
                        className="relative w-full h-full sm:max-w-4xl sm:h-auto sm:max-h-[90vh] bg-black sm:bg-white flex items-center justify-center sm:p-4 shadow-2xl rounded-none sm:rounded-sm sm:border-8 sm:border-white overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                         <img 
                            src={selectedImg} 
                            className="w-full h-auto max-h-screen sm:max-h-[85vh] object-contain rounded-sm" 
                            alt="Full view" 
                         />
                         <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-center sm:hidden">
                             <p className="font-heading text-white/90 tracking-widest text-xs uppercase">Tap to close</p>
                         </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </>
  );
};