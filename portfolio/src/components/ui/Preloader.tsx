"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Diese Datei liegt derzeit NICHT in public/ — die Blende überspringt sich
 * deshalb selbst, sobald das Laden scheitert. Sobald der Clip da ist, greift
 * die Animation wieder ohne weitere Änderung.
 */
const PRELOADER_CLIP = "/Firmenlogo_Animation_Für_Loading_Screen.mp4";

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
            {/* onError sitzt auf der <source>, nicht auf dem <video>: schlägt
                das Laden fehl, feuert das Ereignis am Quellelement, während
                video.error null bleibt. Ohne das hinge die Blende bis zum
                Fallback-Timer über der Seite, obwohl längst feststeht, dass
                kein Clip kommt. */}
            <source
              src={PRELOADER_CLIP}
              type="video/mp4"
              onError={() => setIsLoading(false)}
            />
          </video>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
