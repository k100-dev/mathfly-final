import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { QuizSession, Question } from '../types/game';
import { useAuth } from './useAuth';

type DifficultLevel = 'facil' | 'medio' | 'dificil' | 'expert';

const POINTS_BY_LEVEL = {
  facil: 10,
  medio: 20,
  dificil: 30,
  expert: 50
};

// Banco de questões completo e funcional
const MOCK_QUESTIONS: Record<DifficultLevel, Question[]> = {
  facil: [
    {
      id_pergunta: 'f1',
      enunciado: 'Quanto é 15 + 27?',
      alternativa_a: '42',
      alternativa_b: '41',
      alternativa_c: '43',
      alternativa_d: '40',
      resposta_correta: 'a',
      nivel: 'facil'
    },
    {
      id_pergunta: 'f2',
      enunciado: 'Quanto é 8 × 7?',
      alternativa_a: '54',
      alternativa_b: '56',
      alternativa_c: '58',
      alternativa_d: '52',
      resposta_correta: 'b',
      nivel: 'facil'
    },
    {
      id_pergunta: 'f3',
      enunciado: 'Quanto é 100 - 37?',
      alternativa_a: '63',
      alternativa_b: '73',
      alternativa_c: '67',
      alternativa_d: '53',
      resposta_correta: 'a',
      nivel: 'facil'
    },
    {
      id_pergunta: 'f4',
      enunciado: 'Quanto é 144 ÷ 12?',
      alternativa_a: '11',
      alternativa_b: '13',
      alternativa_c: '12',
      alternativa_d: '14',
      resposta_correta: 'c',
      nivel: 'facil'
    },
    {
      id_pergunta: 'f5',
      enunciado: 'Quanto é 25 + 38?',
      alternativa_a: '63',
      alternativa_b: '61',
      alternativa_c: '65',
      alternativa_d: '67',
      resposta_correta: 'a',
      nivel: 'facil'
    }
  ],
  medio: [
    {
      id_pergunta: 'm1',
      enunciado: 'Quanto é 2/3 + 1/4?',
      alternativa_a: '11/12',
      alternativa_b: '3/7',
      alternativa_c: '5/12',
      alternativa_d: '7/12',
      resposta_correta: 'a',
      nivel: 'medio'
    },
    {
      id_pergunta: 'm2',
      enunciado: 'Qual é a área de um retângulo de 8cm por 5cm?',
      alternativa_a: '40 cm²',
      alternativa_b: '26 cm²',
      alternativa_c: '13 cm²',
      alternativa_d: '35 cm²',
      resposta_correta: 'a',
      nivel: 'medio'
    },
    {
      id_pergunta: 'm3',
      enunciado: 'Se 3x = 15, quanto vale x?',
      alternativa_a: '3',
      alternativa_b: '5',
      alternativa_c: '4',
      alternativa_d: '6',
      resposta_correta: 'b',
      nivel: 'medio'
    },
    {
      id_pergunta: 'm4',
      enunciado: 'Quanto é 0,25 × 8?',
      alternativa_a: '2',
      alternativa_b: '2,5',
      alternativa_c: '1,5',
      alternativa_d: '3',
      resposta_correta: 'a',
      nivel: 'medio'
    },
    {
      id_pergunta: 'm5',
      enunciado: 'Qual é o perímetro de um quadrado com lado 6cm?',
      alternativa_a: '36 cm',
      alternativa_b: '12 cm',
      alternativa_c: '24 cm',
      alternativa_d: '18 cm',
      resposta_correta: 'c',
      nivel: 'medio'
    }
  ],
  dificil: [
    {
      id_pergunta: 'd1',
      enunciado: 'Resolva: x² - 5x + 6 = 0',
      alternativa_a: 'x = 2 ou x = 3',
      alternativa_b: 'x = 1 ou x = 6',
      alternativa_c: 'x = -2 ou x = -3',
      alternativa_d: 'x = 0 ou x = 5',
      resposta_correta: 'a',
      nivel: 'dificil'
    },
    {
      id_pergunta: 'd2',
      enunciado: 'Qual é o volume de um cubo com aresta 4cm?',
      alternativa_a: '16 cm³',
      alternativa_b: '48 cm³',
      alternativa_c: '64 cm³',
      alternativa_d: '32 cm³',
      resposta_correta: 'c',
      nivel: 'dificil'
    },
    {
      id_pergunta: 'd3',
      enunciado: 'Se log₂(x) = 3, quanto vale x?',
      alternativa_a: '6',
      alternativa_b: '9',
      alternativa_c: '8',
      alternativa_d: '12',
      resposta_correta: 'c',
      nivel: 'dificil'
    },
    {
      id_pergunta: 'd4',
      enunciado: 'Quanto é sen(30°)?',
      alternativa_a: '1/2',
      alternativa_b: '√3/2',
      alternativa_c: '√2/2',
      alternativa_d: '1',
      resposta_correta: 'a',
      nivel: 'dificil'
    },
    {
      id_pergunta: 'd5',
      enunciado: 'Resolva o sistema: 2x + y = 7 e x - y = 2',
      alternativa_a: 'x = 3, y = 1',
      alternativa_b: 'x = 2, y = 3',
      alternativa_c: 'x = 4, y = -1',
      alternativa_d: 'x = 1, y = 5',
      resposta_correta: 'a',
      nivel: 'dificil'
    }
  ],
  expert: [
    {
      id_pergunta: 'e1',
      enunciado: 'Resolva: ∫(2x + 1)dx',
      alternativa_a: 'x² + x + C',
      alternativa_b: '2x² + x + C',
      alternativa_c: 'x² + 2x + C',
      alternativa_d: '2x + C',
      resposta_correta: 'a',
      nivel: 'expert'
    },
    {
      id_pergunta: 'e2',
      enunciado: 'Qual é o limite de (x² - 1)/(x - 1) quando x → 1?',
      alternativa_a: '2',
      alternativa_b: '1',
      alternativa_c: '0',
      alternativa_d: '∞',
      resposta_correta: 'a',
      nivel: 'expert'
    },
    {
      id_pergunta: 'e3',
      enunciado: 'Resolva: x³ - 6x² + 11x - 6 = 0',
      alternativa_a: 'x = 1, 2, 3',
      alternativa_b: 'x = 0, 2, 3',
      alternativa_c: 'x = 1, 2, 4',
      alternativa_d: 'x = 2, 3, 4',
      resposta_correta: 'a',
      nivel: 'expert'
    },
    {
      id_pergunta: 'e4',
      enunciado: 'Qual é a transformada de Laplace de f(t) = e^(2t)?',
      alternativa_a: '1/(s-2)',
      alternativa_b: '1/(s+2)',
      alternativa_c: '2/(s-1)',
      alternativa_d: 's/(s-2)',
      resposta_correta: 'a',
      nivel: 'expert'
    },
    {
      id_pergunta: 'e5',
      enunciado: 'Resolva a equação diferencial: dy/dx = 2y',
      alternativa_a: 'y = Ce^(2x)',
      alternativa_b: 'y = C + 2x',
      alternativa_c: 'y = 2Ce^x',
      alternativa_d: 'y = Ce^x + 2',
      resposta_correta: 'a',
      nivel: 'expert'
    }
  ]
};

export function useQuiz() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startQuiz = useCallback(async (nivel: DifficultLevel) => {
    if (!user) {
      setError('Usuário não autenticado');
      return null;
    }
    
    console.log('🎮 Iniciando quiz para nível:', nivel);
    setLoading(true);
    setError(null);
    
    try {
      // Get questions for the level and shuffle them
      const levelQuestions = MOCK_QUESTIONS[nivel] || [];
      console.log('📚 Questões encontradas:', levelQuestions.length);
      
      if (levelQuestions.length === 0) {
        throw new Error(`Nenhuma questão encontrada para o nível ${nivel}`);
      }
      
      const shuffledQuestions = shuffleArray(levelQuestions).slice(0, 5); // Take 5 questions
      console.log('🔀 Questões selecionadas:', shuffledQuestions.length);

      const newSession: QuizSession = {
        questions: shuffledQuestions,
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
    const questionStartTime = session.startTime + (session.answers.length * 45000); // 45s per question
    const timeSpent = Math.max(0, (currentTime - questionStartTime) / 1000);
    const timeBonus = Math.max(0, Math.floor((30 - timeSpent) / 6));
    
    const basePoints = POINTS_BY_LEVEL[session.nivel];
    const questionPoints = isCorrect ? basePoints + timeBonus : 0;

    console.log('🎯 Resultado:', { isCorrect, questionPoints, timeBonus });

    const updatedSession = {
      ...session,
      answers: [...session.answers, answer],
      score: session.score + questionPoints,
      currentQuestionIndex: session.currentQuestionIndex + 1
    };

    setSession(updatedSession);

    return {
      isCorrect,
      correctAnswer: currentQuestion.resposta_correta,
      points: questionPoints,
      isComplete: updatedSession.answers.length === updatedSession.questions.length
    };
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

    try {
      // Save phase result
      const phaseNumber = ['facil', 'medio', 'dificil', 'expert'].indexOf(session.nivel) + 1;
      
      console.log('💾 Salvando resultado da fase:', {
        user_id: user.id,
        phase: phaseNumber,
        correct_answers: correctAnswers,
        points_earned: session.score
      });

      const { error: phaseError } = await supabase.from('phase_results').insert({
        user_id: user.id,
        phase: phaseNumber,
        correct_answers: correctAnswers,
        points_earned: session.score
      });

      if (phaseError) {
        console.error('❌ Erro ao salvar resultado da fase:', phaseError);
      } else {
        console.log('✅ Resultado da fase salvo com sucesso');
      }

      // Update user progress
      const { data: currentProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (currentProgress && currentProgress.length > 0) {
        const progressData = currentProgress[0];
        console.log('📈 Atualizando progresso existente');
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            total_correct: progressData.total_correct + correctAnswers,
            total_points: progressData.total_points + session.score,
            max_phase: Math.max(progressData.max_phase, phaseNumber)
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar progresso:', updateError);
        }
      } else {
        console.log('📊 Criando novo progresso');
        const { error: insertError } = await supabase.from('user_progress').insert({
          user_id: user.id,
          max_phase: phaseNumber,
          total_correct: correctAnswers,
          total_points: session.score
        });

        if (insertError) {
          console.error('❌ Erro ao criar progresso:', insertError);
        }
      }

      const results = {
        score: session.score,
        correctAnswers,
        totalQuestions: session.questions.length,
        accuracy: (correctAnswers / session.questions.length) * 100,
        timeSpent: totalTime,
        nivel: session.nivel
      };

      console.log('🎉 Quiz finalizado com sucesso:', results);
      setSession(null);
      return results;
    } catch (error) {
      console.error('❌ Erro ao finalizar quiz:', error);
      setError('Erro ao salvar resultados do quiz');
      return null;
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
    finishQuiz,
    resetQuiz
  };
}