import React, { useState, useEffect } from 'react';
import { Paciente, Profissional, FaseAcompanhamento, FuncaoProfissional } from '../types';
import { api } from '../services/api';
import { X, Activity, Clock, Syringe, Smile, Baby, AlertCircle } from 'lucide-react';

interface NovoRegistroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pacientes: Paciente[];
  profissionais: Profissional[];
  initialPacienteId?: string;
  initialTab?: 'visita' | 'consulta' | 'vacina' | 'odonto' | 'parto';
}

export const NovoRegistroModal: React.FC<NovoRegistroModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  pacientes,
  profissionais,
  initialPacienteId,
  initialTab = 'visita',
}) => {
  const [tab, setTab] = useState<'visita' | 'consulta' | 'vacina' | 'odonto' | 'parto'>(initialTab);
  const [pacienteId, setPacienteId] = useState(initialPacienteId || '');
  const [profissionalId, setProfissionalId] = useState('');
  const [dataEvento, setDataEvento] = useState(new Date().toISOString().split('T')[0]);
  const [fase, setFase] = useState<FaseAcompanhamento>('GESTANTE');
  const [observacoes, setObservacoes] = useState('');

  // Consulta campos específicos
  const [pressaoArterial, setPressaoArterial] = useState('120/80');
  const [pesoKg, setPesoKg] = useState('65.5');
  const [alturaCm, setAlturaCm] = useState('165');

  // Vacinação campos
  const [vacinaNomeTipo, setVacinaNomeTipo] = useState('dTpa');
  const [dose, setDose] = useState('1');

  // Parto / Bebê campos
  const [nomeBebe, setNomeBebe] = useState('');
  const [sexoBebe, setSexoBebe] = useState<'M' | 'F'>('M');
  const [pesoBebe, setPesoBebe] = useState('3200');

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (initialPacienteId) setPacienteId(initialPacienteId);
  }, [initialPacienteId]);

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  // Atualizar lista de profissionais de acordo com a aba
  useEffect(() => {
    let filtrados: Profissional[] = [];
    if (tab === 'visita') {
      filtrados = profissionais.filter((p) => p.funcao === 'ACS');
    } else if (tab === 'consulta') {
      filtrados = profissionais.filter((p) => p.funcao === 'MEDICO' || p.funcao === 'ENFERMEIRO');
    } else if (tab === 'odonto') {
      filtrados = profissionais.filter((p) => p.funcao === 'DENTISTA');
    } else {
      filtrados = profissionais;
    }

    if (filtrados.length > 0) {
      setProfissionalId(filtrados[0].id);
    }
  }, [tab, profissionais]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      if (!pacienteId) throw new Error('Selecione uma paciente.');

      if (tab === 'visita') {
        await api.createVisita({
          pacienteId,
          profissionalId,
          dataVisita: dataEvento,
          fase,
          observacoes,
        });
      } else if (tab === 'consulta') {
        await api.createConsulta({
          pacienteId,
          profissionalId,
          dataConsulta: dataEvento,
          pressaoArterial,
          pesoKg: parseFloat(pesoKg),
          alturaCm: parseInt(alturaCm, 10),
          fase,
          observacoes,
        });
      } else if (tab === 'vacina') {
        await api.createVacinacao({
          pacienteId,
          vacinaNomeTipo,
          dataAplicacao: dataEvento,
          dose: parseInt(dose, 10),
        });
      } else if (tab === 'odonto') {
        await api.createOdonto({
          pacienteId,
          profissionalId,
          dataAvaliacao: dataEvento,
          observacoes,
        });
      } else if (tab === 'parto') {
        await api.registrarParto(pacienteId, {
          dataParto: dataEvento,
          bebe: nomeBebe
            ? {
                nome: nomeBebe,
                sexo: sexoBebe,
                pesoNascimentoGramas: parseInt(pesoBebe, 10),
              }
            : undefined,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErro(err.message || 'Erro ao registrar evento clínico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">Registro de Movimentação Clínica</h3>
            <p className="text-xs text-slate-500">Alimenta o histórico longitudinal e o motor da Nota C3</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Tipos de Movimentações */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 p-1">
          <button
            type="button"
            onClick={() => setTab('visita')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              tab === 'visita' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            Visita
          </button>
          <button
            type="button"
            onClick={() => setTab('consulta')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              tab === 'consulta' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            Consulta
          </button>
          <button
            type="button"
            onClick={() => setTab('vacina')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              tab === 'vacina' ? 'bg-white text-indigo-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Syringe className="w-3.5 h-3.5 text-indigo-600" />
            Vacina
          </button>
          <button
            type="button"
            onClick={() => setTab('odonto')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              tab === 'odonto' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smile className="w-3.5 h-3.5 text-amber-600" />
            Odonto
          </button>
          <button
            type="button"
            onClick={() => setTab('parto')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              tab === 'parto' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Baby className="w-3.5 h-3.5 text-purple-600" />
            Parto
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {erro && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{erro}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Paciente *</label>
            <select
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              required
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            >
              <option value="">Selecione a paciente...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.status} - CPF: {p.cpf})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Data do Evento *</label>
              <input
                type="date"
                required
                value={dataEvento}
                onChange={(e) => setDataEvento(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            {tab !== 'vacina' && tab !== 'parto' && (
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Profissional Atendente *
                </label>
                <select
                  value={profissionalId}
                  onChange={(e) => setProfissionalId(e.target.value)}
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                >
                  {profissionais.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.nome} ({prof.funcao})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {(tab === 'visita' || tab === 'consulta') && (
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Fase do Acompanhamento *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="fase"
                    value="GESTANTE"
                    checked={fase === 'GESTANTE'}
                    onChange={() => setFase('GESTANTE')}
                  />
                  <span>Gestação</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="fase"
                    value="PUERPERA"
                    checked={fase === 'PUERPERA'}
                    onChange={() => setFase('PUERPERA')}
                  />
                  <span>Puerpério</span>
                </label>
              </div>
            </div>
          )}

          {/* Campos específicos de Consulta */}
          {tab === 'consulta' && (
            <div className="space-y-3 bg-sky-50/60 p-3 rounded-xl border border-sky-200">
              <p className="font-bold text-sky-900 text-[11px] uppercase">
                Aferições Clínicas (Requisito Nota C3)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">PA (mmHg) *</label>
                  <input
                    type="text"
                    required
                    placeholder="120/80"
                    value={pressaoArterial}
                    onChange={(e) => setPressaoArterial(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Peso (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={pesoKg}
                    onChange={(e) => setPesoKg(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Altura (cm) *</label>
                  <input
                    type="number"
                    required
                    value={alturaCm}
                    onChange={(e) => setAlturaCm(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Campos específicos de Vacina */}
          {tab === 'vacina' && (
            <div className="grid grid-cols-2 gap-3 bg-indigo-50/60 p-3 rounded-xl border border-indigo-200">
              <div>
                <label className="block font-bold text-indigo-900 mb-1">Imunizante *</label>
                <select
                  value={vacinaNomeTipo}
                  onChange={(e) => setVacinaNomeTipo(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md bg-white"
                >
                  <option value="dTpa">dTpa (Tríplice bacteriana acelular)</option>
                  <option value="VSR">VSR (Vírus Sincicial Respiratório)</option>
                  <option value="Hepatite B">Hepatite B</option>
                  <option value="Influenza">Influenza (Gripe)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-indigo-900 mb-1">Dose *</label>
                <input
                  type="number"
                  min="1"
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md bg-white"
                />
              </div>
            </div>
          )}

          {/* Campos de Parto */}
          {tab === 'parto' && (
            <div className="space-y-3 bg-purple-50/60 p-3 rounded-xl border border-purple-200">
              <p className="font-bold text-purple-900 text-[11px] uppercase">
                Registro de Nascimento do Bebê (Opcional)
              </p>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Nome do Bebê</label>
                <input
                  type="text"
                  placeholder="Ex: Gabriel Silva"
                  value={nomeBebe}
                  onChange={(e) => setNomeBebe(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Sexo</label>
                  <select
                    value={sexoBebe}
                    onChange={(e) => setSexoBebe(e.target.value as 'M' | 'F')}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Peso ao Nascer (g)</label>
                  <input
                    type="number"
                    value={pesoBebe}
                    onChange={(e) => setPesoBebe(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Observações */}
          {tab !== 'vacina' && (
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Observações</label>
              <textarea
                rows={2}
                placeholder="Anotações de campo, orientações dadas à paciente..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
            >
              {loading ? 'Salvando...' : 'Salvar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
