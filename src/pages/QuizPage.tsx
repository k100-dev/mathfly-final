import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { QuestionCard } from '../components/quiz/QuestionCard';
import { ResultsModal } from '../components/quiz/ResultsModal';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useQuiz } from '../hooks/useQuiz';
import { DifficultLevel } from '../types/game';

export function QuizPage() {
  const navigate = useNavigate();
  const { level } = useParams<{ level: string }>();
  const { session, loading, startQuiz, submitAnswer, finishQuiz } = useQuiz();
  const [timeLeft, setTimeLeft] = useState(45);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentLevel = (level as DifficultLevel) || 'facil';

  useEffect(() => {
    startQuiz(currentLevel);
  }, [currentLevel, startQuiz]);

  useEffect(() => {
    if (!session) return;

    // Reset timer for each new question
    setTimeLeft(45);

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
  }, [session?.currentQuestionIndex]);

  const handleTimeUp = () => {
    if (isAnswered) return;
    handleAnswer(''); // Empty answer for timeout
  };

  const handleAnswer = async (answer: string) => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    const result = submitAnswer(answer);
    
    if (result?.isComplete) {
      // Quiz completed
      setTimeout(async () => {
        const results = await finishQuiz();
        if (results) {
          setQuizResults(results);
          setShowResults(true);
        }
      }, 1500); // Reduzir delay para melhor UX
    } else {
      // Next question
      setTimeout(() => {
        setIsAnswered(false);
      }, 1500); // Reduzir delay entre perguntas
    }
  };

  const handleBackToDashboard = () => {
    setShowResults(false);
    setQuizResults(null);
    navigate('/');
  };

  const handlePlayAgain = () => {
    setShowResults(false);
    setQuizResults(null);
    setIsAnswered(false);
    startQuiz(currentLevel);
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Preparando quiz..." />
      </div>
    );
  }

  if (session.currentQuestionIndex >= session.questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Finalizando quiz..." />
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
            <span>Voltar</span>
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">
              Nível <span className="capitalize">{currentLevel}</span>
            </h1>
            <p className="text-slate-400">
              Pontuação atual: <span className="text-indigo-400 font-semibold">{session.score}</span>
            </p>
          </div>
          
          <div />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={session.currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionCard
              question={currentQuestion}
              questionNumber={session.currentQuestionIndex + 1}
              totalQuestions={session.questions.length}
              timeLeft={timeLeft}
              onAnswer={handleAnswer}
              isAnswered={isAnswered}
            />
          </motion.div>
        </AnimatePresence>

        {/* Results Modal */}
        {showResults && quizResults && (
          <ResultsModal
            isOpen={showResults}
            onClose={() => setShowResults(false)}
            results={quizResults}
            onPlayAgain={handlePlayAgain}
            onBackToDashboard={handleBackToDashboard}
          />
        )}
      </div>
    </div>
  );
}