import React, { useState, useEffect } from 'react';
import { Profissional } from '../types';
import { api } from '../services/api';
import { X, UserPlus, Sparkles, AlertCircle } from 'lucide-react';

interface NovaPacienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  profissionais: Profissional[];
}

export const NovaPacienteModal: React.FC<NovaPacienteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  profissionais,
}) => {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('1998-05-15');
  const [dum, setDum] = useState('');
  const [profissionalId, setProfissionalId] = useState('');
  const [dppCalculada, setDppCalculada] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const acsList = profissionais.filter((p) => p.funcao === 'ACS');

  useEffect(() => {
    if (acsList.length > 0 && !profissionalId) {
      setProfissionalId(acsList[0].id);
    }
  }, [acsList, profissionalId]);

  // Cálculo reativo e dinâmico da DPP pela regra obstétrica de 280 dias
  useEffect(() => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dum)) {
      const [y, m, d] = dum.split('-').map(Number);
      const dDum = new Date(y, m - 1, d);
      if (!isNaN(dDum.getTime())) {
        dDum.setDate(dDum.getDate() + 280);
        const yP = dDum.getFullYear();
        const mP = String(dDum.getMonth() + 1).padStart(2, '0');
        const dP = String(dDum.getDate()).padStart(2, '0');
        setDppCalculada(`${yP}-${mP}-${dP}`);
      }
    } else {
      setDppCalculada('');
    }
  }, [dum]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      await api.createPaciente({
        nome,
        cpf,
        dataNascimento,
        dum,
        profissionalId,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErro(err.message || 'Erro ao cadastrar gestante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Cadastrar Nova Gestante</h3>
              <p className="text-xs text-slate-500">Iniciação de acompanhamento longitudinal no SUS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {erro && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{erro}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nome Completo da Paciente *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Maria das Graças Oliveira"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                CPF (com validação) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 123.456.789-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Data de Nascimento *
              </label>
              <input
                type="date"
                required
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                DUM (Última Menstruação) *
              </label>
              <input
                type="date"
                required
                value={dum}
                onChange={(e) => setDum(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                DPP Prevista (Automática)
              </label>
              <input
                type="text"
                readOnly
                value={dppCalculada || 'Aguardando DUM...'}
                className="w-full text-xs p-2.5 bg-slate-100 border border-slate-200 rounded-lg font-bold text-indigo-900 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Agente Comunitário de Saúde (ACS) Responsável *
            </label>
            <select
              value={profissionalId}
              onChange={(e) => setProfissionalId(e.target.value)}
              required
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            >
              {acsList.map((acs) => (
                <option key={acs.id} value={acs.id}>
                  {acs.nome} (CPF: {acs.cpf})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
            >
              {loading ? 'Salvando...' : 'Cadastrar Gestante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
