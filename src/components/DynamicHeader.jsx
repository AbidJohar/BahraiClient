/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import React from 'react';

const DynamicHeader = ({ title }) => {
  return (
    <motion.div
      className="relative overflow-hidden bg-gradient-to-r from-[#000000] via-[#203a43] to-[#619eb9] py-2 px-6 mb-5 rounded-lg "
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.h4
        className="text-md md:text-lg font-extrabold text-white text-center tracking-wider"
        animate={{
          scale: [1, 1.05, 1],
          textShadow: [
            '0 0 5px rgba(255,255,255,0.8)',
            '0 0 15px rgba(255,255,255,1)',
            '0 0 5px rgba(255,255,255,0.8)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {title}
      </motion.h4>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute top-0 left-0 w-20 h-20 bg-white/50 rounded-full opacity-30"
        animate={{
          scale: [0.9, 1.4, 0.9],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-16 h-16 bg-blue-400 rounded-full opacity-30"
        animate={{
          scale: [0.9, 1.4, 0.9],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
};

export default DynamicHeader;