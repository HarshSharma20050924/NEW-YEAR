import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  delay?: number;
}

export const ScrollSection: React.FC<Props> = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // More dramatic animations for that "Heavy/Powerful" feel
  const y = useTransform(scrollYProgress, [0, 0.4, 1], [150, 0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [0.8, 1, 1, 0.9]);
  const rotateX = useTransform(scrollYProgress, [0, 0.4, 1], [15, 0, -5]);
  const rotateZ = useTransform(scrollYProgress, [0, 0.4, 1], [-2, 0, 2]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity, scale, rotateX, rotateZ }}
      className="perspective-1000 my-32 w-full flex justify-center will-change-transform"
    >
      {children}
    </motion.div>
  );
};
