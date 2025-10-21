import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Zap, 
  Trophy, 
  Clock, 
  Star, 
  Gift,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  CheckCircle,
  XCircle,
  Gamepad2,
  MousePointer,
  Eye,
  Timer,
  Flame,
  Heart,
  Diamond,
  Sparkles,
  TrendingUp,
  Award,
  Rocket,
  Brain,
  Crosshair,
  Shuffle,
  Search,
  MapPin,
  Mountain,
  Camera,
  Share2,
  Users,
  Calendar,
  CloudRain
} from 'lucide-react';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  instructions: string;
  type: 'reaction' | 'memory' | 'puzzle' | 'trivia' | 'engagement' | 'social' | 'exploration';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  duration: number; // in seconds
  points: number;
  bonusMultiplier: number;
  icon: React.ComponentType<any>;
  bgColor: string;
  isActive: boolean;
  completed: boolean;
  bestScore?: number;
  attempts: number;
  timeLimit?: number;
  requirements?: string[];
}

export interface ChallengeResult {
  challengeId: string;
  score: number;
  timeElapsed: number;
  accuracy: number;
  bonusPoints: number;
  totalPoints: number;
  completed: boolean;
  perfectScore: boolean;
}

interface InteractiveChallengesProps {
  userProgress?: any;
  onChallengeComplete?: (result: ChallengeResult) => void;
  onPointsEarned?: (points: number, source: string) => void;
  showCompact?: boolean;
  className?: string;
}

// Define challenge library
const CHALLENGES: Challenge[] = [
  // Reaction-based challenges
  {
    id: 'click_speed',
    name: 'Adventure Reflexes',
    description: 'Test your quick reflexes for outdoor adventures',
    instructions: 'Click the glowing targets as fast as you can!',
    type: 'reaction',
    difficulty: 'easy',
    duration: 10,
    points: 50,
    bonusMultiplier: 1.5,
    icon: Crosshair,
    bgColor: 'from-red-400 to-red-600',
    isActive: true,
    completed: false,
    attempts: 0,
    timeLimit: 15
  },
  {
    id: 'mountain_memory',
    name: 'Mountain Memory',
    description: 'Remember the adventure locations sequence',
    instructions: 'Watch the pattern and repeat it back!',
    type: 'memory',
    difficulty: 'medium',
    duration: 20,
    points: 75,
    bonusMultiplier: 2.0,
    icon: Mountain,
    bgColor: 'from-emerald-400 to-emerald-600',
    isActive: true,
    completed: false,
    attempts: 0
  },
  {
    id: 'weather_wizard',
    name: 'Weather Wizard',
    description: 'Match weather conditions with perfect adventures',
    instructions: 'Drag weather icons to matching adventure types!',
    type: 'puzzle',
    difficulty: 'medium',
    duration: 30,
    points: 100,
    bonusMultiplier: 1.8,
    icon: CloudRain,
    bgColor: 'from-blue-400 to-blue-600',
    isActive: true,
    completed: false,
    attempts: 0
  },
  {
    id: 'adventure_trivia',
    name: 'Adventure Trivia Master',
    description: 'Test your outdoor adventure knowledge',
    instructions: 'Answer questions about trekking and adventures!',
    type: 'trivia',
    difficulty: 'hard',
    duration: 45,
    points: 150,
    bonusMultiplier: 2.5,
    icon: Brain,
    bgColor: 'from-purple-400 to-purple-600',
    isActive: true,
    completed: false,
    attempts: 0,
    requirements: ['weather_check', 'itinerary_view']
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Engage with the adventure community',
    instructions: 'Share content and connect with fellow adventurers!',
    type: 'social',
    difficulty: 'easy',
    duration: 60,
    points: 80,
    bonusMultiplier: 1.5,
    icon: Share2,
    bgColor: 'from-pink-400 to-pink-600',
    isActive: true,
    completed: false,
    attempts: 0
  },
  {
    id: 'treasure_hunter',
    name: 'Hidden Treasure Hunter',
    description: 'Find all hidden elements on the page',
    instructions: 'Discover secret adventure gems hidden around!',
    type: 'exploration',
    difficulty: 'hard',
    duration: 90,
    points: 200,
    bonusMultiplier: 3.0,
    icon: Search,
    bgColor: 'from-yellow-400 to-orange-600',
    isActive: true,
    completed: false,
    attempts: 0
  },
  {
    id: 'engagement_marathon',
    name: 'Engagement Marathon',
    description: 'Complete multiple engagement actions in sequence',
    instructions: 'Perform various interactions within the time limit!',
    type: 'engagement',
    difficulty: 'expert',
    duration: 120,
    points: 300,
    bonusMultiplier: 4.0,
    icon: Rocket,
    bgColor: 'from-indigo-400 to-purple-600',
    isActive: true,
    completed: false,
    attempts: 0,
    requirements: ['social_butterfly', 'weather_wizard']
  }
];

// Mini-games components
const ClickSpeedGame: React.FC<{ onComplete: (score: number) => void; timeLeft: number }> = ({ onComplete, timeLeft }) => {
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number; clicked: boolean }>>([]);
  const [score, setScore] = useState(0);
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete(score);
      return;
    }

    const spawnTarget = () => {
      if (gameRef.current) {
        const rect = gameRef.current.getBoundingClientRect();
        const newTarget = {
          id: Date.now(),
          x: Math.random() * (rect.width - 50),
          y: Math.random() * (rect.height - 50),
          clicked: false
        };
        setTargets(prev => [...prev.slice(-4), newTarget]); // Keep max 5 targets
      }
    };

    const interval = setInterval(spawnTarget, 800);
    return () => clearInterval(interval);
  }, [timeLeft, score, onComplete]);

  const handleTargetClick = (targetId: number) => {
    setTargets(prev => prev.map(t => t.id === targetId ? { ...t, clicked: true } : t));
    setScore(prev => prev + 10);
    
    // Remove clicked target after animation
    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== targetId));
    }, 200);
  };

  return (
    <div ref={gameRef} className="relative w-full h-64 bg-gradient-to-br from-red-100 to-red-200 rounded-lg overflow-hidden">
      <div className="absolute top-2 left-2 text-lg font-bold text-red-700">
        Score: {score} | Time: {timeLeft}s
      </div>
      {targets.map(target => (
        <motion.div
          key={target.id}
          className={`absolute w-12 h-12 rounded-full cursor-pointer flex items-center justify-center ${
            target.clicked ? 'bg-green-500' : 'bg-red-500 hover:bg-red-600'
          }`}
          style={{ left: target.x, top: target.y }}
          initial={{ scale: 0 }}
          animate={{ scale: target.clicked ? 0 : 1 }}
          exit={{ scale: 0 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => !target.clicked && handleTargetClick(target.id)}
        >
          <Crosshair className="w-6 h-6 text-white" />
        </motion.div>
      ))}
    </div>
  );
};

const MemoryGame: React.FC<{ onComplete: (score: number) => void; timeLeft: number }> = ({ onComplete, timeLeft }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<'waiting' | 'showing' | 'input'>('waiting');

  const icons = [Mountain, Camera, Users, CloudRain, MapPin, Calendar];

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete(level * 25);
      return;
    }
    startNewLevel();
  }, [level]);

  const startNewLevel = () => {
    const newSequence = Array.from({ length: level + 2 }, () => Math.floor(Math.random() * 6));
    setSequence(newSequence);
    setUserSequence([]);
    setGameState('showing');
    setShowingSequence(true);
    
    setTimeout(() => {
      setShowingSequence(false);
      setGameState('input');
    }, (newSequence.length + 1) * 800);
  };

  const handleIconClick = (index: number) => {
    if (gameState !== 'input') return;

    const newUserSequence = [...userSequence, index];
    setUserSequence(newUserSequence);

    if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
      // Wrong selection
      onComplete(Math.max(0, (level - 1) * 25));
      return;
    }

    if (newUserSequence.length === sequence.length) {
      // Level completed
      setLevel(prev => prev + 1);
      setGameState('waiting');
    }
  };

  return (
    <div className="w-full h-64 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg p-4">
      <div className="text-center mb-4">
        <div className="text-lg font-bold text-emerald-700">
          Level {level} | Score: {level * 25} | Time: {timeLeft}s
        </div>
        <div className="text-sm text-emerald-600">
          {gameState === 'showing' && 'Watch the sequence...'}
          {gameState === 'input' && 'Repeat the sequence!'}
          {gameState === 'waiting' && 'Get ready...'}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {icons.map((Icon, index) => (
          <motion.button
            key={index}
            className={`w-16 h-16 rounded-lg flex items-center justify-center transition-all duration-300 ${
              showingSequence && sequence[userSequence.length] === index
                ? 'bg-emerald-500 scale-110'
                : gameState === 'input'
                ? 'bg-emerald-400 hover:bg-emerald-500 hover:scale-105'
                : 'bg-emerald-300'
            }`}
            onClick={() => handleIconClick(index)}
            disabled={gameState !== 'input'}
            animate={showingSequence && sequence.includes(index) ? { scale: [1, 1.1, 1] } : {}}
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const TriviaGame: React.FC<{ onComplete: (score: number) => void; timeLeft: number }> = ({ onComplete, timeLeft }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const questions = [
    {
      question: "What's the best time for monsoon trekking in Maharashtra?",
      options: ["March-May", "June-September", "October-February", "Year-round"],
      correct: 1
    },
    {
      question: "Essential item for waterfall rappelling safety?",
      options: ["Sunglasses", "Helmet", "Phone", "Snacks"],
      correct: 1
    },
    {
      question: "Recommended group size for trekking adventures?",
      options: ["1-2 people", "3-6 people", "10+ people", "Solo only"],
      correct: 1
    }
  ];

  useEffect(() => {
    if (timeLeft <= 0 || currentQuestion >= questions.length) {
      onComplete(score);
    }
  }, [timeLeft, currentQuestion, score, onComplete]);

  const handleAnswer = (selectedIndex: number) => {
    if (answered) return;
    
    setAnswered(true);
    if (selectedIndex === questions[currentQuestion].correct) {
      setScore(prev => prev + 50);
    }
    
    setTimeout(() => {
      setCurrentQuestion(prev => prev + 1);
      setAnswered(false);
    }, 1500);
  };

  if (currentQuestion >= questions.length) {
    return (
      <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-purple-600" />
          <div className="text-2xl font-bold text-purple-700">Quiz Complete!</div>
          <div className="text-lg text-purple-600">Final Score: {score}</div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4">
      <div className="text-center mb-4">
        <div className="text-lg font-bold text-purple-700">
          Question {currentQuestion + 1}/{questions.length} | Score: {score} | Time: {timeLeft}s
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{question.question}</h3>
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              className={`w-full p-3 text-left rounded-lg transition-all duration-300 ${
                answered
                  ? index === question.correct
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                  : 'bg-gray-100 hover:bg-purple-100 hover:text-purple-700'
              }`}
              onClick={() => handleAnswer(index)}
              disabled={answered}
              whileHover={!answered ? { scale: 1.02 } : {}}
              whileTap={!answered ? { scale: 0.98 } : {}}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const InteractiveChallenges: React.FC<InteractiveChallengesProps> = ({
  userProgress,
  onChallengeComplete,
  onPointsEarned,
  showCompact = false,
  className = ''
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>(CHALLENGES);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'completed'>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  // Timer for active challenges
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft <= 0) {
      handleChallengeComplete(0); // Time's up
    }
  }, [gameState, timeLeft]);

  const startChallenge = (challenge: Challenge) => {
    // Check requirements
    if (challenge.requirements && userProgress) {
      const hasRequirements = challenge.requirements.every(req => 
        userProgress.pointsHistory?.some((p: any) => p.action === req)
      );
      if (!hasRequirements) {
        alert('Complete prerequisite challenges first!');
        return;
      }
    }

    setActiveChallenge(challenge);
    setTimeLeft(challenge.timeLimit || challenge.duration);
    setGameState('playing');
  };

  const handleChallengeComplete = useCallback((score: number) => {
    if (!activeChallenge) return;

    const timeElapsed = (activeChallenge.timeLimit || activeChallenge.duration) - timeLeft;
    const accuracy = Math.min(score / (activeChallenge.points * 0.8), 1); // Base accuracy on expected score
    const timeBonus = Math.max(0, (timeLeft / (activeChallenge.timeLimit || activeChallenge.duration)) * 0.2);
    const bonusPoints = Math.floor(score * activeChallenge.bonusMultiplier * timeBonus);
    const totalPoints = score + bonusPoints;
    const completed = score > 0;
    const perfectScore = accuracy >= 0.9 && timeBonus > 0.1;

    const result: ChallengeResult = {
      challengeId: activeChallenge.id,
      score,
      timeElapsed,
      accuracy,
      bonusPoints,
      totalPoints,
      completed,
      perfectScore
    };

    // Update challenge data
    setChallenges(prev => prev.map(c => 
      c.id === activeChallenge.id 
        ? { 
            ...c, 
            completed: completed, 
            bestScore: Math.max(c.bestScore || 0, totalPoints),
            attempts: c.attempts + 1
          }
        : c
    ));

    setGameState('completed');
    
    // Award points and trigger callbacks
    onPointsEarned?.(totalPoints, `challenge_${activeChallenge.id}`);
    onChallengeComplete?.(result);

    // Reset after showing results
    setTimeout(() => {
      setActiveChallenge(null);
      setGameState('idle');
    }, 3000);
  }, [activeChallenge, timeLeft, onChallengeComplete, onPointsEarned]);

  const renderGameComponent = () => {
    if (!activeChallenge) return null;

    switch (activeChallenge.type) {
      case 'reaction':
        if (activeChallenge.id === 'click_speed') {
          return <ClickSpeedGame onComplete={handleChallengeComplete} timeLeft={timeLeft} />;
        }
        break;
      case 'memory':
        if (activeChallenge.id === 'mountain_memory') {
          return <MemoryGame onComplete={handleChallengeComplete} timeLeft={timeLeft} />;
        }
        break;
      case 'trivia':
        if (activeChallenge.id === 'adventure_trivia') {
          return <TriviaGame onComplete={handleChallengeComplete} timeLeft={timeLeft} />;
        }
        break;
      // Add other game types as needed
    }
    return null;
  };

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-orange-600 bg-orange-100';
      case 'expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const availableChallenges = challenges.filter(c => c.isActive);
  const completedCount = challenges.filter(c => c.completed).length;

  if (showCompact) {
    return (
      <motion.button
        onClick={() => setShowChallengeModal(true)}
        className={`bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5" />
          <span className="font-semibold">Challenges</span>
          {completedCount > 0 && (
            <div className="bg-white text-indigo-600 px-2 py-1 rounded-full text-xs font-bold">
              {completedCount}
            </div>
          )}
        </div>
      </motion.button>
    );
  }

  return (
    <div className={className}>
      {/* Challenge Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {availableChallenges.map(challenge => (
          <motion.div
            key={challenge.id}
            className={`bg-gradient-to-br ${challenge.bgColor} rounded-xl p-6 text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              challenge.completed ? 'ring-4 ring-yellow-300' : ''
            }`}
            whileHover={{ y: -5 }}
            onClick={() => startChallenge(challenge)}
          >
            <div className="flex items-center justify-between mb-4">
              <challenge.icon className="w-8 h-8" />
              <div className="flex items-center gap-2">
                {challenge.completed && <Trophy className="w-5 h-5 text-yellow-300" />}
                <div className={`px-2 py-1 rounded-full text-xs font-bold ${getDifficultyColor(challenge.difficulty)} text-gray-700`}>
                  {challenge.difficulty.toUpperCase()}
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2">{challenge.name}</h3>
            <p className="text-white/90 text-sm mb-4">{challenge.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium">{challenge.points}pts</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{challenge.duration}s</span>
                </div>
              </div>
              
              {challenge.bestScore && (
                <div className="text-right">
                  <div className="text-xs opacity-80">Best</div>
                  <div className="font-bold">{challenge.bestScore}</div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="text-xs opacity-90">
                Attempts: {challenge.attempts} | Bonus: x{challenge.bonusMultiplier}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Challenge Modal */}
      <AnimatePresence>
        {activeChallenge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{activeChallenge.name}</h2>
                  <p className="text-gray-600">{activeChallenge.instructions}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{timeLeft}s</div>
                  <div className="text-sm text-gray-600">Time Left</div>
                </div>
              </div>

              {gameState === 'playing' && renderGameComponent()}

              {gameState === 'completed' && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Trophy className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Challenge Complete!</h3>
                  <div className="text-lg text-emerald-600">Points Earned: {activeChallenge.points}</div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenges Modal */}
      <AnimatePresence>
        {showChallengeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Adventure Challenges</h2>
                <button
                  onClick={() => setShowChallengeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {availableChallenges.map(challenge => (
                  <div
                    key={challenge.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                      challenge.completed 
                        ? 'border-emerald-300 bg-emerald-50' 
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                    onClick={() => {
                      setShowChallengeModal(false);
                      startChallenge(challenge);
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${challenge.bgColor} flex items-center justify-center`}>
                        <challenge.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{challenge.name}</h3>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4" />
                        <span>{challenge.points}pts</span>
                        {challenge.completed && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};