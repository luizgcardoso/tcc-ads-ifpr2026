import React, { useState } from 'react';
import { RelatorioAlertas, AlertaItem } from '../types';
import { AlertTriangle, Clock, Syringe, Baby, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AlertasTabProps {
  relatorio: RelatorioAlertas | null;
  loading: boolean;
  onSelectPaciente: (pacienteId: string) => void;
  onRegistrarVisita: (pacienteId: string) => void;
}

export const AlertasTab: React.FC<AlertasTabProps> = ({
  relatorio,
  loading,
  onSelectPaciente,
  onRegistrarVisita,
}) => {
  const [filtro, setFiltro] = useState<'TODOS' | 'CRITICA' | 'ALTA'>('TODOS');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Buscando pendências e alertas de saúde no território...</p>
      </div>
    );
  }

  if (!relatorio || relatorio.totalAlertas === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-12 text-center max-w-2xl mx-auto my-8">
        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-emerald-950">Território 100% em Dia!</h3>
        <p className="text-sm text-emerald-700 mt-2">
          Nenhuma pendência de visita domiciliar, vacinação ou atenção puerperal identificada no momento.
          Parabéns à equipe pelo cumprimento das diretrizes da Atenção Primária.
        </p>
      </div>
    );
  }

  const alertasFiltrados = relatorio.alertas.filter((a) => {
    if (filtro === 'TODOS') return true;
    return a.gravidade === filtro;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner de Resumo de Riscos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xl">
            {relatorio.totalAlertas}
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">Total de Pendências</p>
            <p className="text-sm text-slate-700">Ações recomendadas pela APS</p>
          </div>
        </div>

        <div className="bg-rose-50 p-5 rounded-xl border border-rose-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xl">
            {relatorio.criticos}
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-rose-800 tracking-wider">Prioridade Crítica</p>
            <p className="text-sm text-rose-700">Atrasos graves ou puerpério</p>
          </div>
        </div>

        <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl">
            {relatorio.altas}
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-amber-900 tracking-wider">Alta Prioridade</p>
            <p className="text-sm text-amber-800">Vacinas e visitas com mais de 30 dias</p>
          </div>
        </div>

        <div className="bg-sky-50 p-5 rounded-xl border border-sky-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-sky-800 tracking-wider">Foco da Busca Ativa</p>
            <p className="text-xs text-sky-700 mt-1">Metodologia Nota Metodológica C3 (Portaria 3.493/2024)</p>
          </div>
          <ShieldAlert className="w-8 h-8 text-sky-600 opacity-60" />
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            Agenda Operacional de Busca Ativa do ACS
          </h2>
          <p className="text-xs text-slate-500">
            Identificação em tempo real de gestantes e puérperas com ações preventivas pendentes
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setFiltro('TODOS')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filtro === 'TODOS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({relatorio.totalAlertas})
          </button>
          <button
            onClick={() => setFiltro('CRITICA')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filtro === 'CRITICA' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            Críticos ({relatorio.criticos})
          </button>
          <button
            onClick={() => setFiltro('ALTA')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filtro === 'ALTA' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:text-amber-600'
            }`}
          >
            Altas ({relatorio.altas})
          </button>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alertasFiltrados.map((alerta) => {
          const isCritico = alerta.gravidade === 'CRITICA';
          const icon =
            alerta.tipo === 'VISITA_PUERPERAL_PENDENTE' ? (
              <Baby className="w-5 h-5 text-rose-600" />
            ) : alerta.tipo === 'VACINA_DTPA_PENDENTE' ? (
              <Syringe className="w-5 h-5 text-indigo-600" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600" />
            );

          return (
            <div
              key={alerta.id}
              className={`p-5 rounded-xl border bg-white shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                isCritico ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isCritico ? 'bg-rose-100' : 'bg-slate-100'
                      }`}
                    >
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{alerta.titulo}</h4>
                      <p className="text-xs text-slate-500">
                        Paciente: <strong className="text-slate-800">{alerta.pacienteNome}</strong> • CPF: {alerta.cpf}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      isCritico
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {alerta.gravidade}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {alerta.mensagem}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectPaciente(alerta.pacienteId)}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                >
                  Ver Prontuário Completo
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onRegistrarVisita(alerta.pacienteId)}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-xs transition-colors"
                >
                  Registrar Visita Agora
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
