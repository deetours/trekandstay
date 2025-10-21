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
      <h2 className="text-3xl md:text-4xl font-serif text-deep-forest text-center mb-3">
        {question.question}
      </h2>
      {question.subtext && (
        <p className="text-center text-mystic-indigo mb-8 text-lg">{question.subtext}</p>
      )}

      {/* Visual Options (with images) */}
      {question.type === 'visual' && question.options[0].image && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {question.options.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAnswer(question.id, option.value)}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <img
                src={option.image}
                alt={option.label}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-cloud-white">
                <p className="text-xl font-semibold">{option.label}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Icon Options */}
      {question.type === 'visual' && question.options[0].icon && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {question.options.map((option) => {
            const Icon = iconMap[option.icon as keyof typeof iconMap];
            return (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAnswer(question.id, option.value)}
                className="bg-cloud-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center gap-4 hover:border-2 hover:border-sunrise-coral"
              >
                {Icon && <Icon className="w-12 h-12 text-sunrise-coral" />}
                <p className="text-deep-forest font-semibold text-center">
                  {option.label}
                </p>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Text Options */}
      {question.type === 'text' && (
        <div className="space-y-4">
          {question.options.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02, x: 10 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAnswer(question.id, option.value)}
              className="w-full bg-cloud-white p-6 rounded-xl shadow-md hover:shadow-xl hover:bg-warm-sand transition-all duration-300 text-left border-2 border-transparent hover:border-sunrise-coral"
            >
              <p className="text-lg text-deep-forest font-medium">{option.label}</p>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}