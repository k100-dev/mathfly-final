import { useState, useCallback } from 'react';
import { QuizSession, DifficultLevel } from '../types/game';
import { QuizService } from '../services/QuizService';
import { useAuth } from './useAuth';

const POINTS_BY_LEVEL = {
  facil: 10,
  medio: 20,
  dificil: 30,
  expert: 50
};

export function useQuiz() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const startQuiz = useCallback(async (nivel: DifficultLevel, questionCount: number = 5) => {
    if (!user) {
      setError('Usuário não autenticado');
      return null;
    } 
    
    console.log('🎮 Iniciando quiz para nível:', nivel);
    setLoading(true);
    setError(null);
    
    try {
      const questions = await QuizService.getQuestionsByPhase(nivel, questionCount);
      
      if (questions.length === 0) {
        throw new Error(`Nenhuma questão encontrada para o nível ${nivel}`);
      }

      const newSession: QuizSession = {
        questions,
        currentQuestionIndex: 0,
        answers: [],
        score: 0,
        startTime: Date.now(),
        nivel
      };
      
      setSession(newSession);
      console.log('✅ Quiz iniciado com sucesso');
      return newSession;
    } catch (error) {
      console.error('❌ Erro ao iniciar quiz:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao carregar questões');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const submitAnswer = useCallback((answer: string) => {
    if (!session) {
      console.warn('⚠️ Tentativa de submeter resposta sem sessão ativa');
      return null;
    }

    console.log('📝 Submetendo resposta:', answer);
    
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const isCorrect = answer === currentQuestion.resposta_correta;
    
    // Calculate time bonus (max 30 seconds, bonus decreases over time)
    const currentTime = Date.now();
    const questionStartTime = session.startTime + (session.answers.length * 30000); // 30s per question
    const timeSpent = Math.max(0, (currentTime - questionStartTime) / 1000);
    const timeBonus = Math.max(0, Math.floor((30 - timeSpent) / 5)); // Bonus decreases every 5 seconds
    
    const basePoints = POINTS_BY_LEVEL[session.nivel];
    const questionPoints = isCorrect ? basePoints + timeBonus : 0;

    console.log('🎯 Resultado:', { isCorrect, questionPoints, timeBonus });

    const updatedSession = {
      ...session,
      answers: [...session.answers, answer],
      score: session.score + questionPoints
      // NÃO incrementar currentQuestionIndex aqui - será feito depois do feedback
    };

    setSession(updatedSession);

    return {
      isCorrect,
      correctAnswer: currentQuestion.resposta_correta,
      points: questionPoints,
      isComplete: updatedSession.answers.length === updatedSession.questions.length
    };
  }, [session]);

  const nextQuestion = useCallback(() => {
    if (!session) {
      console.warn('⚠️ Tentativa de avançar pergunta sem sessão ativa');
      return null;
    }

    console.log('➡️ Avançando para próxima pergunta');
    
    const updatedSession = {
      ...session,
      currentQuestionIndex: session.currentQuestionIndex + 1
    };

    setSession(updatedSession);
    return updatedSession;
  }, [session]);

  const finishQuiz = useCallback(async () => {
    if (!session || !user) {
      console.warn('⚠️ Tentativa de finalizar quiz sem sessão ou usuário');
      return null;
    }

    console.log('🏁 Finalizando quiz...');
    
    const endTime = Date.now();
    const totalTime = Math.floor((endTime - session.startTime) / 1000);
    const correctAnswers = session.answers.filter(
      (answer, index) => answer === session.questions[index].resposta_correta
    ).length;

    const results = {
      score: session.score,
      correctAnswers,
      totalQuestions: session.questions.length,
      accuracy: (correctAnswers / session.questions.length) * 100,
      timeSpent: totalTime,
      nivel: session.nivel
    };

    try {
      // Salvar resultado no Supabase
      await QuizService.saveQuizResult(user.id, results);
      console.log('✅ Quiz finalizado e salvo com sucesso');
      return results;
    } catch (error) {
      console.error('❌ Erro ao salvar resultado:', error);
      
      // Salvar offline se falhar
      QuizService.saveOfflineProgress(results);
      
      // Ainda retornar os resultados para mostrar ao usuário
      return results;
    }
  }, [session, user]);

  const resetQuiz = useCallback(() => {
    console.log('🔄 Resetando quiz');
    setSession(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    session,
    loading,
    error,
    startQuiz,
    submitAnswer,
    nextQuestion,
    finishQuiz,
    resetQuiz
  };
}