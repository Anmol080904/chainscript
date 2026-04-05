import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="loader-container">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f1f5f9',
          borderTopColor: 'var(--primary-accent)',
          borderRadius: '50%',
        }}
      />
      <div className="loader-text">{message}</div>
    </div>
  );
};

export default LoadingSpinner;

