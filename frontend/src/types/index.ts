export type FuncaoProfissional = 'ACS' | 'MEDICO' | 'ENFERMEIRO' | 'DENTISTA';
export type StatusPaciente = 'GESTANTE' | 'PUERPERA' | 'FINALIZADA';
export type FaseAcompanhamento = 'GESTANTE' | 'PUERPERA';

export interface Profissional {
  id: string;
  nome: string;
  cpf: string;
  funcao: FuncaoProfissional;
}

export interface Bebe {
  id: string;
  pacienteId: string;
  nome: string;
  dataNascimento: string;
  sexo: 'M' | 'F';
  pesoNascimentoGramas: number;
}

export interface Visita {
  id: string;
  pacienteId: string;
  profissionalId: string;
  dataVisita: string;
  fase: FaseAcompanhamento;
  observacoes?: string;
  profissional?: Profissional;
}

export interface Consulta {
  id: string;
  pacienteId: string;
  profissionalId: string;
  dataConsulta: string;
  pressaoArterial: string;
  pesoKg: number;
  alturaCm: number;
  idadeGestacionalSemanas: number;
  fase: FaseAcompanhamento;
  observacoes?: string;
  profissional?: Profissional;
}

export interface Vacinacao {
  id: string;
  pacienteId: string;
  vacinaNomeTipo: string;
  dataAplicacao: string;
  dose: number;
  idadeGestacionalSemanas: number;
}

export interface AvaliacaoOdontologica {
  id: string;
  pacienteId: string;
  profissionalId: string;
  dataAvaliacao: string;
  observacoes?: string;
  profissional?: Profissional;
}

export interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  dum: string;
  dpp: string;
  dataParto?: string;
  status: StatusPaciente;
  profissionalId: string;
  profissional?: Profissional;
  idadeGestacionalAtual?: {
    semanas: number;
    dias: number;
    totalDias: number;
    formatada: string;
  };
  bebes?: Bebe[];
  visitas?: Visita[];
  consultas?: Consulta[];
  vacinacoes?: Vacinacao[];
  avaliacoesOdonto?: AvaliacaoOdontologica[];
}

export interface ItemBoaPraticaC3 {
  codigo: string;
  descricao: string;
  pontosPossiveis: number;
  pontosObtidos: number;
  cumprida: boolean;
  detalhe: string;
  faseRequerida: 'GESTACAO' | 'PUERPERIO' | 'GERAL';
}

export interface ResultadoCalculoNotaC3 {
  pacienteId: string;
  pacienteNome: string;
  cpf: string;
  pontuacaoTotal: number;
  pontuacaoMaximaPossivel: number;
  percentualConformidade: number;
  statusAcompanhamento: StatusPaciente;
  itens: ItemBoaPraticaC3[];
}

export interface AlertaItem {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  cpf: string;
  tipo: 'VISITA_GESTAO_ATRASADA' | 'VISITA_PUERPERAL_PENDENTE' | 'VACINA_DTPA_PENDENTE';
  gravidade: 'ALTA' | 'CRITICA' | 'MODERADA';
  titulo: string;
  mensagem: string;
  diasDesdeUltimoEvento?: number;
  semanasGestacionais?: number;
  diasPosParto?: number;
}

export interface RelatorioAlertas {
  totalAlertas: number;
  criticos: number;
  altas: number;
  moderadas: number;
  alertas: AlertaItem[];
}
