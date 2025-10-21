import { motion } from 'framer-motion';

interface QuizProgressProps {
  current: number;
  total: number;
}

export default function QuizProgress({ current, total }: QuizProgressProps) {
  const percentage = (current / total) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-mystic-indigo font-medium">
          Question {current} of {total}
        </span>
        <span className="text-sm text-mystic-indigo">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-soft-grey rounded-full h-2.5">
        <motion.div
          className="bg-sage-green h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}