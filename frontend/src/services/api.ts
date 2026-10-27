import {
  Paciente,
  Profissional,
  ResultadoCalculoNotaC3,
  RelatorioAlertas,
  FaseAcompanhamento,
  FuncaoProfissional,
} from '../types';

const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getProfissionais(funcao?: FuncaoProfissional): Promise<Profissional[]> {
    const url = funcao ? `${API_BASE}/profissionais?funcao=${funcao}` : `${API_BASE}/profissionais`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar profissionais');
    return res.json();
  },

  async createProfissional(data: { nome: string; cpf: string; funcao: FuncaoProfissional }) {
    const res = await fetch(`${API_BASE}/profissionais`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao cadastrar profissional');
    return json;
  },

  async getPacientes(busca?: string, status?: string): Promise<Paciente[]> {
    const params = new URLSearchParams();
    if (busca) params.append('busca', busca);
    if (status) params.append('status', status);
    const res = await fetch(`${API_BASE}/pacientes?${params.toString()}`);
    if (!res.ok) throw new Error('Falha ao carregar pacientes');
    return res.json();
  },

  async getPacienteById(id: string): Promise<Paciente> {
    const res = await fetch(`${API_BASE}/pacientes/${id}`);
    if (!res.ok) throw new Error('Paciente não encontrada');
    return res.json();
  },

  async createPaciente(data: {
    nome: string;
    cpf: string;
    dataNascimento: string;
    dum: string;
    profissionalId: string;
  }): Promise<Paciente> {
    const res = await fetch(`${API_BASE}/pacientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao cadastrar paciente');
    return json;
  },

  async registrarParto(
    pacienteId: string,
    data: {
      dataParto: string;
      bebe?: { nome: string; sexo: 'M' | 'F'; pesoNascimentoGramas: number };
    }
  ) {
    const res = await fetch(`${API_BASE}/pacientes/${pacienteId}/parto`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao registrar parto');
    return json;
  },

  async deletePaciente(id: string) {
    const res = await fetch(`${API_BASE}/pacientes/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao excluir paciente');
    return json;
  },

  async createVisita(data: {
    pacienteId: string;
    profissionalId: string;
    dataVisita: string;
    fase: FaseAcompanhamento;
    observacoes?: string;
  }) {
    const res = await fetch(`${API_BASE}/movimentacoes/visitas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao registrar visita');
    return json;
  },

  async createConsulta(data: {
    pacienteId: string;
    profissionalId: string;
    dataConsulta: string;
    pressaoArterial: string;
    pesoKg: number;
    alturaCm: number;
    fase: FaseAcompanhamento;
    observacoes?: string;
  }) {
    const res = await fetch(`${API_BASE}/movimentacoes/consultas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao registrar consulta');
    return json;
  },

  async createVacinacao(data: {
    pacienteId: string;
    vacinaNomeTipo: string;
    dataAplicacao: string;
    dose: number;
  }) {
    const res = await fetch(`${API_BASE}/movimentacoes/vacinacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao registrar vacinação');
    return json;
  },

  async createOdonto(data: {
    pacienteId: string;
    profissionalId: string;
    dataAvaliacao: string;
    observacoes?: string;
  }) {
    const res = await fetch(`${API_BASE}/movimentacoes/odonto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao registrar odonto');
    return json;
  },

  async getAlertas(): Promise<RelatorioAlertas> {
    const res = await fetch(`${API_BASE}/inteligencia/alertas`);
    if (!res.ok) throw new Error('Falha ao carregar alertas');
    return res.json();
  },

  async getIndicadoresGeral(): Promise<{
    totalPacientes: number;
    mediaPontuacao: number;
    pacientesScores: ResultadoCalculoNotaC3[];
  }> {
    const res = await fetch(`${API_BASE}/inteligencia/indicadores`);
    if (!res.ok) throw new Error('Falha ao carregar resumo C3');
    return res.json();
  },

  async getIndicadoresPaciente(pacienteId: string): Promise<ResultadoCalculoNotaC3> {
    const res = await fetch(`${API_BASE}/inteligencia/indicadores/${pacienteId}`);
    if (!res.ok) throw new Error('Falha ao calcular Nota C3 da paciente');
    return res.json();
  },
};
