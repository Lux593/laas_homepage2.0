"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 5000);
    const playTimer = setTimeout(() => {
      videoRef.current?.play().catch(() => {
        // Autoplay blocked by browser — skip preloader
        setIsLoading(false);
      });
    }, 500);
    return () => {
      clearTimeout(timer);
      clearTimeout(playTimer);
    };
  }, []);

  const handleVideoEnded = () => {
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black"
          exit={{
            clipPath: "inset(0% 0% 100% 0%)",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          <video
            ref={videoRef}
            muted
            playsInline
            onEnded={handleVideoEnded}
            className="max-w-[400px] md:max-w-[520px] w-full h-auto"
          >
            <source
              src="/Firmenlogo_Animation_Für_Loading_Screen.mp4"
              type="video/mp4"
            />
          </video>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
