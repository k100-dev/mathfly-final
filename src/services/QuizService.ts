import { supabase } from '../lib/supabase';
import { Question, DifficultLevel } from '../types/game';

export class QuizService {
  // Cache para perguntas já carregadas
  private static questionCache: Map<DifficultLevel, Question[]> = new Map();

  // Banco de questões completo e funcional
  private static MOCK_QUESTIONS: Record<DifficultLevel, Question[]> = {
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
      },
      {
        id_pergunta: 'f6',
        enunciado: 'Quanto é 9 × 6?',
        alternativa_a: '52',
        alternativa_b: '54',
        alternativa_c: '56',
        alternativa_d: '58',
        resposta_correta: 'b',
        nivel: 'facil'
      },
      {
        id_pergunta: 'f7',
        enunciado: 'Quanto é 72 ÷ 8?',
        alternativa_a: '8',
        alternativa_b: '9',
        alternativa_c: '10',
        alternativa_d: '7',
        resposta_correta: 'b',
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
      },
      {
        id_pergunta: 'm6',
        enunciado: 'Quanto é 15% de 200?',
        alternativa_a: '25',
        alternativa_b: '30',
        alternativa_c: '35',
        alternativa_d: '40',
        resposta_correta: 'b',
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

  static async getQuestionsByPhase(nivel: DifficultLevel, count: number = 5): Promise<Question[]> {
    try {
      console.log(`🔍 Buscando ${count} questões para nível: ${nivel}`);
      
      // Verificar cache primeiro
      if (this.questionCache.has(nivel)) {
        const cachedQuestions = this.questionCache.get(nivel)!;
        console.log(`📦 Usando questões do cache: ${cachedQuestions.length} disponíveis`);
        return this.shuffleArray(cachedQuestions).slice(0, count);
      }

      // Buscar do banco de dados (futuro)
      // const { data, error } = await supabase
      //   .from('questions')
      //   .select('*')
      //   .eq('nivel', nivel)
      //   .limit(count * 2); // Buscar mais para poder embaralhar

      // Por enquanto, usar dados mock
      const levelQuestions = this.MOCK_QUESTIONS[nivel] || [];
      
      if (levelQuestions.length === 0) {
        throw new Error(`Nenhuma questão encontrada para o nível ${nivel}`);
      }

      // Armazenar no cache
      this.questionCache.set(nivel, levelQuestions);
      
      const selectedQuestions = this.shuffleArray(levelQuestions).slice(0, count);
      console.log(`✅ ${selectedQuestions.length} questões selecionadas para ${nivel}`);
      
      return selectedQuestions;
    } catch (error) {
      console.error('❌ Erro ao buscar questões:', error);
      throw error;
    }
  }

  static async saveQuizResult(userId: string, result: {
    nivel: DifficultLevel;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
  }): Promise<void> {
    try {
      console.log('💾 Salvando resultado do quiz:', result);

      const phaseNumber = ['facil', 'medio', 'dificil', 'expert'].indexOf(result.nivel) + 1;

      // Salvar resultado da fase
      const { error: phaseError } = await supabase.from('phase_results').insert({
        user_id: userId,
        phase: phaseNumber,
        correct_answers: result.correctAnswers,
        points_earned: result.score
      });

      if (phaseError) {
        console.error('❌ Erro ao salvar resultado da fase:', phaseError);
        throw phaseError;
      }

      // Atualizar progresso do usuário
      await this.updateUserProgress(userId, result.score, result.correctAnswers, phaseNumber);
      
      console.log('✅ Resultado salvo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar resultado:', error);
      throw error;
    }
  }

  private static async updateUserProgress(
    userId: string, 
    score: number, 
    correctAnswers: number, 
    phaseNumber: number
  ): Promise<void> {
    try {
      // Buscar progresso atual
      const { data: currentProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (currentProgress && currentProgress.length > 0) {
        // Atualizar progresso existente
        const progressData = currentProgress[0];
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            total_correct: progressData.total_correct + correctAnswers,
            total_points: progressData.total_points + score,
            max_phase: Math.max(progressData.max_phase, phaseNumber)
          })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      } else {
        // Criar novo progresso
        const { error: insertError } = await supabase.from('user_progress').insert({
          user_id: userId,
          max_phase: phaseNumber,
          total_correct: correctAnswers,
          total_points: score
        });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar progresso:', error);
      throw error;
    }
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Salvar progresso offline
  static saveOfflineProgress(result: any): void {
    try {
      const offlineData = JSON.parse(localStorage.getItem('mathfly_offline_progress') || '[]');
      offlineData.push({
        ...result,
        timestamp: Date.now(),
        synced: false
      });
      localStorage.setItem('mathfly_offline_progress', JSON.stringify(offlineData));
      console.log('💾 Progresso salvo offline');
    } catch (error) {
      console.error('❌ Erro ao salvar offline:', error);
    }
  }

  // Sincronizar dados offline
  static async syncOfflineProgress(userId: string): Promise<void> {
    try {
      const offlineData = JSON.parse(localStorage.getItem('mathfly_offline_progress') || '[]');
      const unsyncedData = offlineData.filter((item: any) => !item.synced);

      for (const result of unsyncedData) {
        await this.saveQuizResult(userId, result);
        result.synced = true;
      }

      localStorage.setItem('mathfly_offline_progress', JSON.stringify(offlineData));
      console.log(`✅ ${unsyncedData.length} resultados sincronizados`);
    } catch (error) {
      console.error('❌ Erro ao sincronizar dados offline:', error);
    }
  }
}