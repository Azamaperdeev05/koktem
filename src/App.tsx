/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, MapPin, Heart, Navigation, Share2, Sparkles, Quote, Volume2, VolumeX } from 'lucide-react';

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const FloatingHearts = () => {
  const [hearts, setHearts] = useState<{id: number, left: number, delay: number, duration: number, size: number}[]>([]);

  useEffect(() => {
    // Reduced number of hearts for better performance
    const newHearts = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 8 + 12,
      size: Math.random() * 12 + 12
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-pink-400/10"
          initial={{ y: '110vh', x: `${heart.left}vw`, rotate: 0 }}
          animate={{ y: '-10vh', rotate: 180 }}
          transition={{ duration: heart.duration, repeat: Infinity, ease: "linear", delay: heart.delay }}
          style={{ willChange: 'transform' }}
        >
          <Heart fill="currentColor" style={{ width: heart.size, height: heart.size }} />
        </motion.div>
      ))}
    </div>
  );
};

export default function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const audioRef = useRef<HTMLAudioElement>(null);
  const ytIframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const playerMessage = document.hidden ? '{"event":"command","func":"pauseVideo","args":""}' : '{"event":"command","func":"playVideo","args":""}';
      
      if (document.hidden) {
        audioRef.current?.pause();
      } else if (isOpened && !isMuted) {
        audioRef.current?.play().catch(() => {});
      }

      ytIframeRef.current?.contentWindow?.postMessage(playerMessage, '*');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isOpened, isMuted]);

  useEffect(() => {
    const eventDate = new Date('2026-04-11T17:00:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = eventDate - now;
      if (distance < 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => {
    setIsOpened(true);
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch(() => {});
    }
    // Attempt to play YouTube video on open if it was somehow paused
    ytIframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (newMuted) {
      audioRef.current?.pause();
      ytIframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"mute","args":""}', '*');
    } else {
      if (isOpened) audioRef.current?.play().catch(() => {});
      ytIframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"unMute","args":""}', '*');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Көктемге хат - Поэзиялық кеш',
          text: 'Сені 15 сәуір — Ғашықтар күніне орай өтетін поэзиялық кешке шақырамын!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    }
  };

  return (
    <div className="min-h-screen text-[#1d1d1f] font-sans selection:bg-pink-200 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-white">
      {/* Background YouTube Video Optimized */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none opacity-40">
        <iframe
          ref={ytIframeRef}
          className="absolute top-1/2 left-1/2 w-[110vw] h-[110vh] -translate-x-1/2 -translate-y-1/2 object-cover scale-[1.3]"
          src="https://www.youtube.com/embed/7aW2sT-Nalo?autoplay=1&mute=1&controls=0&loop=1&playlist=7aW2sT-Nalo&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1"
          allow="autoplay; encrypted-media"
          frameBorder="0"
        ></iframe>
      </div>

      {/* Fallback Romantic Audio */}
      <audio ref={audioRef} loop muted={isMuted}>
        <source src="https://assets.mixkit.co/music/preview/mixkit-romantic-piano-and-strings-575.mp3" type="audio/mpeg" />
      </audio>

      {/* Music Toggle Button */}
      <button 
        onClick={toggleMute}
        className="fixed top-6 right-6 z-50 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-pink-100 text-pink-600 hover:scale-105 transition-transform active:scale-95"
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>

      {/* Background Overlay to prevent interfaction with YT and soften visuals */}
      <div className="fixed inset-0 bg-white/30 backdrop-blur-[1px] z-0 pointer-events-none" />

      {/* Background Blobs Optimized */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-pink-100/30 rounded-full blur-[100px] mix-blend-multiply opacity-50"
          style={{ top: '-10%', left: '0%' }}
        />
        <div 
          className="absolute w-[70vw] h-[70vw] max-w-[500px] max-h-[500px] bg-blue-100/30 rounded-full blur-[100px] mix-blend-multiply opacity-50"
          style={{ bottom: '-10%', right: '0%' }}
        />
      </div>

      <FloatingHearts />



      <AnimatePresence mode="wait">
        {!isOpened ? (
          <motion.div
            key="envelope"
            initial={{ y: '-100vh', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="relative z-20 flex flex-col items-center justify-center cursor-pointer min-h-screen w-full"
            onClick={handleOpen}
          >
            <motion.div
              animate={{ rotate: [-2, 2, -2], y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              {/* Envelope Graphic */}
              <div className="relative w-64 h-44 sm:w-80 sm:h-56 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-rose-50 opacity-50" />
                
                {/* Envelope Flap Lines (CSS trick) */}
                <div className="absolute top-0 left-0 w-full h-full border-t-[88px] sm:border-t-[112px] border-t-pink-100/50 border-l-[128px] sm:border-l-[160px] border-l-transparent border-r-[128px] sm:border-r-[160px] border-r-transparent z-10 drop-shadow-sm" />
                <div className="absolute bottom-0 left-0 w-full h-full border-b-[88px] sm:border-b-[112px] border-b-white border-l-[128px] sm:border-l-[160px] border-l-transparent border-r-[128px] sm:border-r-[160px] border-r-transparent z-20" />
                <div className="absolute top-0 left-0 w-full h-full border-l-[128px] sm:border-l-[160px] border-l-gray-50 border-t-[88px] sm:border-t-[112px] border-t-transparent border-b-[88px] sm:border-b-[112px] border-b-transparent z-10" />
                <div className="absolute top-0 right-0 w-full h-full border-r-[128px] sm:border-r-[160px] border-r-gray-50 border-t-[88px] sm:border-t-[112px] border-t-transparent border-b-[88px] sm:border-b-[112px] border-b-transparent z-10" />

                {/* Wax Seal */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 mt-2 sm:mt-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/40 border-2 border-red-400">
                    <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="invitation"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xl bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[2.5rem] p-6 sm:p-10 overflow-hidden my-8"
          >
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
              }}
              initial="hidden"
              animate="show"
              className="flex flex-col"
            >
              {/* Logos */}
              <motion.div variants={itemVariants} className="flex justify-center items-center gap-4 sm:gap-6 mb-8">
                <img src="https://ulagat-krg.vercel.app/ulagat%20(1).svg" alt="Ulagat" className="h-8 sm:h-10 object-contain" />
                <div className="w-px h-8 bg-gray-300" />
                <img src="https://qasymkitap.kz/static/imgs/logo.png" alt="Qasymkitap" className="h-6 sm:h-8 object-contain brightness-0 opacity-80" />
                <div className="w-px h-8 bg-gray-300" />
                <img src="https://storage.emenu.delivery/company/kjyuelf8p5yx5m0qkjh1wm68eais5io3.jpg" alt="Turan-El" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover shadow-sm" />
              </motion.div>

              {/* Header */}
              <motion.div variants={itemVariants} className="text-center space-y-4 mb-8">
                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-pink-100 to-rose-100 text-pink-500 rounded-full mb-2 shadow-sm relative">
                  <Heart className="w-6 h-6 fill-pink-500" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-4 h-4 text-pink-400" />
                  </motion.div>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  Көктемге хат
                </h1>
                <p className="text-lg text-gray-500 font-medium tracking-wide">
                  Поэзиялық кеш
                </p>
              </motion.div>

              {/* Romantic Quote */}
              <motion.div variants={itemVariants} className="mb-8 relative">
                <div className="absolute -top-3 -left-2 text-pink-200 opacity-50">
                  <Quote size={40} className="rotate-180" />
                </div>
                <div className="bg-gradient-to-br from-pink-50/50 to-transparent rounded-3xl p-6 text-center border border-pink-100/50 relative z-10">
                  <p className="text-lg sm:text-xl text-gray-700 italic font-medium leading-relaxed">
                    "Ғашықтың тілі — тілсіз тіл,<br/>Көзбен көр де, ішпен біл."
                  </p>
                  <p className="text-sm text-pink-500/80 font-semibold mt-3">— Абай Құнанбайұлы</p>
                </div>
              </motion.div>

              {/* Body Text */}
              <motion.div variants={itemVariants} className="text-center space-y-4 mb-8 px-2 sm:px-6">
                <p className="text-lg text-gray-800 font-medium">
                  Құрметті кеш қонағы!
                </p>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  Сізді 15 сәуір — <span className="font-semibold text-pink-500">Қозы Көрпеш пен Баян Сұлу</span> (Ғашықтар күні) мерекесіне орай ұйымдастырылған поэзиялық кешімізге шақырамыз!
                </p>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  Жүректерді жырмен тербеп, сезім мен көктем шуағына бөленетін сәтте бірге болайық.
                </p>
              </motion.div>

              {/* Countdown Timer */}
              <motion.div variants={itemVariants} className="mb-8">
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                  {[
                    { label: 'Күн', value: timeLeft.days },
                    { label: 'Сағат', value: timeLeft.hours },
                    { label: 'Минут', value: timeLeft.minutes },
                    { label: 'Секунд', value: timeLeft.seconds }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white/60 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center justify-center border border-gray-100 shadow-sm">
                      <span className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums tracking-tight">
                        {item.value.toString().padStart(2, '0')}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500 font-medium mt-1">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Details List */}
              <motion.div variants={itemVariants} className="bg-white/60 rounded-3xl p-2 mb-8 shadow-sm border border-gray-100/50">
                <div className="flex items-center gap-4 p-4 border-b border-gray-200/50">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-0.5">Күні</p>
                    <p className="text-base text-gray-900 font-semibold">11 сәуір 2026 жыл</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 border-b border-gray-200/50">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-0.5">Уақыты</p>
                    <p className="text-base text-gray-900 font-semibold">17:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-0.5">Мекен-жайы</p>
                    <p className="text-base text-gray-900 font-semibold">Орбита 1 шағын ауданы, ст32/1</p>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div variants={itemVariants} className="flex flex-col gap-3">
                <a 
                  href="https://go.2gis.com/caDZQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2 w-full py-4 px-6 bg-gray-900 hover:bg-gray-800 text-white text-center rounded-2xl font-semibold text-lg transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.16)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
                >
                  <Navigation className="w-5 h-5 group-hover:animate-pulse" />
                  Картадан ашу
                </a>
                <button 
                  onClick={handleShare}
                  className="group flex items-center justify-center gap-2 w-full py-4 px-6 bg-pink-50 hover:bg-pink-100 text-pink-600 text-center rounded-2xl font-semibold text-lg transition-all duration-300 border border-pink-100"
                >
                  <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Ғашығыңмен бөлісу
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  );
}
