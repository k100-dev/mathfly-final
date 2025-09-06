import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { QuizIntro } from '../components/quiz/QuizIntro';
import { QuizQuestion } from '../components/quiz/QuizQuestion';
import { QuizProgress } from '../components/quiz/QuizProgress';
import { QuizResults } from '../components/quiz/QuizResults';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useQuiz } from '../hooks/useQuiz';
import { DifficultLevel } from '../types/game';

type QuizState = 'intro' | 'playing' | 'results' | 'loading';

const LEVEL_ORDER: DifficultLevel[] = ['facil', 'medio', 'dificil', 'expert'];

export function QuizPage() {
  const navigate = useNavigate();
  const { level } = useParams<{ level: string }>();
  const { session, loading, startQuiz, submitAnswer, finishQuiz, resetQuiz } = useQuiz();
  
  const [quizState, setQuizState] = useState<QuizState>('intro');
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizResults, setQuizResults] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);

  const currentLevel = (level as DifficultLevel) || 'facil';
  const currentLevelIndex = LEVEL_ORDER.indexOf(currentLevel);
  const hasNextLevel = currentLevelIndex < LEVEL_ORDER.length - 1;
  const nextLevel = hasNextLevel ? LEVEL_ORDER[currentLevelIndex + 1] : null;

  // Reset quiz when level changes
  useEffect(() => {
    resetQuiz();
    setQuizState('intro');
    setQuizResults(null);
    setSelectedAnswer('');
    setShowFeedback(false);
  }, [level, resetQuiz]);

  // Timer management
  useEffect(() => {
    if (quizState !== 'playing' || !session || showFeedback) return;

    setTimeLeft(30); // Reset timer for new question

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.currentQuestionIndex, quizState, showFeedback]);

  const handleStartQuiz = async () => {
    setQuizState('loading');
    const newSession = await startQuiz(currentLevel, 5);
    if (newSession) {
      setQuizState('playing');
    } else {
      setQuizState('intro');
    }
  };

  const handleTimeUp = () => {
    if (showFeedback) return;
    handleAnswer(''); // Empty answer for timeout
  };

  const handleAnswer = async (answer: string) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    const result = submitAnswer(answer);
    
    if (result?.isComplete) {
      // Quiz completed - wait for feedback then show results
      setTimeout(async () => {
        setQuizState('loading');
        const results = await finishQuiz();
        if (results) {
          setQuizResults(results);
          setQuizState('results');
        }
      }, 2000);
    } else {
      // Next question - wait for feedback then continue
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedAnswer('');
      }, 2000);
    }
  };

  const handlePlayAgain = () => {
    resetQuiz();
    setQuizState('intro');
    setQuizResults(null);
    setSelectedAnswer('');
    setShowFeedback(false);
  };

  const handleNextLevel = () => {
    if (nextLevel) {
      navigate(`/quiz/${nextLevel}`);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  // Loading state
  if (quizState === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text={
          quizState === 'loading' && session ? "Finalizando quiz..." : "Preparando quiz..."
        } />
      </div>
    );
  }

  // Intro state
  if (quizState === 'intro') {
    return (
      <QuizIntro
        level={currentLevel}
        onStart={handleStartQuiz}
        totalQuestions={5}
        timePerQuestion={30}
      />
    );
  }

  // Results state
  if (quizState === 'results' && quizResults) {
    return (
      <QuizResults
        results={quizResults}
        onPlayAgain={handlePlayAgain}
        onBackToDashboard={handleBackToDashboard}
        onNextLevel={hasNextLevel ? handleNextLevel : undefined}
        hasNextLevel={hasNextLevel}
      />
    );
  }

  // Playing state
  if (quizState === 'playing' && session) {
    if (session.currentQuestionIndex >= session.questions.length) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Processando resultados..." />
        </div>
      );
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sair</span>
            </Button>
            
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">
                Nível <span className="capitalize">{currentLevel}</span>
              </h1>
            </div>
            
            <div />
          </div>

          {/* Progress */}
          <QuizProgress
            currentQuestion={session.currentQuestionIndex + 1}
            totalQuestions={session.questions.length}
            score={session.score}
            timeLeft={timeLeft}
            maxTime={30}
          />

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={session.currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <QuizQuestion
                question={currentQuestion}
                onAnswer={handleAnswer}
                isAnswered={showFeedback}
                selectedAnswer={selectedAnswer}
                correctAnswer={currentQuestion.resposta_correta}
                showFeedback={showFeedback}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Carregando..." />
    </div>
  );
}