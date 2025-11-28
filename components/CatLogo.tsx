
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CatLogoProps {
  className?: string;
}

const CatLogo: React.FC<CatLogoProps> = ({ className = "w-24 h-24" }) => {
  const [isBlinking, setIsBlinking] = useState(false);

  // Auto blink every few seconds if not hovered
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // Random chance to blink naturally
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 200);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className={`relative cursor-pointer select-none ${className}`}
      onMouseEnter={() => setIsBlinking(true)}
      onMouseLeave={() => setIsBlinking(false)}
      onTouchStart={() => setIsBlinking(true)}
      onTouchEnd={() => setIsBlinking(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="IdeaVoice Cat"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body/Head Shape */}
        <path d="M50 15C35 15 25 25 25 40V85C25 90 30 95 40 95H60C70 95 75 90 75 85V40C75 25 65 15 50 15Z" fill="#1e293b" /> {/* Dark Slate Body */}
        
        {/* Green Face Mask / Patch */}
        <path d="M50 15C40 15 35 20 35 35V65H65V35C65 20 60 15 50 15Z" fill="#84cc16" /> {/* Lime Green Face */}
        
        {/* Ears */}
        <path d="M25 40L15 20L35 30" fill="#1e293b" stroke="#1e293b" strokeWidth="4" strokeLinejoin="round"/>
        <path d="M75 40L85 20L65 30" fill="#84cc16" stroke="#84cc16" strokeWidth="4" strokeLinejoin="round"/>
        
        {/* Striped Shirt */}
        <path d="M25 65H75V85C75 90 70 95 60 95H40C30 95 25 90 25 85V65Z" fill="#1e293b" />
        <path d="M25 70H75" stroke="#e2e8f0" strokeWidth="2" />
        <path d="M25 78H75" stroke="#e2e8f0" strokeWidth="2" />
        <path d="M30 86H70" stroke="#e2e8f0" strokeWidth="2" />

        {/* Glasses Frame */}
        <circle cx="40" cy="45" r="10" stroke="#1e293b" strokeWidth="3" fill="rgba(255,255,255,0.2)" />
        <circle cx="60" cy="45" r="10" stroke="#1e293b" strokeWidth="3" fill="rgba(255,255,255,0.2)" />
        <path d="M50 45H50.5" stroke="#1e293b" strokeWidth="3" /> {/* Bridge */}
        <path d="M30 45H20" stroke="#1e293b" strokeWidth="2" />
        <path d="M70 45H80" stroke="#1e293b" strokeWidth="2" />

        {/* EYES - Animated */}
        <motion.g
           animate={{ scaleY: isBlinking ? 0.1 : 1 }}
           transition={{ duration: 0.1 }}
           style={{ originY: "45px" }} // Blink from center of eye
        >
            <circle cx="40" cy="45" r="3" fill="#020617" />
            <circle cx="60" cy="45" r="3" fill="#020617" />
            {/* White reflection in eyes */}
            <circle cx="41.5" cy="43.5" r="1" fill="white" />
            <circle cx="61.5" cy="43.5" r="1" fill="white" />
        </motion.g>

        {/* Nose & Mouth */}
        <path d="M48 55L50 57L52 55" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        <path d="M50 57V60" stroke="#1e293b" strokeWidth="2" />
        <path d="M45 62C45 62 47 64 50 60C53 64 55 62 55 62" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Pencil/Note accessory */}
        <path d="M75 60L85 50L90 55L80 65Z" fill="#facc15" stroke="#1e293b" strokeWidth="1" /> {/* Pencil body */}
        <path d="M75 60L72 63" stroke="#1e293b" strokeWidth="1" /> {/* Pencil tip */}
        <rect x="20" y="60" width="20" height="25" rx="2" fill="white" stroke="#1e293b" strokeWidth="1" transform="rotate(-10 20 60)" /> {/* Notebook */}
        <line x1="22" y1="65" x2="38" y2="65" stroke="#94a3b8" strokeWidth="1" transform="rotate(-10 20 60)" />
        <line x1="22" y1="70" x2="38" y2="70" stroke="#94a3b8" strokeWidth="1" transform="rotate(-10 20 60)" />

      </svg>
    </motion.div>
  );
};

export default CatLogo;
