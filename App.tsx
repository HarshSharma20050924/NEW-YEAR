import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IntroGate } from './components/IntroGate';
import { VintageTextOverlay } from './components/VintageTextOverlay';
import { VintagePhotoGallery } from './components/PhotoRevealCard';
import { ScrollSection } from './components/ScrollSection';
import { DEFAULT_WISH, ASSETS } from './constants';
import { WishData } from './types';
import { saveWishToCloud, getWishFromCloud } from './firebase'; 
import { Upload, Music, Image as ImageIcon, Sparkles, Plus, Trash2, Check, CloudUpload, Loader2, Link as LinkIcon, AlertTriangle } from 'lucide-react';

// --- IMAGE COMPRESSION UTILITY ---
const compressImage = (file: File, isDecoration: boolean = false): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
             resolve(event.target?.result as string);
             return;
        }

        // Limit dimensions to 1200px to ensure reasonable payload size for Supabase JSONB
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        if (!isDecoration) {
            // For non-decorations (backgrounds, photos), use JPEG 0.8 for efficiency
            // Handle transparency by filling white background (destination-over draws behind existing content)
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0,0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
            // For decorations, preserve PNG transparency
            resolve(canvas.toDataURL('image/png'));
        }
      };
      // Fallback on error
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = () => resolve("");
  });
};

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Rewinding 2025...");
  
  // Audio State
  const [audioDuration, setAudioDuration] = useState(0);
  
  const [wishData, setWishData] = useState<WishData>({
    ...DEFAULT_WISH,
    galleryImages: []
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // 1. Loading Text Animation
  useEffect(() => {
    if (isLoading) {
        const phrases = [
            "Rewinding 2025...",
            "Collecting Precious Moments...",
            "Polishing Memories...",
            "Designing Your 2026...",
            "Almost There..."
        ];
        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % phrases.length;
            setLoadingText(phrases[i]);
        }, 1500);
        return () => clearInterval(interval);
    }
  }, [isLoading]);

  // 2. Check URL for ID (Cloud) or Params (Lite) and Load Data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wishId = params.get('id');
    const liteData = params.get('data'); 

    if (wishId) {
        setIsLoading(true);
        getWishFromCloud(wishId)
            .then((data) => {
                if (data) {
                    setWishData(prev => ({ ...prev, ...data }));
                } else {
                    console.log("Wish not found");
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    } else if (liteData) {
        try {
            const decoded = JSON.parse(atob(liteData));
            setWishData(prev => ({ ...prev, ...decoded }));
        } catch (e) {
            console.error("Failed to parse lite data");
        }
        setIsLoading(false);
    } else {
        const savedData = localStorage.getItem('vintage_wish_data_v1');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setWishData(prev => ({ ...prev, ...parsed }));
            } catch (e) {}
        }
        // Artificial delay if local to show off the animation briefly, or instant
        setTimeout(() => setIsLoading(false), 2000); 
    }
  }, []);

  // 3. Audio Logic
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.load();
    }
  }, []);

  const handleEnter = () => {
    setHasEntered(true);
    if (audioRef.current) {
        audioRef.current.currentTime = wishData.musicStartTime || 0;
        audioRef.current.volume = 0.5;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise
            .then(() => setIsPlaying(true))
            .catch(error => {
                console.warn("Auto-play prevented:", error);
            });
        }
    }
  };

  const handlePublish = async () => {
      setIsSaving(true);
      setSaveError(null);
      setShareLink(null); 
      
      try {
          const id = await saveWishToCloud(wishData);
          const url = `${window.location.origin}${window.location.pathname}?id=${id}`;
          setShareLink(url);
          window.history.pushState({}, '', `?id=${id}`);
      } catch (e: any) {
          console.error(e);
          setSaveError(`Save Failed: ${e.message || "Unknown Error"}`);
      } finally {
          setIsSaving(false);
      }
  };

  const handleCopyLink = () => {
      if(shareLink) {
        navigator.clipboard.writeText(shareLink).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        });
      }
  };

  const handleFileUpload = (field: keyof WishData) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Decoration requires transparency (PNG), others can be compressed to JPEG
      const isDecoration = field === 'decorationUrl';
      const compressed = await compressImage(file, isDecoration);
      setWishData(prev => ({ ...prev, [field]: compressed }));
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
       // Convert FileList to Array and process
       const fileArray = Array.from(files);
       const compressedImages: string[] = [];

       for (const file of fileArray) {
           // Gallery images generally don't need transparency, force JPEG for size
           const result = await compressImage(file, false);
           compressedImages.push(result);
       }
       
       setWishData(prev => ({
           ...prev,
           galleryImages: [...prev.galleryImages, ...compressedImages]
       }));
    }
  };

  const removeGalleryImage = (index: number) => {
      setWishData(prev => ({
          ...prev,
          galleryImages: prev.galleryImages.filter((_, i) => i !== index)
      }));
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setWishData(prev => ({ ...prev, musicUrl: result, musicStartTime: 0 }));
            if(audioRef.current) {
                audioRef.current.src = result;
            }
        }
        reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
      return (
          <div className="fixed inset-0 bg-vintage-dark flex flex-col items-center justify-center z-[100] p-4">
              <div className="relative">
                  <div className="w-24 h-24 border-4 border-vintage-gold/20 border-t-vintage-gold rounded-full animate-spin mb-8"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-vintage-gold/50 text-xs font-heading">2025</span>
                  </div>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.p 
                    key={loadingText}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="font-heading text-vintage-gold tracking-widest text-sm sm:text-lg text-center uppercase"
                >
                    {loadingText}
                </motion.p>
              </AnimatePresence>
          </div>
      )
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-fixed pointer-events-none transition-all duration-1000"
        style={{ 
            backgroundImage: wishData.globalBackgroundUrl ? `url(${wishData.globalBackgroundUrl})` : undefined,
            backgroundColor: '#2c1810'
        }}
      >
         <div className="absolute inset-0 bg-vintage-dark/40 mix-blend-multiply" />
      </div>

      <audio ref={audioRef} src={wishData.musicUrl || ASSETS.MUSIC_URL} loop preload="auto" />

      <AnimatePresence>
        {!hasEntered && (
          <IntroGate onEnter={handleEnter} />
        )}
      </AnimatePresence>

      <main className={`min-h-screen relative transition-opacity duration-1000 ${hasEntered ? 'opacity-100' : 'opacity-0'} overflow-x-hidden`}>
        
        {/* Particles */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {[...Array(15)].map((_, i) => (
                <motion.div 
                    key={i}
                    className="absolute rounded-full bg-vintage-gold/20 blur-sm"
                    initial={{ x: Math.random() * window.innerWidth, y: window.innerHeight + 100 }}
                    animate={{ 
                        y: -100,
                        x: `calc(${Math.random() * 100}vw)`, 
                        opacity: [0, 0.5, 0] 
                    }}
                    transition={{ 
                        duration: Math.random() * 20 + 20, 
                        repeat: Infinity, 
                        ease: "linear",
                        delay: Math.random() * 10
                    }}
                    style={{ width: Math.random() * 8 + 2, height: Math.random() * 8 + 2 }}
                />
            ))}
        </div>

        {/* --- CREATOR STUDIO --- */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="fixed inset-0 z-50 bg-vintage-dark/98 backdrop-blur-xl overflow-y-auto"
            >
              <div className="max-w-5xl mx-auto p-4 md:p-6 pb-32">
                 
                 {/* Header */}
                 <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-vintage-gold/20 pb-4 sticky top-0 bg-vintage-dark/95 z-10 pt-4 gap-4">
                    <h2 className="font-heading text-2xl md:text-3xl text-vintage-gold">Creator Studio</h2>
                    
                    <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center">
                        {shareLink ? (
                             <div className={`flex flex-col sm:flex-row items-center border rounded px-4 py-2 gap-2 sm:gap-4 animate-fadeIn bg-green-900/30 border-green-500/50`}>
                                <span className={`text-green-400 text-xs font-heading tracking-widest uppercase flex items-center gap-1`}>
                                    <Check size={14}/> 
                                    Saved!
                                </span>
                                <div className="flex items-center gap-2">
                                    <button onClick={handleCopyLink} className="flex items-center gap-2 text-white hover:text-green-300 transition-colors text-xs font-bold uppercase bg-white/10 px-3 py-1 rounded">
                                        {copySuccess ? <Check size={14}/> : <LinkIcon size={14}/>} {copySuccess ? 'Copied' : 'Copy'}
                                    </button>
                                    <button 
                                        onClick={() => setShareLink(null)} 
                                        className="ml-2 text-white/50 hover:text-white text-xs underline"
                                    >
                                        New
                                    </button>
                                </div>
                             </div>
                        ) : (
                            <button 
                                onClick={handlePublish}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-vintage-gold to-[#bfa12f] text-vintage-dark hover:brightness-110 transition-all font-heading text-sm tracking-widest uppercase font-bold shadow-lg rounded-sm"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={16}/> : <CloudUpload size={16}/>} 
                                {isSaving ? 'Saving...' : 'Publish'}
                            </button>
                        )}
                        
                        <button onClick={() => setIsEditing(false)} className="px-6 py-2 border border-vintage-gold text-vintage-gold hover:bg-vintage-gold hover:text-vintage-dark transition-colors font-heading text-sm tracking-widest uppercase rounded-sm">
                            Close
                        </button>
                    </div>
                 </div>
                 
                 {/* Error Message Display */}
                 {saveError && (
                    <div className="bg-red-900/20 border border-red-500/30 p-3 rounded mb-4 flex items-center gap-3 text-red-200 text-sm">
                        <AlertTriangle size={16} />
                        <span>{saveError}</span>
                    </div>
                 )}

                 {/* Editor Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {/* Left Col: Content */}
                    <div className="space-y-8">
                        <h3 className="font-heading text-xl text-vintage-cream mb-4 flex items-center gap-2"><PenToolIcon /> Content</h3>
                        <div className="group">
                            <label className="block text-vintage-gold/60 text-xs tracking-widest uppercase mb-2">Recipient Name</label>
                            <input 
                                type="text" 
                                value={wishData.recipient}
                                onChange={(e) => setWishData({...wishData, recipient: e.target.value})}
                                className="w-full bg-white/5 border-b border-vintage-gold/30 text-vintage-cream p-2 font-handwriting text-3xl focus:outline-none focus:border-vintage-gold"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-vintage-gold/60 text-xs tracking-widest uppercase mb-2">Message</label>
                            <textarea 
                                value={wishData.message}
                                onChange={(e) => setWishData({...wishData, message: e.target.value})}
                                rows={4}
                                className="w-full bg-white/5 border border-vintage-gold/30 text-vintage-cream p-4 font-body text-lg focus:outline-none focus:border-vintage-gold rounded-sm"
                            />
                        </div>
                        
                        {/* Audio Section */}
                        <div className="bg-white/5 p-6 rounded-lg border border-vintage-gold/10">
                            <h3 className="font-heading text-xl text-vintage-cream mb-4 flex items-center gap-2"><Music size={18} /> Soundtrack</h3>
                            <div className="mb-4">
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-vintage-gold/10 hover:bg-vintage-gold/20 text-vintage-gold rounded transition-colors border border-vintage-gold/30">
                                    <Upload size={14} /> Upload Song
                                    <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                                </label>
                            </div>
                            
                            {wishData.musicUrl && (
                                <div>
                                    <p className="text-xs text-vintage-gold/60 mb-2 uppercase tracking-wider">Start Position: {Math.floor(wishData.musicStartTime || 0)}s</p>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max={audioDuration || 100} 
                                        step="1"
                                        value={wishData.musicStartTime || 0}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setWishData(prev => ({ ...prev, musicStartTime: val }));
                                            if (audioRef.current) {
                                                audioRef.current.currentTime = val;
                                            }
                                        }}
                                        className="w-full h-2 bg-vintage-dark rounded-lg appearance-none cursor-pointer accent-vintage-gold"
                                    />
                                    <div className="flex justify-between text-[10px] text-vintage-gold/40 mt-1">
                                        <span>0:00</span>
                                        <span>End</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Col: Visuals */}
                    <div className="space-y-8">
                        <h3 className="font-heading text-xl text-vintage-cream mb-4 flex items-center gap-2"><ImageIcon size={18}/> Visuals</h3>
                        
                        {/* GLOBAL BG */}
                        <div className="space-y-2 p-4 border border-vintage-gold/30 rounded bg-white/5">
                            <label className="block text-vintage-gold font-bold text-xs tracking-widest uppercase mb-2">Full Website Background</label>
                            <label className="cursor-pointer flex items-center justify-center w-full h-24 border-2 border-dashed border-vintage-gold/30 hover:bg-vintage-gold/10 rounded transition-colors">
                                <span className="text-vintage-gold/60 text-xs uppercase flex items-center gap-2"><Upload size={14}/> Replace Global Background</span>
                                <input type="file" accept="image/*" onChange={handleFileUpload('globalBackgroundUrl')} className="hidden" />
                            </label>
                            {wishData.globalBackgroundUrl && <p className="text-xs text-green-400">Custom background active</p>}
                        </div>

                        {/* Text Background */}
                        <div className="space-y-2">
                            <label className="block text-vintage-gold/60 text-xs tracking-widest uppercase">Text Section Background</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-vintage-cream/10 rounded overflow-hidden border border-vintage-gold/20">
                                    <img src={wishData.textSectionBgUrl || ASSETS.BG_TEXT_BASE} className="w-full h-full object-cover" alt="prev" />
                                </div>
                                <label className="cursor-pointer px-4 py-2 bg-vintage-gold/10 hover:bg-vintage-gold/20 text-vintage-gold rounded transition-colors text-xs uppercase tracking-widest border border-vintage-gold/30">
                                    Change Parchment
                                    <input type="file" accept="image/*" onChange={handleFileUpload('textSectionBgUrl')} className="hidden" />
                                </label>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="space-y-2">
                            <label className="block text-vintage-gold/60 text-xs tracking-widest uppercase">Decoration (Flower/Sticker)</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-vintage-cream/10 rounded overflow-hidden border border-vintage-gold/20 flex items-center justify-center">
                                    {wishData.decorationUrl ? <img src={wishData.decorationUrl} className="w-full h-full object-contain" alt="prev" /> : <Sparkles className="text-vintage-gold/30"/>}
                                </div>
                                <label className="cursor-pointer px-4 py-2 bg-vintage-gold/10 hover:bg-vintage-gold/20 text-vintage-gold rounded transition-colors text-xs uppercase tracking-widest border border-vintage-gold/30">
                                    Add Flower
                                    <input type="file" accept="image/*" onChange={handleFileUpload('decorationUrl')} className="hidden" />
                                </label>
                            </div>
                        </div>

                         {/* Photo Gallery Frame BG */}
                         <div className="space-y-2">
                            <label className="block text-vintage-gold/60 text-xs tracking-widest uppercase">Photo Section Background</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-vintage-cream/10 rounded overflow-hidden border border-vintage-gold/20">
                                    <img src={wishData.photoSectionBgUrl || ASSETS.BG_PHOTO_BASE} className="w-full h-full object-cover" alt="prev" />
                                </div>
                                <label className="cursor-pointer px-4 py-2 bg-vintage-gold/10 hover:bg-vintage-gold/20 text-vintage-gold rounded transition-colors text-xs uppercase tracking-widest border border-vintage-gold/30">
                                    Change Frame
                                    <input type="file" accept="image/*" onChange={handleFileUpload('photoSectionBgUrl')} className="hidden" />
                                </label>
                            </div>
                        </div>

                        {/* GALLERY IMAGES */}
                        <div className="space-y-2">
                            <label className="block text-vintage-gold/60 text-xs tracking-widest uppercase mb-2">Your Memories (Gallery)</label>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                {wishData.galleryImages.map((img, i) => (
                                    <div key={i} className="relative aspect-square group">
                                        <img src={img} className="w-full h-full object-cover rounded border border-vintage-gold/20" alt={`upload-${i}`} />
                                        <button 
                                            onClick={() => removeGalleryImage(i)}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                                <label className="aspect-square border-2 border-dashed border-vintage-gold/30 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-vintage-gold/10 transition-colors">
                                    <Plus className="text-vintage-gold mb-1" />
                                    <span className="text-[10px] text-vintage-gold uppercase">Add</span>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        multiple
                                        onChange={handleGalleryUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- SCROLL CONTENT --- */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 pb-32">
           <div className="min-h-[60vh] flex flex-col items-center justify-center pt-24 mb-12 sm:mb-24 relative overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hasEntered ? 0.4 : 0 }}
                    transition={{ duration: 2, delay: 1 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    <div className="w-[300px] h-[300px] sm:w-[800px] sm:h-[800px] bg-vintage-gold/10 rounded-full blur-[60px] sm:blur-[100px]" />
                </motion.div>

                <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: hasEntered ? 1 : 0 }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                    className="w-16 sm:w-32 h-[2px] bg-vintage-gold mx-auto mb-4 sm:mb-8 relative z-10"
                />
                
                <div className="overflow-hidden relative z-10 text-center">
                    <motion.h1 
                        initial={{ y: 200, opacity: 0, rotate: 5 }}
                        animate={{ y: hasEntered ? 0 : 200, opacity: hasEntered ? 1 : 0, rotate: hasEntered ? 0 : 5 }}
                        transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                        className="font-heading text-6xl sm:text-9xl lg:text-[12rem] text-vintage-cream mb-4 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] leading-none tracking-tighter"
                    >
                        2026
                    </motion.h1>
                </div>

                <motion.p 
                    initial={{ opacity: 0, letterSpacing: "0em" }}
                    animate={{ opacity: hasEntered ? 1 : 0, letterSpacing: hasEntered ? "0.2em" : "0em" }}
                    transition={{ duration: 2, delay: 1.5 }}
                    className="font-heading text-sm sm:text-xl lg:text-2xl text-vintage-gold uppercase text-center"
                >
                    Happy New Year
                </motion.p>
            </div>

          <ScrollSection>
             <VintageTextOverlay 
                title={`For ${wishData.recipient}`}
                text={wishData.message}
                backgroundUrl={wishData.textSectionBgUrl}
                decorationUrl={wishData.decorationUrl}
             />
          </ScrollSection>

          <div className="h-24 sm:h-48 flex items-center justify-center my-8 sm:my-12 opacity-40">
               <img src="https://cdn-icons-png.flaticon.com/512/44/44654.png" className="w-6 h-6 sm:w-8 sm:h-8 opacity-50 invert" alt="separator" />
          </div>

          <ScrollSection>
            <VintagePhotoGallery 
               images={wishData.galleryImages}
               backgroundUrl={wishData.photoSectionBgUrl}
            />
          </ScrollSection>

          <div className="h-48"></div>
        </div>

        <footer className="w-full py-8 text-center fixed bottom-0 left-0 z-20 pointer-events-none mix-blend-difference">
           <button 
                onClick={() => setIsEditing(true)} 
                className="pointer-events-auto font-heading text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.5em] text-vintage-gold/30 hover:text-vintage-gold/80 transition-all duration-700 uppercase"
            >
                2026
            </button>
        </footer>
      </main>
    </>
  );
}

// Icon helper
const PenToolIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
);