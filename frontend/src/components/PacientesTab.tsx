import React, { useState } from 'react';
import { Paciente } from '../types';
import { Search, Calendar, UserCheck, Eye, Trash2, Baby, AlertCircle } from 'lucide-react';

interface PacientesTabProps {
  pacientes: Paciente[];
  loading: boolean;
  onSelectPaciente: (pacienteId: string) => void;
  onOpenNovoRegistro: (pacienteId?: string) => void;
  onRegistrarParto: (paciente: Paciente) => void;
  onDeletePaciente: (id: string) => void;
}

export const PacientesTab: React.FC<PacientesTabProps> = ({
  pacientes,
  loading,
  onSelectPaciente,
  onOpenNovoRegistro,
  onRegistrarParto,
  onDeletePaciente,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  const pacientesFiltrados = pacientes.filter((p) => {
    const matchBusca =
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.cpf.includes(busca);

    if (filtroStatus === 'TODOS') return matchBusca;
    return matchBusca && p.status === filtroStatus;
  });

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome da gestante ou CPF..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltroStatus('TODOS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filtroStatus === 'TODOS'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({pacientes.length})
          </button>
          <button
            onClick={() => setFiltroStatus('GESTANTE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filtroStatus === 'GESTANTE'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            Gestantes ({pacientes.filter((p) => p.status === 'GESTANTE').length})
          </button>
          <button
            onClick={() => setFiltroStatus('PUERPERA')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filtroStatus === 'PUERPERA'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            Puérperas ({pacientes.filter((p) => p.status === 'PUERPERA').length})
          </button>
        </div>
      </div>

      {/* Tabela de Pacientes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Carregando cadastro de pacientes...
          </div>
        ) : pacientesFiltrados.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Nenhuma paciente encontrada com os critérios informados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase font-bold text-slate-500">
                  <th className="py-3 px-4">Paciente</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">DUM</th>
                  <th className="py-3 px-4">DPP Calculada</th>
                  <th className="py-3 px-4">Idade Gestacional</th>
                  <th className="py-3 px-4">ACS Responsável</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pacientesFiltrados.map((paciente) => {
                  const isPuerpera = paciente.status === 'PUERPERA';

                  return (
                    <tr key={paciente.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{paciente.nome}</div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          CPF: {paciente.cpf}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPuerpera
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-sky-100 text-sky-800 border border-sky-200'
                          }`}
                        >
                          {paciente.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">{paciente.dum}</td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {paciente.dpp}
                      </td>

                      <td className="py-3.5 px-4">
                        {isPuerpera ? (
                          <span className="text-purple-700 font-medium">
                            Parto em {paciente.dataParto || 'N/D'}
                          </span>
                        ) : paciente.idadeGestacionalAtual ? (
                          <span className="font-semibold text-slate-800">
                            {paciente.idadeGestacionalAtual.formatada}
                          </span>
                        ) : (
                          'N/D'
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {paciente.profissional?.nome || 'ACS não atribuído'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectPaciente(paciente.id)}
                            title="Abrir Prontuário"
                            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!isPuerpera && (
                            <button
                              onClick={() => onRegistrarParto(paciente)}
                              title="Registrar Parto / Puérpera"
                              className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <Baby className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => onDeletePaciente(paciente.id)}
                            title="Excluir (se sem vínculos)"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
