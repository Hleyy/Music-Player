"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  Repeat, Shuffle, UploadCloud, Disc 
} from 'lucide-react';

// Ajout d'une propriété 'color' pour le Dynamic Glow
const TRACKS = [
  { title: "No lie", artist: "Sean Paul", cover: "/images/fern.gif", src: "/songs/no lie.mp3", color: "#7c3aed" },
  { title: "Too sweet", artist: "Hozier", cover: "/images/fern.gif", src: "/songs/too sweet.mp3", color: "#3b82f6" },
  { title: "Just The Two of Us", artist: "Bill Withers et Grover Washington", cover: "/images/fern.gif", src: "/songs/just the two of us.mp3", color: "#eab308" },
  { title: "Shinunoga E-Wa", artist: "Fujii Kaze", cover: "/images/fern.gif", src: "/songs/shino.mp3", color: "#ef4444" },
  { title: "Collide", artist: "Justine Skye", cover: "/images/fern.gif", src: "/songs/collide.mp3", color: "#ec4899" },
  { title: "Merry go round", artist: "YAØ", cover: "/images/fern.gif", src: "/songs/Merry_go_round.mp3", color: "#10b981" },
  { title: "Double Tale", artist: "Dhruv", cover: "/images/fern.gif", src: "/songs/double_take.mp3", color: "#6366f1" },
  { title: "Love Is Gone", artist: "Dylan Matthew", cover: "/images/fern.gif", src: "/songs/love_is_gone.mp3", color: "#f43f5e" },
  { title: "God Rest Ye Merry Gentlemen", artist: "Pentatonix", cover: "/images/fern.gif", src: "/songs/god_rest_ye_marry.mp3", color: "#06b6d4" },
  { title: "Until I Found You", artist: "Stephen Sanchez", cover: "/images/fern.gif", src: "/songs/i_found_her.mp3", color: "#f97316" }
];

export default function ZenkaMasterPlayer() {
  // --- ÉTATS AUDIO ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  // --- ÉTATS IA & LYRICS ---
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [lyrics, setLyrics] = useState([]); 

  const audioRef = useRef(null);
  const currentTrack = TRACKS[currentTrackIndex];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 45, damping: 20 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 50;
      const y = (e.clientY / window.innerHeight - 0.5) * 50;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  // --- LOGIQUE AUDIO ---
  useEffect(() => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.play().catch(() => setIsPlaying(false)) : audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const onTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };

  const nextTrack = () => {
    setLyrics([]);
    if (isShuffle) {
      setCurrentTrackIndex(Math.floor(Math.random() * TRACKS.length));
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    }
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setLyrics([]);
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const activeLine = lyrics.findLast((line) => line.time <= currentTime);

  // --- UPLOAD IA ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsTranscribing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await response.json();
      if (data.lyrics) {
        setLyrics(data.lyrics);
        const url = URL.createObjectURL(file);
        if (audioRef.current) {
          audioRef.current.src = url;
          setIsPlaying(true);
        }
      } else if (data.error) {
        alert("Erreur Quota : Vérifiez votre compte OpenAI.");
      }
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (time) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center overflow-hidden relative font-sans text-white p-4">
      <audio 
        ref={audioRef} 
        src={currentTrack.src} 
        onTimeUpdate={onTimeUpdate} 
        loop={isLooping} 
        onEnded={() => !isLooping && nextTrack()} 
      />

      <motion.div 
        style={{ x: smoothX, y: smoothY, scale: 1.2 }} 
        className="absolute inset-0 z-0"
      >
        <motion.div 
          animate={{ backgroundColor: currentTrack.color }}
          transition={{ duration: 1.5 }}
          className="absolute top-1/4 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] opacity-20 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ backgroundColor: currentTrack.color }}
          transition={{ duration: 1.5 }}
          className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] opacity-10 blur-[140px] rounded-full" 
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
      </motion.div>

)      <motion.div 
        style={{ 
          x: useSpring(mouseX, {stiffness: 120, damping: 30}), 
          y: useSpring(mouseY, {stiffness: 120, damping: 30}) 
        }}
        className="z-10 w-full max-w-[90%] sm:max-w-md bg-white/[0.02] backdrop-blur-3xl border border-white/10 p-6 sm:p-10 rounded-[3rem] sm:rounded-[4rem] shadow-2xl"
      >
        {/* PAROLES KARAOKÉ */}
        <div className="h-24 sm:h-28 flex items-center justify-center mb-4 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeLine?.text || 'default'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg sm:text-2xl font-light italic bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent px-2"
            >
              {activeLine ? activeLine.text : "♪ Zenka Intelligence ♪"}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* VINYL ROTATIF */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-8 sm:mb-10">
          <motion.div 
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-full h-full rounded-full p-1 bg-gradient-to-tr from-white/10 to-transparent shadow-2xl relative"
          >
            <img src={currentTrack.cover} alt="Cover" className="w-full h-full object-cover rounded-full" />
            <div className="absolute inset-0 bg-black/20 rounded-full border-[10px] sm:border-[12px] border-white/5" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-[#030306] rounded-full border-4 border-white/10 flex items-center justify-center">
               <Disc size={16} className="text-white/20 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </motion.div>
        </div>

        {/* INFOS MUSIQUE */}
        <div className="text-center mb-6 sm:mb-8">
          <motion.h2 key={currentTrack.title} initial={{y:5, opacity:0}} animate={{y:0, opacity:1}} className="text-white text-lg sm:text-xl font-bold tracking-tight">
            {currentTrack.title}
          </motion.h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">{currentTrack.artist}</p>
          <p className="text-purple-400/50 text-[9px] mt-2 font-medium tracking-[0.2em] uppercase">
            Special thanks to Yussii_ ✨
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="mb-6 sm:mb-8">
          <div className="h-1.5 w-full bg-white/5 rounded-full cursor-pointer relative overflow-hidden" 
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
               }}>
            <motion.div 
              style={{ width: `${(currentTime / duration) * 100}%` }}
              className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            />
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-mono text-white/20 tracking-tighter">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* CONTRÔLES */}
        <div className="flex items-center justify-between mb-8 sm:mb-10 px-2">
          <button onClick={() => setIsShuffle(!isShuffle)} className={`transition-all ${isShuffle ? "text-blue-400 scale-110" : "text-white/20 hover:text-white"}`}>
            <Shuffle size={18}/>
          </button>
          
          <div className="flex items-center gap-4 sm:gap-8">
            <button onClick={prevTrack} className="hover:scale-110 active:scale-95 transition-all"><SkipBack size={24} fill="currentColor"/></button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center text-black shadow-xl"
            >
              {isPlaying ? <Pause size={28} fill="black"/> : <Play size={28} fill="black" className="ml-1"/>}
            </motion.button>
            <button onClick={nextTrack} className="hover:scale-110 active:scale-95 transition-all"><SkipForward size={24} fill="currentColor"/></button>
          </div>

          <button onClick={() => setIsLooping(!isLooping)} className={`transition-all ${isLooping ? "text-purple-500 scale-110" : "text-white/20 hover:text-white"}`}>
            <Repeat size={18}/>
          </button>
        </div>

        {/* VOLUME (Touch Friendly) */}
        <div className="flex items-center gap-4 bg-white/5 p-3 sm:p-4 rounded-2xl sm:rounded-[2rem] border border-white/5">
          <button onClick={() => setIsMuted(!isMuted)}>
            {isMuted || volume === 0 ? <VolumeX size={18} className="text-red-400"/> : <Volume2 size={18} className="text-white/40"/>}
          </button>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-white/10 accent-white rounded-lg cursor-pointer appearance-none"
          />
        </div>
      </motion.div>

      {/* BOUTON D'UPLOAD IA (Adapté Mobile) */}
      <div className="mt-8 sm:mt-12 z-20 w-full max-w-[280px] sm:max-w-xs">
        <label className={`group cursor-pointer flex items-center justify-center gap-4 px-6 py-4 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 transition-all ${isTranscribing ? 'bg-purple-600/80 animate-pulse' : 'bg-white/5 hover:bg-white/10'}`}>
          <UploadCloud size={20} className={isTranscribing ? "animate-bounce" : "group-hover:text-purple-400 transition-colors"}/>
          <span className="text-xs sm:text-sm font-semibold tracking-wide">
            {isTranscribing ? "IA en cours..." : "Analyser une cover"}
          </span>
          <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} disabled={isTranscribing} />
        </label>
      </div>

      <div className="absolute bottom-4 opacity-5 text-[8px] tracking-[1em] font-bold text-center w-full">
        ZENKA MASTER • MOBILE & DESKTOP CORE
      </div>
    </div>
  );
}