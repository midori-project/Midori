"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useState } from "react";

interface HoverDetailCardProps {
  widthClass?: string;
  orientation?: 'vertical' | 'horizontal';
  variant?: 'home' | 'workspace' | 'default';
  title?: string;
  subtitle?: string;
  images?: string[];
  primaryButton?: {
    text: string;
    color?: string;
    hoverColor?: string;
    textColor?: string;
  };
  secondaryButton?: {
    text: string;
    color?: string;
    hoverColor?: string;
    textColor?: string;
  };
  pills?: {
    category: {
      text: string;
      color?: string;
      textColor?: string;
    };
  };
  enableAnimations?: boolean;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

// Reusable data shape for mapping lists of cards
export interface HoverDetailCardData {
  title?: string;
  subtitle?: string;
  images?: string[];
  primaryButton?: HoverDetailCardProps['primaryButton'];
  secondaryButton?: HoverDetailCardProps['secondaryButton'];
  pills?: HoverDetailCardProps['pills'];
  widthClass?: string;
  orientation?: HoverDetailCardProps['orientation'];
  variant?: HoverDetailCardProps['variant'];
  enableAnimations?: boolean;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

const defaultImages = [
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900&h=600&fit=crop',
];

export function HoverDetailCard({
  title = "Studio shots",
  subtitle = "52 tiles",
  images = defaultImages,
  primaryButton = {
    text: "View Details",
    color: "bg-white/90",
    hoverColor: "hover:bg-white",
    textColor: "text-gray-900"
  },
  secondaryButton = {
    text: "Preview",
    color: "bg-blue-600",
    hoverColor: "hover:bg-blue-700",
    textColor: "text-white"
  },
  pills = {
    category: { text: "General", color: "bg-blue-100", textColor: "text-blue-800" }
  },
  enableAnimations = true,
  // default to full width so parent grid controls card sizing
  widthClass = "w-full flex flex-col",
  orientation = 'horizontal',
  variant = 'default',
  onPrimaryClick,
  onSecondaryClick
}: HoverDetailCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;

  // กำหนด styles ตาม variant
  const getImageStyles = () => {
    switch (variant) {
      case 'home':
        // Use full width so image fills the card container and keeps layout consistent
        return "relative overflow-hidden rounded-t-lg cursor-zoom-in w-full h-[180px]";
      case 'workspace':
        // ปรับให้เหมือนกับ home เพื่อขนาดที่เท่ากัน
        return "relative overflow-hidden rounded-t-lg cursor-zoom-in w-full h-[180px]";
      default:
        return "relative overflow-hidden rounded-t-lg cursor-zoom-in w-full aspect-[4/3]";
    }
  };

  const getCardStyles = () => {
    switch (variant) {
      case 'home':
        return "bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col";
      case 'workspace':
        // ปรับให้เหมือนกับ home - ไม่มีเส้นกรอบ
        return "bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col";
      default:
        return "bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col";
    }
  };

  const getContentPadding = () => {
    switch (variant) {
      case 'workspace':
        // ปรับให้เหมือนกับ default เพื่อขนาดที่เท่ากัน
        return "p-4";
      default:
        return "p-4";
    }
  };

  const getTitleStyles = () => {
    switch (variant) {
      case 'workspace':
        // ปรับให้เหมือนกับ default เพื่อขนาดที่เท่ากัน
        return "text-lg font-bold text-gray-900 mb-2 line-clamp-2";
      default:
        return "text-lg font-bold text-gray-900 mb-2 line-clamp-2";
    }
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.08,
        delayChildren: 0.1,
      }
    }
  };

  const imageVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 10
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      }
    }
  };

  const contentVariants: Variants = {
    hidden: { 
      opacity: 0, 
      x: -25,
      scale: 0.95,
      filter: "blur(4px)",
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 28,
        mass: 0.6,
      }
    }
  };

  const bottomSectionVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.4,
      },
    },
  };

  const pillVariants: Variants = {
    hidden: { 
      opacity: 0, 
      x: -20,
      scale: 0.9,
      filter: "blur(3px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 450,
        damping: 25,
        mass: 0.5,
      },
    },
  };

  const textVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 15,
      scale: 0.95,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.7,
      },
    },
  };

  return (
    <motion.div
      className={`${widthClass} max-w-none`}
      initial={shouldAnimate ? "hidden" : "visible"}
      animate="visible"
      variants={shouldAnimate ? containerVariants : undefined}
    >
      <motion.div
        className={getCardStyles()}
        variants={shouldAnimate ? contentVariants : undefined}
      >
        <>
          {/* Image section - ด้านบน */}
          <motion.div
            className="bg-black relative flex-shrink-0"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            variants={shouldAnimate ? contentVariants : undefined}
          >
            {/* Always show a single primary image — use the first image as the source */}
            <motion.div
              className={getImageStyles()}
              variants={shouldAnimate ? imageVariants : undefined}
              animate={{ scale: isHovered ? 0.995 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <img
                src={images[0]}
                alt={title}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Blur Overlay */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="flex gap-3 mx-auto">
                    <motion.button
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
                      className={`${primaryButton.color} ${primaryButton.hoverColor} ${primaryButton.textColor} cursor-pointer px-3 py-1.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200`}
                      onClick={onPrimaryClick}
                    >
                      {primaryButton.text}
                    </motion.button>
                    <motion.button
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.2 }}
                      className={`${secondaryButton.color} ${secondaryButton.hoverColor} ${secondaryButton.textColor} cursor-pointer px-3 py-1.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200`}
                      onClick={onSecondaryClick}
                    >
                      {secondaryButton.text}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Content section - ด้านล่าง (สีขาว) */}
          <motion.div className={`${getContentPadding()} bg-white`} variants={shouldAnimate ? bottomSectionVariants : undefined}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <motion.h3 className={getTitleStyles()} variants={shouldAnimate ? textVariants : undefined}>{title}</motion.h3>
                <motion.p className="text-sm text-gray-600" variants={shouldAnimate ? textVariants : undefined}>{subtitle}</motion.p>
              </div>

              {/* Category pill */}
              {pills?.category && (
                <motion.div className="flex items-center flex-shrink-0" variants={shouldAnimate ? contentVariants : undefined}>
                  <motion.div className={`${pills.category.color || 'bg-blue-100'} ${pills.category.textColor || 'text-blue-800'} px-3 py-1 rounded-full text-sm font-medium`} variants={shouldAnimate ? pillVariants : undefined}>
                    {pills.category.text || 'General'}
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      </motion.div>
    </motion.div>
  );
}
