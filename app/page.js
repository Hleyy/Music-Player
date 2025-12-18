"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, Repeat, Shuffle } from 'lucide-react';

const TRACKS = [
  {
    title: "No lie",
    artist: "Sean Paul",
    cover: "/images/fern.gif",
    src: "/songs/no lie.mp3"
  },
  {
    title: "Too sweet",
    artist: "Hozier",
    cover: "/images/fern.gif",
    src: "/songs/too sweet.mp3"
  },
  {
    title: "Just The Two of Us",
    artist: "Bill Withers et Grover Washington",
    cover: "/images/fern.gif",
    src: "/songs/just the two of us.mp3"
  },
  {
    title: "Shinunoga E-Wa",
    artist: "Fujii Kaze",
    cover: "/images/fern.gif",
    src: "/songs/shino.mp3"
  },
  {
    title: "Collide",
    artist: "Justine Skye",
    cover: "/images/fern.gif",
    src: "/songs/collide.mp3"
  },
  {
    title: "Merry go round",
    artist: "YAØ",
    cover: "/images/fern.gif",
    src: "/songs/Merry_go_round.mp3"
  },
  {
    title: "Double Tale",
    artist: "Dhruv",
    cover: "/images/fern.gif",
    src: "/songs/double_take.mp3"
  },
  {
    title: "Love Is Gone",
    artist: "Dylan Matthew",
    cover: "/images/fern.gif",
    src: "/songs/love_is_gone.mp3"
  },
  {
    title: "God Rest Ye Merry Gentlemen",
    artist: "Pentatonix",
    cover: "/images/fern.gif",
    src: "/songs/god_rest_ye_marry.mp3"
  },
  {
    title: "Until I Found You",
    artist: "Stephen Sanchez",
    cover: "/images/fern.gif",
    src: "/songs/i_found_her.mp3"
  }
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  
  const audioRef = useRef(null);
  const currentTrack = TRACKS[currentTrackIndex];

  // Gestion de l'audio
  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const [volume, setVolume] = useState(0.7); // Volume par défaut à 70%

useEffect(() => {
  if (audioRef.current) {
    audioRef.current.volume = volume;
  }
}, [volume]);

  const onTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const nextTrack = () => {
    if (isShuffle) {
    // Choisit un index au hasard différent de l'actuel
    const randomIndex = Math.floor(Math.random() * TRACKS.length);
    setCurrentTrackIndex(randomIndex);
  } else {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  }
  setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const progressPercent = (currentTime / duration) * 100 || 0;

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center overflow-hidden relative">
      <audio 
        ref={audioRef} 
        src={currentTrack.src} 
        onTimeUpdate={onTimeUpdate}
        onEnded={isLooping ? null : nextTrack} // Si on loop, on ne passe pas à la suivante
        loop={isLooping}
      />

      {/* Fond Décoratif */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />

      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 w-80 bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-7 rounded-[3rem] shadow-2xl"
      >
        {/* Album */}
        <div className="relative w-full aspect-square mb-8">
          <motion.div 
            key={currentTrackIndex}
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            className="w-full h-full"
          >
            <motion.img 
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              src={currentTrack.cover} 
              className="rounded-full w-full h-full object-cover border-8 border-white/5 shadow-2xl"
              alt="Album"
            />
          </motion.div>
          {/* Trou du vinyle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#0a0a0c] rounded-full border-4 border-white/10 shadow-inner" />
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

{/* Bare Interactif */}
<div className="mb-8 px-2">
  <div 
    className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden cursor-pointer relative"
    onClick={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const nextTime = (x / width) * duration;
      audioRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    }}
  >
    {/* Background de clic */}
    <div className="absolute inset-0 z-10" />
    
    {/* La barre de progression */}
    <motion.div 
      style={{ width: `${progressPercent}%` }}
      className="h-full bg-gradient-to-r from-purple-500 to-blue-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] relative z-0"
    />
  </div>
  
  <div className="flex justify-between mt-3 text-[10px] font-mono text-gray-500 tracking-tighter">
    <span>{formatTime(currentTime)}</span>
    <span>{formatTime(duration)}</span>
  </div>
</div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <button onClick={prevTrack} className="text-gray-400 hover:text-white transition-colors p-2">
            <SkipBack size={22} fill="currentColor" />
          </button>
          
          <button onClick={() => setIsShuffle(!isShuffle)} 
            className={`transition-colors p-2 ${isShuffle ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>
            <Shuffle size={20} />
          </button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 bg-white flex items-center justify-center rounded-full shadow-xl text-black"
          >
            {isPlaying ? <Pause size={28} fill="black" /> : <Play size={28} className="ml-1" fill="black" />}
          </motion.button>

          <button onClick={() => setIsLooping(!isLooping)} 
            className={`transition-colors p-2 ${isLooping ? 'text-purple-500' : 'text-gray-400 hover:text-white'}`}>
            <Repeat size={20} />
          </button>

          <button onClick={nextTrack} className="text-gray-400 hover:text-white transition-colors p-2">
            <SkipForward size={22} fill="currentColor" />
          </button>
          
        </div>
      </motion.div>
      
{/* Indicateur de volume interactif */}
<div className="absolute bottom-10 flex items-center gap-3 group">
  <motion.div whileHover={{ scale: 1.1 }} className="text-white/40 group-hover:text-white/80 transition-colors">
    <Volume2 size={18} />
  </motion.div>
  
  <div 
    className="w-24 h-1.5 bg-white/10 rounded-full cursor-pointer relative overflow-hidden"
    onClick={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newVolume = Math.min(Math.max(x / rect.width, 0), 1);
      setVolume(newVolume);
    }}
  >
    {/* Barre de volume active */}
    <motion.div 
      animate={{ width: `${volume * 100}%` }}
      className="h-full bg-white/40 group-hover:bg-purple-500 transition-colors"
    />
  </div>
</div>
    </div>
  );
}