import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Palette, 
  Volume2, 
  Shield, 
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    darkMode: true,
    showHints: true,
    autoSave: true,
    emailNotifications: false
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Aqui você pode implementar a lógica para salvar as configurações
    console.log('Salvando configurações:', settings);
    // Por enquanto, apenas mostra um feedback visual
    alert('Configurações salvas com sucesso!');
  };

  const SettingToggle = ({ 
    title, 
    description, 
    icon: Icon, 
    settingKey, 
    value 
  }: {
    title: string;
    description: string;
    icon: any;
    settingKey: string;
    value: boolean;
  }) => (
    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-slate-600/50 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h3 className="text-white font-medium">{title}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      <button
        onClick={() => handleSettingChange(settingKey, !value)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
          value ? 'bg-indigo-500' : 'bg-slate-600'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
            value ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4"
        >
          <Button
            variant="ghost"
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Configurações</h1>
            <p className="text-slate-400">Gerencie suas preferências e conta</p>
          </div>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Informações do Perfil</h2>
                <p className="text-slate-400">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome
                </label>
                <Input
                  type="text"
                  defaultValue={user?.user_metadata?.name || 'Usuário'}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-slate-700/50"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="mt-6">
              <Button className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Privacy & Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Privacidade e Segurança</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <h3 className="text-white font-medium">Conta Segura</h3>
                </div>
                <p className="text-sm text-slate-400">
                  Sua conta está protegida com autenticação segura. Seus dados são criptografados e nunca compartilhados.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Sobre o MathFly</h2>
            <div className="text-slate-400 space-y-2">
              <p>Versão: 1.0.0</p>
              <p>Desenvolvido com React, TypeScript e Supabase</p>
              <p>© 2024 MathFly - Plataforma Educacional Gamificada</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
