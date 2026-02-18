"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  Repeat, Shuffle, UploadCloud, Disc 
} from 'lucide-react';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [lyrics, setLyrics] = useState([]); 

  const audioRef = useRef(null);
  const transcriberRef = useRef(null);
  const currentTrack = TRACKS[currentTrackIndex];

  // --- PARALLAXE ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 45, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 45, damping: 20 });

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 50);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 50);
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

const loadWhisper = async () => {
    if (transcriberRef.current) return transcriberRef.current;
    
    try {
      // 1. On importe dynamiquement
      const Transformers = await import('@xenova/transformers');
      
      // 2. On vérifie si l'objet existe avant de faire quoi que ce soit
      if (!Transformers || !Transformers.pipeline) {
        throw new Error("Impossible de charger Transformers.js");
      }

      // 3. Configuration manuelle sans passer par Object.keys
      // On accède directement aux propriétés pour éviter le scan de Turbopack
      const env = Transformers.env;
      if (env) {
        env.allowLocalModels = false;
        env.useBrowserCache = true;
        // On définit manuellement les chemins pour éviter que la lib cherche partout
        env.remoteModels = true;
      }

      // 4. Initialisation
      transcriberRef.current = await Transformers.pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
        progress_callback: (p) => {
          if (p.status === 'progress') setTranscriptionProgress(Math.round(p.progress));
        }
      });
      
      return transcriberRef.current;
    } catch (error) {
      console.error("Erreur critique IA:", error);
      throw error;
    }
  };
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsTranscribing(true);
    setTranscriptionProgress(0);

    try {
      const whisper = await loadWhisper();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const audioData = audioBuffer.getChannelData(0);

      const output = await whisper(audioData, { 
        chunk_length_s: 30, 
        stride_length_s: 5, 
        return_timestamps: true 
      });

      const formattedLyrics = output.chunks.map(chunk => ({
        time: chunk.timestamp[0],
        text: chunk.text
      }));

      setLyrics(formattedLyrics);
      const url = URL.createObjectURL(file);
      if (audioRef.current) {
        audioRef.current.src = url;
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Erreur IA:", err);
      alert("Erreur lors de l'analyse locale.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const nextTrack = () => {
    setLyrics([]);
    setCurrentTrackIndex(isShuffle ? Math.floor(Math.random() * TRACKS.length) : (currentTrackIndex + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setLyrics([]);
    setCurrentTrackIndex((currentTrackIndex - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const formatTime = (time) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeLine = lyrics.findLast((line) => line.time <= currentTime);

  return (
    <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center overflow-hidden relative font-sans text-white p-4">
      <audio 
        ref={audioRef} 
        src={currentTrack.src} 
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)} 
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        loop={isLooping} 
        onEnded={() => !isLooping && nextTrack()} 
      />

      {/* DYNAMIC GLOW */}
      <motion.div style={{ x: smoothX, y: smoothY, scale: 1.2 }} className="absolute inset-0 z-0">
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

      {/* MAIN PLAYER */}
      <motion.div 
        style={{ x: useSpring(mouseX, {stiffness: 120}), y: useSpring(mouseY, {stiffness: 120}) }}
        className="z-10 w-full max-w-[90%] sm:max-w-md bg-white/[0.02] backdrop-blur-3xl border border-white/10 p-6 sm:p-10 rounded-[3rem] shadow-2xl"
      >
        {/* KARAOKE */}
        <div className="h-24 sm:h-28 flex items-center justify-center mb-4 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeLine?.text || isTranscribing}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg sm:text-2xl font-light italic bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent"
            >
              {isTranscribing ? `IA Analyse... ${transcriptionProgress}%` : (activeLine ? activeLine.text : "♪ Yussii_ Cover")}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* VINYL */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-8 sm:mb-10">
          <motion.div 
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-full h-full rounded-full border-[10px] border-white/5 overflow-hidden shadow-2xl"
          >
            <img src={currentTrack.cover} alt="Cover" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        {/* Infos */}
        <div className="text-center mb-8">
          <motion.h2 key={currentTrack.title} initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} className="text-white text-xl font-bold tracking-tight">
            {currentTrack.title}
          </motion.h2>
          <p className="text-gray-500 text-sm mt-1">{currentTrack.artist}</p>
          <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-purple-400/60 text-[10px] mt-2 font-medium tracking-widest uppercase">
          Special thanks to Yussii_ ✨
        </motion.p>
        </div>

        {/* PROGRESS */}
        <div className="mb-6">
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
          <div className="flex justify-between mt-3 text-[10px] text-white/20">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center justify-between mb-8 px-2">
          <button onClick={() => setIsShuffle(!isShuffle)} className={isShuffle ? "text-blue-400" : "text-white/20"}><Shuffle size={18}/></button>
          <div className="flex items-center gap-6">
            <button onClick={prevTrack}><SkipBack size={24} fill="currentColor"/></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black">
              {isPlaying ? <Pause size={28} fill="black"/> : <Play size={28} fill="black" className="ml-1"/>}
            </button>
            <button onClick={nextTrack}><SkipForward size={24} fill="currentColor"/></button>
          </div>
          <button onClick={() => setIsLooping(!isLooping)} className={isLooping ? "text-purple-500" : "text-white/20"}><Repeat size={18}/></button>
        </div>

        {/* VOLUME */}
        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
          <Volume2 size={18} className="text-white/40"/>
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="flex-1 h-1 accent-white appearance-none bg-white/10 rounded-lg" />
        </div>
      </motion.div>
    </div>
  );
}