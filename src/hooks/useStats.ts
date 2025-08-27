import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface UserStats {
  totalScore: number;
  totalGames: number;
  averageAccuracy: number;
  bestPhase: string;
  lastPlayed: string;
}

interface RankingEntry {
  nome: string;
  pontuacao: number;
  data_partida: string;
}

interface Performance {
  id: string;
  phase: number;
  correct_answers: number;
  points_earned: number;
  completed_at: string;
  accuracy: number;
}

export function useStats() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [globalRanking, setGlobalRanking] = useState<RankingEntry[]>([]);
  const [personalPerformance, setPersonalPerformance] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadUserStats = async () => {
    if (!user) {
      console.log('⚠️ Usuário não autenticado, definindo stats padrão');
      setUserStats({
        totalScore: 0,
        totalGames: 0,
        averageAccuracy: 0,
        bestPhase: 'facil',
        lastPlayed: new Date().toISOString()
      });
      return;
    }

    try {
      console.log('📊 Carregando estatísticas do usuário:', user.id);
      
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      const { data: results } = await supabase
        .from('phase_results')
        .select('correct_answers, completed_at')
        .eq('user_id', user.id);

      const progressData = progress && progress.length > 0 ? progress[0] : null;
      const totalScore = progressData?.total_points || 0;
      const totalGames = results?.length || 0;
      const totalCorrect = progressData?.total_correct || 0;
      const averageAccuracy = totalGames > 0 ? (totalCorrect / (totalGames * 5)) * 100 : 0;

      const stats: UserStats = {
        totalScore,
        totalGames,
        averageAccuracy,
        bestPhase: 'facil',
        lastPlayed: results?.[0]?.completed_at || new Date().toISOString()
      };

      console.log('✅ Estatísticas carregadas:', stats);
      setUserStats(stats);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      // Set default stats if error
      setUserStats({
        totalScore: 0,
        totalGames: 0,
        averageAccuracy: 0,
        bestPhase: 'facil',
        lastPlayed: new Date().toISOString()
      });
    }
  };

  const loadGlobalRanking = async () => {
    try {
      console.log('🏆 Carregando ranking global...');
      
      const { data } = await supabase
        .from('phase_results')
        .select(`
          points_earned,
          completed_at,
          users!inner(name)
        `)
        .order('points_earned', { ascending: false })
        .limit(20);

      if (data) {
        const rankings: RankingEntry[] = data.map((entry: any) => ({
          nome: entry.users?.name || 'Usuário Anônimo',
          pontuacao: entry.points_earned,
          data_partida: entry.completed_at
        }));
        console.log('✅ Ranking carregado:', rankings.length, 'entradas');
        setGlobalRanking(rankings);
      } else {
        console.log('📊 Nenhum dado de ranking encontrado');
        setGlobalRanking([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar ranking:', error);
      setGlobalRanking([]);
    }
  };

  const loadPersonalPerformance = async () => {
    if (!user) return;

    try {
      console.log('📈 Carregando performance pessoal...');
      
      const { data } = await supabase
        .from('phase_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (data) {
        const performances: Performance[] = data.map((p: any) => ({
          ...p,
          accuracy: (p.correct_answers / 5) * 100
        }));
        console.log('✅ Performance carregada:', performances.length, 'registros');
        setPersonalPerformance(performances);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar performance:', error);
      setPersonalPerformance([]);
    }
  };

  const refreshStats = async () => {
    console.log('🔄 Atualizando todas as estatísticas...');
    setLoading(true);
    
    try {
      await Promise.all([
        loadUserStats(),
        loadGlobalRanking(),
        loadPersonalPerformance()
      ]);
      console.log('✅ Todas as estatísticas atualizadas');
    } catch (error) {
      console.error('❌ Erro ao atualizar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('👤 Usuário detectado, carregando estatísticas...');
      refreshStats();
    } else {
      console.log('🚫 Sem usuário, limpando estatísticas...');
      setUserStats(null);
      setGlobalRanking([]);
      setPersonalPerformance([]);
      setLoading(false);
    }
  }, [user]);

  // Real-time ranking updates
  useEffect(() => {
    console.log('📡 Configurando atualizações em tempo real...');
    
    const subscription = supabase
      .channel('ranking_updates')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'phase_results' },
        (payload) => {
          console.log('🔄 Novo resultado detectado, atualizando ranking...', payload);
          loadGlobalRanking();
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Desconectando atualizações em tempo real');
      supabase.removeChannel(subscription);
    };
  }, []);

  return {
    userStats,
    globalRanking,
    personalPerformance,
    loading,
    refreshStats
  };
}