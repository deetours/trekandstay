
import { motion, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

export function RewardPoints({ points }: { points: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(display, points, {
      duration: 1,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [points]);
  return (
    <motion.div className="text-3xl font-bold text-yellow-400">
      <span>{display}</span> Reward Points
    </motion.div>
  );
}
