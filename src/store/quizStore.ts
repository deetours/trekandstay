import { create } from 'zustand';
import { QuizAnswers } from '../types';

interface QuizStore {
  answers: QuizAnswers;
  currentQuestion: number;
  isComplete: boolean;
  addAnswer: (questionId: string, value: string) => void;
  setCurrentQuestion: (question: number) => void;
  resetQuiz: () => void;
  completeQuiz: () => void;
}

export const useQuizStore = create<QuizStore>((set) => ({
  answers: {},
  currentQuestion: 0,
  isComplete: false,
  addAnswer: (questionId, value) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: value },
    })),
  setCurrentQuestion: (question) =>
    set(() => ({ currentQuestion: question })),
  resetQuiz: () =>
    set(() => ({
      answers: {},
      currentQuestion: 0,
      isComplete: false,
    })),
  completeQuiz: () =>
    set(() => ({ isComplete: true })),
}));