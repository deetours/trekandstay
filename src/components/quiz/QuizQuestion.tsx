import { motion } from 'framer-motion';
import { Smartphone, Briefcase, Users, Compass } from 'lucide-react';
import { QuizQuestion as QuizQuestionType } from '../../types';

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (questionId: string, value: string) => void;
}

const iconMap = {
  'Smartphone': Smartphone,
  'Briefcase': Briefcase,
  'Users': Users,
  'Compass': Compass
};

export default function QuizQuestion({ question, onAnswer }: QuizQuestionProps) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-deep-forest text-center mb-2 sm:mb-3">
        {question.question}
      </h2>
      {question.subtext && (
        <p className="text-center text-mystic-indigo mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">{question.subtext}</p>
      )}

      {/* Visual Options (with images) */}
      {question.type === 'visual' && question.options[0].image && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {question.options.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAnswer(question.id, option.value)}
              className="group relative overflow-hidden rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 touch-manipulation"
            >
              <img
                src={option.image}
                alt={option.label}
                className="w-full h-40 sm:h-52 md:h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 text-cloud-white">
                <p className="text-base sm:text-lg md:text-xl font-semibold">{option.label}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Icon Options */}
      {question.type === 'visual' && question.options[0].icon && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {question.options.map((option) => {
            const Icon = iconMap[option.icon as keyof typeof iconMap];
            return (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAnswer(question.id, option.value)}
                className="bg-cloud-white p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center gap-2 sm:gap-3 md:gap-4 hover:border-2 hover:border-sunrise-coral min-h-[100px] sm:min-h-[120px] touch-manipulation"
              >
                {Icon && <Icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-sunrise-coral" />}
                <p className="text-deep-forest font-semibold text-center text-xs sm:text-sm md:text-base leading-tight">
                  {option.label}
                </p>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Text Options */}
      {question.type === 'text' && (
        <div className="space-y-3 sm:space-y-4">
          {question.options.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02, x: 10 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAnswer(question.id, option.value)}
              className="w-full bg-cloud-white p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl shadow-md hover:shadow-xl hover:bg-warm-sand transition-all duration-300 text-left border-2 border-transparent hover:border-sunrise-coral min-h-[44px] sm:min-h-[48px] md:min-h-auto touch-manipulation"
            >
              <p className="text-base sm:text-lg md:text-lg text-deep-forest font-medium">{option.label}</p>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}