import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Question } from '../../types/game';

interface QuizQuestionProps {
  question: Question;
  onAnswer: (answer: string) => void;
  isAnswered: boolean;
  selectedAnswer?: string;
  correctAnswer?: string;
  showFeedback: boolean;
}

export function QuizQuestion({
  question,
  onAnswer,
  isAnswered,
  selectedAnswer,
  correctAnswer,
  showFeedback
}: QuizQuestionProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const options = [
    { key: 'a', text: question.alternativa_a },
    { key: 'b', text: question.alternativa_b },
    { key: 'c', text: question.alternativa_c },
    { key: 'd', text: question.alternativa_d }
  ];

  const getOptionStyle = (optionKey: string) => {
    if (!showFeedback) {
      if (hoveredOption === optionKey && !isAnswered) {
        return 'bg-slate-600 border-indigo-500 transform scale-105';
      }
      return 'bg-slate-700 hover:bg-slate-600 border-slate-600';
    }

    // Show feedback
    if (optionKey === correctAnswer) {
      return 'bg-green-500/20 border-green-500 text-green-400';
    }
    if (optionKey === selectedAnswer && optionKey !== correctAnswer) {
      return 'bg-red-500/20 border-red-500 text-red-400';
    }
    return 'bg-slate-700/50 border-slate-600 opacity-60';
  };

  const getOptionIcon = (optionKey: string) => {
    if (!showFeedback) return null;
    
    if (optionKey === correctAnswer) {
      return <CheckCircle className="w-6 h-6 text-green-400" />;
    }
    if (optionKey === selectedAnswer && optionKey !== correctAnswer) {
      return <XCircle className="w-6 h-6 text-red-400" />;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="p-8">
        {/* Question */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-relaxed">
            {question.enunciado}
          </h2>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              question.nivel === 'facil' ? 'bg-green-500/20 text-green-400' :
              question.nivel === 'medio' ? 'bg-blue-500/20 text-blue-400' :
              question.nivel === 'dificil' ? 'bg-orange-500/20 text-orange-400' :
              'bg-purple-500/20 text-purple-400'
            }`}>
              {question.nivel.charAt(0).toUpperCase() + question.nivel.slice(1)}
            </span>
          </div>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {options.map((option, index) => (
              <motion.button
                key={option.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={!isAnswered ? { scale: 1.02 } : {}}
                whileTap={!isAnswered ? { scale: 0.98 } : {}}
                onClick={() => !isAnswered && onAnswer(option.key)}
                onMouseEnter={() => !isAnswered && setHoveredOption(option.key)}
                onMouseLeave={() => setHoveredOption(null)}
                disabled={isAnswered}
                className={`
                  p-6 rounded-xl border-2 text-left transition-all duration-300
                  ${getOptionStyle(option.key)}
                  ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}
                  flex items-center space-x-4 min-h-[80px]
                `}
              >
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-lg
                  ${showFeedback && option.key === correctAnswer ? 'border-green-400' :
                    showFeedback && option.key === selectedAnswer && option.key !== correctAnswer ? 'border-red-400' :
                    'border-current'
                  }
                `}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="flex-1 text-lg font-medium">{option.text}</span>
                {getOptionIcon(option.key)}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Feedback Message */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 text-center"
            >
              {selectedAnswer === correctAnswer ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <p className="text-green-400 font-semibold text-lg">
                    🎉 Correto! Muito bem!
                  </p>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 font-semibold text-lg">
                    ❌ Incorreto. A resposta certa era a alternativa {correctAnswer?.toUpperCase()}.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}