import React, { useState } from 'react';
import { ResultadoCalculoNotaC3, ItemBoaPraticaC3 } from '../types';
import { Award, CheckCircle2, XCircle, AlertCircle, Info, FileSpreadsheet, Check } from 'lucide-react';

interface DashboardC3TabProps {
  pacientesScores: ResultadoCalculoNotaC3[];
  mediaPontuacao: number;
  totalPacientes: number;
  loading: boolean;
  onSelectPaciente: (pacienteId: string) => void;
}

export const DashboardC3Tab: React.FC<DashboardC3TabProps> = ({
  pacientesScores,
  mediaPontuacao,
  totalPacientes,
  loading,
  onSelectPaciente,
}) => {
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>(
    pacientesScores[0]?.pacienteId || ''
  );

  const activePacienteScore =
    pacientesScores.find((p) => p.pacienteId === selectedPacienteId) || pacientesScores[0];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Calculando pontuações da Nota Metodológica C3...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Cards Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-indigo-200 tracking-wider">
              Média da Equipe (Nota C3)
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold">{mediaPontuacao}</span>
              <span className="text-indigo-200 font-medium text-sm">/ 100 pontos</span>
            </div>
            <p className="text-xs text-indigo-200 mt-2">
              Índice de Cofinanciamento APS (Portaria GM/MS nº 3.493/2024)
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
            <Award className="w-8 h-8 text-indigo-200" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                Total de Pacientes no Ciclo
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalPacientes}</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-sky-100 text-sky-800 rounded-md">
              Acompanhadas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Gestantes e Puérperas sob cuidado territorial ativo da equipe ESF.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                Metodologia Oficial
              </p>
              <h3 className="text-base font-bold text-slate-900 mt-1">Nota Metodológica C3</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md">
              11 Boas Práticas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Cálculo determinístico automático baseado em DUM, consultas, PA, peso, altura, dTpa e visitas.
          </p>
        </div>
      </div>

      {/* Seção Principal de Detalhamento por Gestante */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Barra superior de seleção da paciente */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Avaliação Individual de Boas Práticas da Gestante
            </h3>
            <p className="text-xs text-slate-500">
              Selecione uma paciente para auditar o cumprimento das 11 regras oficiais
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-600 uppercase">Paciente:</label>
            <select
              value={activePacienteScore?.pacienteId || ''}
              onChange={(e) => setSelectedPacienteId(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {pacientesScores.map((p) => (
                <option key={p.pacienteId} value={p.pacienteId}>
                  {p.pacienteNome} ({p.pontuacaoTotal} pts - {p.statusAcompanhamento})
                </option>
              ))}
            </select>
          </div>
        </div>

        {activePacienteScore && (
          <div className="p-6 space-y-6">
            {/* Header da Paciente Selecionada */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  {activePacienteScore.pacienteNome}
                </h4>
                <p className="text-xs text-slate-500">
                  CPF: {activePacienteScore.cpf} • Status:{' '}
                  <span className="font-semibold text-slate-700">
                    {activePacienteScore.statusAcompanhamento}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs uppercase font-bold text-slate-400">Score C3 Obtido</p>
                  <p className="text-2xl font-extrabold text-indigo-700">
                    {activePacienteScore.pontuacaoTotal}{' '}
                    <span className="text-sm font-normal text-slate-500">/ 100 pts</span>
                  </p>
                </div>

                <button
                  onClick={() => onSelectPaciente(activePacienteScore.pacienteId)}
                  className="px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                >
                  Abrir Prontuário
                </button>
              </div>
            </div>

            {/* Barra de Progresso do Score */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Conformidade com a Nota Metodológica C3</span>
                <span>{activePacienteScore.percentualConformidade}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    activePacienteScore.percentualConformidade >= 80
                      ? 'bg-emerald-500'
                      : activePacienteScore.percentualConformidade >= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${activePacienteScore.percentualConformidade}%` }}
                />
              </div>
            </div>

            {/* Tabela das 11 Boas Práticas (Quadro 1 da Nota Metodológica C3) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 bg-slate-50/50">
                    <th className="py-2.5 px-3 w-12 text-center">Item</th>
                    <th className="py-2.5 px-3">Boa Prática Oficial (Ministério da Saúde)</th>
                    <th className="py-2.5 px-3 w-28 text-center">Pontuação</th>
                    <th className="py-2.5 px-3 w-32 text-center">Situação</th>
                    <th className="py-2.5 px-3">Diagnóstico Operacional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {activePacienteScore.itens.map((item) => (
                    <tr
                      key={item.codigo}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        item.cumprida ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-extrabold text-center text-slate-700">
                        {item.codigo}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {item.descricao}
                      </td>
                      <td className="py-3 px-3 text-center font-bold">
                        <span
                          className={
                            item.cumprida ? 'text-emerald-700' : 'text-slate-400'
                          }
                        >
                          {item.pontosObtidos}
                        </span>{' '}
                        <span className="text-slate-400 font-normal">/ {item.pontosPossiveis}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.cumprida ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Cumprida
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <XCircle className="w-3 h-3 text-slate-400" />
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 leading-snug">
                        {item.detalhe}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
