import { Paciente, StatusPaciente } from '../entities/Paciente';
import { CalculosObstetricos } from './CalculosObstetricos';

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

export class CalculadoraC3Service {
  /**
   * Avalia as 11 boas práticas da Nota Metodológica C3 (Portaria 3.493/2024 / MS)
   */
  public static calcular(paciente: Paciente): ResultadoCalculoNotaC3 {
    const consultas = paciente.consultas || [];
    const visitas = paciente.visitas || [];
    const vacinacoes = paciente.vacinacoes || [];
    const odonto = paciente.avaliacoesOdonto || [];

    const consultasGestacao = consultas.filter((c) => c.fase === 'GESTANTE');
    const consultasPuerperio = consultas.filter((c) => c.fase === 'PUERPERA');
    const visitasGestacao = visitas.filter((v) => v.fase === 'GESTANTE');
    const visitasPuerperio = visitas.filter((v) => v.fase === 'PUERPERA');

    // Ordenar consultas por data crescente
    const consultasOrdenadas = [...consultasGestacao].sort(
      (a, b) => new Date(a.dataConsulta).getTime() - new Date(b.dataConsulta).getTime()
    );

    const primeiraConsultaGestacao = consultasOrdenadas[0];

    const itens: ItemBoaPraticaC3[] = [];

    // (A) 1ª consulta até a 12ª semana (10 pts)
    let aCumprida = false;
    let aDetalhe = 'Nenhuma consulta de pré-natal registrada ainda.';
    if (primeiraConsultaGestacao) {
      const igNaPrimeira = CalculosObstetricos.calcularIdadeGestacional(
        paciente.dum,
        primeiraConsultaGestacao.dataConsulta
      ).semanas;

      if (igNaPrimeira <= 12) {
        aCumprida = true;
        aDetalhe = `Captação precoce realizada com sucesso na ${igNaPrimeira}ª semana.`;
      } else {
        aDetalhe = `1ª consulta tardia (${igNaPrimeira}ª semana). Limite da regra: até 12ª semana.`;
      }
    }
    itens.push({
      codigo: 'A',
      descricao: '1ª consulta pré-natal por médico ou enfermeiro até a 12ª semana de gestação',
      pontosPossiveis: 10,
      pontosObtidos: aCumprida ? 10 : 0,
      cumprida: aCumprida,
      detalhe: aDetalhe,
      faseRequerida: 'GESTACAO',
    });

    // (B) No mínimo 7 consultas por médico ou enfermeiro na gestação (9 pts)
    const bCumprida = consultasGestacao.length >= 7;
    itens.push({
      codigo: 'B',
      descricao: 'Pelo menos 7 consultas médicas ou de enfermagem realizadas durante a gestação',
      pontosPossiveis: 9,
      pontosObtidos: bCumprida ? 9 : 0,
      cumprida: bCumprida,
      detalhe: `${consultasGestacao.length} de 7 consultas realizadas no pré-natal.`,
      faseRequerida: 'GESTACAO',
    });

    // (C) Pelo menos 7 registros de aferição de pressão arterial (9 pts)
    const consultasComPA = consultasGestacao.filter((c) => c.pressaoArterial && c.pressaoArterial.trim() !== '');
    const cCumprida = consultasComPA.length >= 7;
    itens.push({
      codigo: 'C',
      descricao: 'Pelo menos 7 registros de aferição de pressão arterial no pré-natal',
      pontosPossiveis: 9,
      pontosObtidos: cCumprida ? 9 : 0,
      cumprida: cCumprida,
      detalhe: `${consultasComPA.length} de 7 registros de pressão arterial computados.`,
      faseRequerida: 'GESTACAO',
    });

    // (D) Pelo menos 7 registros simultâneos de peso e altura (9 pts)
    const consultasComPesoAltura = consultasGestacao.filter(
      (c) => c.pesoKg > 0 && c.alturaCm > 0
    );
    const dCumprida = consultasComPesoAltura.length >= 7;
    itens.push({
      codigo: 'D',
      descricao: 'Pelo menos 7 registros simultâneos de peso corporal e altura',
      pontosPossiveis: 9,
      pontosObtidos: dCumprida ? 9 : 0,
      cumprida: dCumprida,
      detalhe: `${consultasComPesoAltura.length} de 7 registros simultâneos de peso e altura.`,
      faseRequerida: 'GESTACAO',
    });

    // (E) Pelo menos 3 visitas domiciliares do ACS após a 1ª consulta (9 pts)
    let eCumprida = false;
    let eDetalhe = 'Pendente 1ª consulta médica/enfermagem de referência.';
    if (primeiraConsultaGestacao) {
      const dataPrimeiraConsulta = new Date(primeiraConsultaGestacao.dataConsulta).getTime();
      const visitasAposPrimeira = visitasGestacao.filter(
        (v) => new Date(v.dataVisita).getTime() >= dataPrimeiraConsulta
      );
      eCumprida = visitasAposPrimeira.length >= 3;
      eDetalhe = `${visitasAposPrimeira.length} de 3 visitas domiciliares realizadas após a 1ª consulta.`;
    }
    itens.push({
      codigo: 'E',
      descricao: 'Pelo menos 3 visitas domiciliares do ACS após a 1ª consulta de pré-natal',
      pontosPossiveis: 9,
      pontosObtidos: eCumprida ? 9 : 0,
      cumprida: eCumprida,
      detalhe: eDetalhe,
      faseRequerida: 'GESTACAO',
    });

    // (F) Vacina dTpa registrada a partir da 20ª semana (9 pts)
    const vacinasDtpaValidas = vacinacoes.filter((v) => {
      const nomeMatch = /dtpa/i.test(v.vacinaNomeTipo);
      const igNaDose = CalculosObstetricos.calcularIdadeGestacional(
        paciente.dum,
        v.dataAplicacao
      ).semanas;
      return nomeMatch && igNaDose >= 20;
    });
    const fCumprida = vacinasDtpaValidas.length > 0;
    itens.push({
      codigo: 'F',
      descricao: 'Vacina dTpa registrada a partir da 20ª semana de gestação',
      pontosPossiveis: 9,
      pontosObtidos: fCumprida ? 9 : 0,
      cumprida: fCumprida,
      detalhe: fCumprida
        ? `dTpa aplicada em conformidade na data ${vacinasDtpaValidas[0].dataAplicacao}.`
        : 'Vacina dTpa pendente ou aplicada antes da 20ª semana.',
      faseRequerida: 'GESTACAO',
    });

    // (G) Testes rápidos no 1º trimestre (Fora do MVP inicial)
    itens.push({
      codigo: 'G',
      descricao: 'Testes rápidos ou exames de Sífilis, HIV, Hepatites B e C no 1º trimestre',
      pontosPossiveis: 9,
      pontosObtidos: 0,
      cumprida: false,
      detalhe: 'Módulo laboratorial fora do perfil de escopo do MVP inicial (conforme discussão do artigo).',
      faseRequerida: 'GESTACAO',
    });

    // (H) Testes rápidos no 3º trimestre (Fora do MVP inicial)
    itens.push({
      codigo: 'H',
      descricao: 'Testes rápidos ou exames de Sífilis e HIV no 3º trimestre',
      pontosPossiveis: 9,
      pontosObtidos: 0,
      cumprida: false,
      detalhe: 'Módulo laboratorial fora do perfil de escopo do MVP inicial (conforme discussão do artigo).',
      faseRequerida: 'GESTACAO',
    });

    // (I) Pelo menos 1 consulta no puerpério (9 pts)
    const isPuerperaOuFinalizada =
      paciente.status === StatusPaciente.PUERPERA || paciente.status === StatusPaciente.FINALIZADA;
    let iCumprida = false;
    let iDetalhe = 'Paciente ainda em gestação (não elegível ao puerpério até o parto).';
    if (isPuerperaOuFinalizada) {
      iCumprida = consultasPuerperio.length >= 1;
      iDetalhe = iCumprida
        ? `${consultasPuerperio.length} consulta(s) puerperal(is) registrada(s).`
        : 'Nenhuma consulta puerperal realizada até o momento.';
    }
    itens.push({
      codigo: 'I',
      descricao: 'Pelo menos 1 consulta médica ou de enfermagem no puerpério (até 42 dias pós-parto)',
      pontosPossiveis: 9,
      pontosObtidos: iCumprida ? 9 : 0,
      cumprida: iCumprida,
      detalhe: iDetalhe,
      faseRequerida: 'PUERPERIO',
    });

    // (J) Pelo menos 1 visita domiciliar do ACS no puerpério (9 pts)
    let jCumprida = false;
    let jDetalhe = 'Paciente ainda em gestação (não elegível ao puerpério até o parto).';
    if (isPuerperaOuFinalizada) {
      jCumprida = visitasPuerperio.length >= 1;
      jDetalhe = jCumprida
        ? `${visitasPuerperio.length} visita(s) puerperal(is) registrada(s) pelo ACS.`
        : 'Nenhuma visita puerperal realizada até o momento (atenção à primeira semana).';
    }
    itens.push({
      codigo: 'J',
      descricao: 'Pelo menos 1 visita domiciliar do ACS no puerpério (prioritária na 1ª semana)',
      pontosPossiveis: 9,
      pontosObtidos: jCumprida ? 9 : 0,
      cumprida: jCumprida,
      detalhe: jDetalhe,
      faseRequerida: 'PUERPERIO',
    });

    // (K) Pelo menos 1 atividade em saúde bucal por dentista ou TSB na gestação (9 pts)
    const kCumprida = odonto.length >= 1;
    itens.push({
      codigo: 'K',
      descricao: 'Pelo menos 1 atendimento em saúde bucal realizado por cirurgião-dentista na gestação',
      pontosPossiveis: 9,
      pontosObtidos: kCumprida ? 9 : 0,
      cumprida: kCumprida,
      detalhe: kCumprida
        ? `${odonto.length} consulta(s) odontológica(s) registrada(s).`
        : 'Nenhum atendimento odontológico registrado.',
      faseRequerida: 'GESTACAO',
    });

    const pontuacaoTotal = itens.reduce((acc, curr) => acc + curr.pontosObtidos, 0);
    const pontuacaoMaximaPossivel = 100;
    const percentualConformidade = Math.round((pontuacaoTotal / pontuacaoMaximaPossivel) * 100);

    return {
      pacienteId: paciente.id,
      pacienteNome: paciente.nome,
      cpf: paciente.cpf,
      pontuacaoTotal,
      pontuacaoMaximaPossivel,
      percentualConformidade,
      statusAcompanhamento: paciente.status,
      itens,
    };
  }
}
