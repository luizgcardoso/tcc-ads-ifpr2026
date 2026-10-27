import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { AlertasTab } from './components/AlertasTab';
import { DashboardC3Tab } from './components/DashboardC3Tab';
import { PacientesTab } from './components/PacientesTab';
import { ProntuarioDrawer } from './components/ProntuarioDrawer';
import { NovaPacienteModal } from './components/NovaPacienteModal';
import { NovoRegistroModal } from './components/NovoRegistroModal';
import { api } from './services/api';
import {
  Paciente,
  Profissional,
  RelatorioAlertas,
  ResultadoCalculoNotaC3,
} from './types';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'alertas' | 'c3' | 'pacientes'>('alertas');
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [relatorioAlertas, setRelatorioAlertas] = useState<RelatorioAlertas | null>(null);
  const [resumoC3, setResumoC3] = useState<{
    totalPacientes: number;
    mediaPontuacao: number;
    pacientesScores: ResultadoCalculoNotaC3[];
  }>({ totalPacientes: 0, mediaPontuacao: 0, pacientesScores: [] });

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; mensagem: string } | null>(
    null
  );

  // Modais e gaveta
  const [selectedDrawerPacienteId, setSelectedDrawerPacienteId] = useState<string | null>(null);
  const [isNovaPacienteOpen, setIsNovaPacienteOpen] = useState(false);
  const [isNovoRegistroOpen, setIsNovoRegistroOpen] = useState(false);
  const [novoRegistroPacienteId, setNovoRegistroPacienteId] = useState<string | undefined>();
  const [novoRegistroTab, setNovoRegistroTab] = useState<
    'visita' | 'consulta' | 'vacina' | 'odonto' | 'parto'
  >('visita');

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [pacs, profs, alerts, c3] = await Promise.all([
        api.getPacientes(),
        api.getProfissionais(),
        api.getAlertas(),
        api.getIndicadoresGeral(),
      ]);
      setPacientes(pacs);
      setProfissionais(profs);
      setRelatorioAlertas(alerts);
      setResumoC3(c3);
    } catch (err: any) {
      console.error(err);
      setFeedback({
        tipo: 'erro',
        mensagem: 'Erro ao conectar à API do Sistema Cegonha. Verifique o servidor.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const showNotification = (tipo: 'sucesso' | 'erro', mensagem: string) => {
    setFeedback({ tipo, mensagem });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleOpenNovoRegistro = (
    pacienteId?: string,
    tipo: 'visita' | 'consulta' | 'vacina' | 'odonto' | 'parto' = 'visita'
  ) => {
    setNovoRegistroPacienteId(pacienteId);
    setNovoRegistroTab(tipo);
    setIsNovoRegistroOpen(true);
  };

  const handleRegistrarParto = (paciente: Paciente) => {
    setNovoRegistroPacienteId(paciente.id);
    setNovoRegistroTab('parto');
    setIsNovoRegistroOpen(true);
  };

  const handleDeletePaciente = async (id: string) => {
    if (!window.confirm('Deseja realmente tentar excluir este cadastro?')) return;

    try {
      await api.deletePaciente(id);
      showNotification('sucesso', 'Paciente removida com sucesso!');
      carregarDados();
    } catch (err: any) {
      showNotification(
        'erro',
        err.message || 'Exclusão bloqueada por regra de integridade clínica do SUS.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalAlertas={relatorioAlertas?.totalAlertas || 0}
        onOpenNovaPaciente={() => setIsNovaPacienteOpen(true)}
        onOpenNovoRegistro={() => handleOpenNovoRegistro()}
      />

      {/* Notificação Toast */}
      {feedback && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`p-4 rounded-xl shadow-md border flex items-center justify-between text-xs font-semibold ${
              feedback.tipo === 'sucesso'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.tipo === 'sucesso' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{feedback.mensagem}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {activeTab === 'alertas' && (
          <AlertasTab
            relatorio={relatorioAlertas}
            loading={loading}
            onSelectPaciente={(id) => setSelectedDrawerPacienteId(id)}
            onRegistrarVisita={(id) => handleOpenNovoRegistro(id, 'visita')}
          />
        )}

        {activeTab === 'c3' && (
          <DashboardC3Tab
            pacientesScores={resumoC3.pacientesScores}
            mediaPontuacao={resumoC3.mediaPontuacao}
            totalPacientes={resumoC3.totalPacientes}
            loading={loading}
            onSelectPaciente={(id) => setSelectedDrawerPacienteId(id)}
          />
        )}

        {activeTab === 'pacientes' && (
          <PacientesTab
            pacientes={pacientes}
            loading={loading}
            onSelectPaciente={(id) => setSelectedDrawerPacienteId(id)}
            onOpenNovoRegistro={(id) => handleOpenNovoRegistro(id)}
            onRegistrarParto={handleRegistrarParto}
            onDeletePaciente={handleDeletePaciente}
          />
        )}
      </main>

      {/* Footer Metodológico */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>
          <strong>Sistema Cegonha</strong> • Construído sob a metodologia <strong>AI-DLC (AWS Labs)</strong> •
          Apoio à Atenção Primária à Saúde e Estratégia Saúde da Família (SUS)
        </p>
      </footer>

      {/* Gaveta do Prontuário */}
      <ProntuarioDrawer
        pacienteId={selectedDrawerPacienteId}
        onClose={() => {
          setSelectedDrawerPacienteId(null);
          carregarDados();
        }}
        onOpenNovoRegistro={(id, tipo) => handleOpenNovoRegistro(id, tipo)}
      />

      {/* Modais */}
      <NovaPacienteModal
        isOpen={isNovaPacienteOpen}
        onClose={() => setIsNovaPacienteOpen(false)}
        onSuccess={() => {
          showNotification('sucesso', 'Gestante cadastrada e DPP calculada com sucesso!');
          carregarDados();
        }}
        profissionais={profissionais}
      />

      <NovoRegistroModal
        isOpen={isNovoRegistroOpen}
        onClose={() => setIsNovoRegistroOpen(false)}
        onSuccess={() => {
          showNotification('sucesso', 'Movimentação clínica registrada com sucesso!');
          carregarDados();
        }}
        pacientes={pacientes}
        profissionais={profissionais}
        initialPacienteId={novoRegistroPacienteId}
        initialTab={novoRegistroTab}
      />
    </div>
  );
};
