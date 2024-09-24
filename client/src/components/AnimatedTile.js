import React from 'react';
import { motion } from 'framer-motion';

const AnimatedTitle = ({ text }) => (
  <motion.h2
    className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-center"
    initial={{ opacity: 0, y: -50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99],
      scale: {
        type: "spring",
        damping: 15,
        stiffness: 300,
        restDelta: 0.001
      }
    }}
  >
    {text.split('').map((char, index) => (
      <motion.span
        key={`${char}-${index}`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.6, -0.05, 0.01, 0.99],
          delay: 0.05 * index
        }}
      >
        {char}
      </motion.span>
    ))}
  </motion.h2>
);

export default AnimatedTitle;