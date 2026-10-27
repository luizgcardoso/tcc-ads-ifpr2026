import React, { useEffect, useState } from 'react';
import { Paciente, ResultadoCalculoNotaC3 } from '../types';
import { api } from '../services/api';
import {
  X,
  Calendar,
  Heart,
  Baby,
  Syringe,
  Smile,
  Activity,
  Award,
  AlertCircle,
  Clock,
  Plus,
} from 'lucide-react';

interface ProntuarioDrawerProps {
  pacienteId: string | null;
  onClose: () => void;
  onOpenNovoRegistro: (pacienteId: string, tipo?: 'visita' | 'consulta' | 'vacina' | 'odonto') => void;
}

export const ProntuarioDrawer: React.FC<ProntuarioDrawerProps> = ({
  pacienteId,
  onClose,
  onOpenNovoRegistro,
}) => {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [notaC3, setNotaC3] = useState<ResultadoCalculoNotaC3 | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pacienteId) return;

    setLoading(true);
    Promise.all([api.getPacienteById(pacienteId), api.getIndicadoresPaciente(pacienteId)])
      .then(([pac, c3]) => {
        setPaciente(pac);
        setNotaC3(c3);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [pacienteId]);

  if (!pacienteId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
              {paciente?.nome.charAt(0) || 'P'}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">{paciente?.nome || 'Carregando...'}</h3>
              <p className="text-xs text-slate-500">
                CPF: {paciente?.cpf} • Status: <strong className="text-slate-700">{paciente?.status}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading || !paciente ? (
            <div className="p-12 text-center text-slate-500 text-xs">Carregando prontuário...</div>
          ) : (
            <>
              {/* Card Resumo Obstétrico & Nota C3 */}
              <div className="grid grid-cols-2 gap-4 bg-sky-50/70 p-4 rounded-xl border border-sky-200">
                <div>
                  <p className="text-[11px] uppercase font-bold text-sky-800">DUM</p>
                  <p className="text-sm font-semibold text-slate-800">{paciente.dum}</p>

                  <p className="text-[11px] uppercase font-bold text-sky-800 mt-2">DPP Prevista</p>
                  <p className="text-sm font-semibold text-slate-800">{paciente.dpp}</p>
                </div>

                <div className="border-l border-sky-200 pl-4 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] uppercase font-bold text-sky-800">Score Nota C3</p>
                    <p className="text-2xl font-black text-sky-900">
                      {notaC3?.pontuacaoTotal || 0}{' '}
                      <span className="text-xs font-normal text-sky-700">/ 100 pts</span>
                    </p>
                  </div>
                  <p className="text-[11px] text-sky-700">
                    ACS: {paciente.profissional?.nome || 'Não atribuído'}
                  </p>
                </div>
              </div>

              {/* Registro do Bebê (se Puérpera) */}
              {paciente.bebes && paciente.bebes.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5 mb-2">
                    <Baby className="w-4 h-4 text-purple-600" />
                    Dados do Recém-Nascido
                  </h4>
                  {paciente.bebes.map((bebe) => (
                    <div key={bebe.id} className="text-xs text-purple-950 space-y-1">
                      <p>
                        Nome: <strong>{bebe.nome}</strong> • Sexo: <strong>{bebe.sexo === 'M' ? 'Masculino' : 'Feminino'}</strong>
                      </p>
                      <p>
                        Data de Nascimento: <strong>{bebe.dataNascimento}</strong> • Peso ao Nascer:{' '}
                        <strong>{bebe.pesoNascimentoGramas}g</strong>
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Ações Rápidas de Movimentação */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onOpenNovoRegistro(paciente.id, 'visita')}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + Visita Domiciliar
                </button>
                <button
                  onClick={() => onOpenNovoRegistro(paciente.id, 'consulta')}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 rounded-lg hover:bg-sky-100 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + Consulta Médica
                </button>
                <button
                  onClick={() => onOpenNovoRegistro(paciente.id, 'vacina')}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + Vacina
                </button>
                <button
                  onClick={() => onOpenNovoRegistro(paciente.id, 'odonto')}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + Avaliação Odonto
                </button>
              </div>

              {/* Histórico Longitudinal (Movimentações) */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Histórico Clínico e Movimentações ({
                    (paciente.consultas?.length || 0) +
                    (paciente.visitas?.length || 0) +
                    (paciente.vacinacoes?.length || 0) +
                    (paciente.avaliacoesOdonto?.length || 0)
                  })
                </h4>

                {/* Consultas */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-sky-600" />
                    Consultas Pré-natais / Puerperais ({paciente.consultas?.length || 0})
                  </h5>
                  {paciente.consultas && paciente.consultas.length > 0 ? (
                    paciente.consultas.map((c) => (
                      <div
                        key={c.id}
                        className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex justify-between items-start"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">
                            Data: {c.dataConsulta} • {c.fase} ({c.idadeGestacionalSemanas}ª sem.)
                          </p>
                          <p className="text-slate-600 mt-1">
                            PA: <span className="font-bold">{c.pressaoArterial}</span> • Peso:{' '}
                            <span className="font-bold">{c.pesoKg}kg</span> • Altura:{' '}
                            <span className="font-bold">{c.alturaCm}cm</span>
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {c.profissional?.nome || 'Profissional'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Nenhuma consulta registrada.</p>
                  )}
                </div>

                {/* Visitas Domiciliares */}
                <div className="space-y-2 pt-2">
                  <h5 className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    Visitas Domiciliares do ACS ({paciente.visitas?.length || 0})
                  </h5>
                  {paciente.visitas && paciente.visitas.length > 0 ? (
                    paciente.visitas.map((v) => (
                      <div
                        key={v.id}
                        className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex justify-between items-start"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">
                            Data: {v.dataVisita} • Fase: {v.fase}
                          </p>
                          {v.observacoes && (
                            <p className="text-slate-600 mt-1 text-[11px]">{v.observacoes}</p>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {v.profissional?.nome || 'ACS'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Nenhuma visita registrada.</p>
                  )}
                </div>

                {/* Vacinações */}
                <div className="space-y-2 pt-2">
                  <h5 className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Syringe className="w-3.5 h-3.5 text-indigo-600" />
                    Vacinações ({paciente.vacinacoes?.length || 0})
                  </h5>
                  {paciente.vacinacoes && paciente.vacinacoes.length > 0 ? (
                    paciente.vacinacoes.map((vac) => (
                      <div
                        key={vac.id}
                        className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex justify-between items-center"
                      >
                        <div>
                          <span className="font-bold text-indigo-900">{vac.vacinaNomeTipo}</span>
                          <span className="text-slate-500 ml-2">
                            (Dose {vac.dose} aplicada em {vac.dataAplicacao})
                          </span>
                        </div>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                          {vac.idadeGestacionalSemanas}ª semana
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Nenhuma vacina registrada.</p>
                  )}
                </div>

                {/* Avaliações Odontológicas */}
                <div className="space-y-2 pt-2">
                  <h5 className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-amber-600" />
                    Avaliações Odontológicas ({paciente.avaliacoesOdonto?.length || 0})
                  </h5>
                  {paciente.avaliacoesOdonto && paciente.avaliacoesOdonto.length > 0 ? (
                    paciente.avaliacoesOdonto.map((od) => (
                      <div
                        key={od.id}
                        className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs"
                      >
                        <p className="font-semibold text-slate-800">
                          Data: {od.dataAvaliacao} • Dentista: {od.profissional?.nome || 'Cirurgião-Dentista'}
                        </p>
                        {od.observacoes && (
                          <p className="text-slate-600 mt-1 text-[11px]">{od.observacoes}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Nenhum atendimento odontológico registrado.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
