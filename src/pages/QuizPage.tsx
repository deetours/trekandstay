import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import QuizQuestion from '../components/quiz/QuizQuestion';
import QuizProgress from '../components/quiz/QuizProgress';
import QuizResults from '../components/quiz/QuizResults';
import { useQuizStore } from '../store/quizStore';
import { quizQuestions } from '../data/quiz';

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const { answers, addAnswer } = useQuizStore();

  const totalQuestions = quizQuestions.length;

  const handleAnswer = (questionId: string, value: string) => {
    addAnswer(questionId, value);
    
    if (currentQuestion < totalQuestions - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      // Quiz complete
      setTimeout(() => setShowResults(true), 500);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (showResults) {
    return <QuizResults answers={answers} />;
  }

  return (
    <div className="min-h-screen bg-warm-sand flex flex-col">
      {/* Header with Progress */}
      <div className="bg-cloud-white shadow-sm py-4 px-4">
        <div className="max-w-3xl mx-auto">
          <QuizProgress current={currentQuestion + 1} total={totalQuestions} />
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <QuizQuestion
                question={quizQuestions[currentQuestion]}
                onAnswer={handleAnswer}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {currentQuestion > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleBack}
              className="mt-8 flex items-center gap-2 text-mystic-indigo hover:text-deep-forest transition-colors font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous Question
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}