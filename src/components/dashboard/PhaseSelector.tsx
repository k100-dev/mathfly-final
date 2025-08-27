import { motion } from 'framer-motion';
import { Play, Lock, Star } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DifficultLevel } from '../../types/game';

interface Phase {
  id: DifficultLevel;
  name: string;
  description: string;
  color: string;
  difficulty: number;
  unlocked: boolean;
  completed: boolean;
  bestScore?: number;
}

interface PhaseSelectorProps {
  onSelectPhase: (level: DifficultLevel) => void;
  userStats: any;
}

export function PhaseSelector({ onSelectPhase, userStats }: PhaseSelectorProps) {
  const phases: Phase[] = [
    {
      id: 'facil',
      name: 'Fácil',
      description: 'Aritmética básica e operações fundamentais',
      color: 'from-green-500 to-emerald-500',
      difficulty: 1,
      unlocked: true,
      completed: false,
      bestScore: userStats?.facil?.bestScore
    },
    {
      id: 'medio',
      name: 'Médio',
      description: 'Frações, decimais e geometria básica',
      color: 'from-blue-500 to-cyan-500',
      difficulty: 2,
      unlocked: true, // Para demo, todas desbloqueadas
      completed: false,
      bestScore: userStats?.medio?.bestScore
    },
    {
      id: 'dificil',
      name: 'Difícil',
      description: 'Álgebra, equações e geometria avançada',
      color: 'from-orange-500 to-red-500',
      difficulty: 3,
      unlocked: true,
      completed: false,
      bestScore: userStats?.dificil?.bestScore
    },
    {
      id: 'expert',
      name: 'Expert',
      description: 'Conceitos avançados e problemas complexos',
      color: 'from-purple-500 to-pink-500',
      difficulty: 4,
      unlocked: true,
      completed: false,
      bestScore: userStats?.expert?.bestScore
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Escolha sua Fase</h2>
        <p className="text-slate-400">Selecione o nível de dificuldade para começar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {phases.map((phase, index) => (
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              hover={phase.unlocked}
              onClick={phase.unlocked ? () => onSelectPhase(phase.id) : undefined}
              className="relative overflow-hidden h-64"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${phase.color} opacity-10`} />
              
              <div className="relative z-10 p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${phase.color}`} />
                    <span className="text-sm text-slate-400">Nível {phase.difficulty}</span>
                  </div>
                  {!phase.unlocked && <Lock className="w-5 h-5 text-slate-500" />}
                  {phase.completed && <Star className="w-5 h-5 text-yellow-400" />}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{phase.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    {phase.description}
                  </p>
                  
                  {phase.bestScore && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-1">Melhor Pontuação</p>
                      <p className="text-lg font-bold text-yellow-400">{phase.bestScore}</p>
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="mt-auto">
                  <Button
                    variant={phase.unlocked ? "primary" : "ghost"}
                    size="sm"
                    disabled={!phase.unlocked}
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (phase.unlocked) onSelectPhase(phase.id);
                    }}
                  >
                    {phase.unlocked ? (
                      <>
                        <Play className="w-4 h-4" />
                        Jogar
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Bloqueado
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}