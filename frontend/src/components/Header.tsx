import React from 'react';
import { Activity, Bell, Users, BarChart3, HeartPulse, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'alertas' | 'c3' | 'pacientes';
  setActiveTab: (tab: 'alertas' | 'c3' | 'pacientes') => void;
  totalAlertas: number;
  onOpenNovaPaciente: () => void;
  onOpenNovoRegistro: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalAlertas,
  onOpenNovaPaciente,
  onOpenNovoRegistro,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Identidade */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  Sistema Cegonha
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-sky-100 text-sky-800 rounded-full border border-sky-200">
                  AI-DLC MVP
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Atenção Primária à Saúde (APS) • Estratégia Saúde da Família (ESF)
              </p>
            </div>
          </div>

          {/* Abas Centrais */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('alertas')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors relative ${
                activeTab === 'alertas'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bell className="w-4 h-4 text-rose-500" />
              <span>Agenda de Alertas</span>
              {totalAlertas > 0 && (
                <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {totalAlertas}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('c3')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'c3'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Indicadores Nota C3</span>
            </button>

            <button
              onClick={() => setActiveTab('pacientes')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'pacientes'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-sky-600" />
              <span>Pacientes & Prontuário</span>
            </button>
          </nav>

          {/* Ações Globais */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenNovoRegistro}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-all"
            >
              <Activity className="w-3.5 h-3.5" />
              + Movimentação Clínica
            </button>
            <button
              onClick={onOpenNovaPaciente}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-all"
            >
              + Nova Gestante
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
