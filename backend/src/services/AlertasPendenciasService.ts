import { Paciente, StatusPaciente } from '../entities/Paciente';
import { CalculosObstetricos } from './CalculosObstetricos';

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

export class AlertasPendenciasService {
  /**
   * Avalia a carteira de pacientes e gera a agenda de alertas de busca ativa do ACS
   */
  public static gerarAlertas(
    pacientes: Paciente[],
    dataReferencia: string | Date = new Date()
  ): RelatorioAlertas {
    const alertas: AlertaItem[] = [];
    const hoje = CalculosObstetricos.parseData(dataReferencia);

    for (const paciente of pacientes) {
      if (paciente.status === StatusPaciente.FINALIZADA) continue;

      const visitas = paciente.visitas || [];
      const vacinacoes = paciente.vacinacoes || [];

      // ==========================================
      // 1. Alertas de Gestantes
      // ==========================================
      if (paciente.status === StatusPaciente.GESTANTE) {
        const ig = CalculosObstetricos.calcularIdadeGestacional(paciente.dum, hoje);

        // a) Visita Domiciliar Gestacional (> 30 dias)
        const visitasGestacao = visitas
          .filter((v) => v.fase === 'GESTANTE')
          .sort((a, b) => new Date(b.dataVisita).getTime() - new Date(a.dataVisita).getTime());

        if (visitasGestacao.length === 0) {
          // Nenhuma visita registrada desde o início
          alertas.push({
            id: `visita-zero-${paciente.id}`,
            pacienteId: paciente.id,
            pacienteNome: paciente.nome,
            cpf: paciente.cpf,
            tipo: 'VISITA_GESTAO_ATRASADA',
            gravidade: 'CRITICA',
            titulo: 'Gestante sem nenhuma visita domiciliar do ACS',
            mensagem: `Paciente está na ${ig.semanas}ª semana de gestação e ainda não recebeu a primeira visita do ACS no território.`,
            semanasGestacionais: ig.semanas,
          });
        } else {
          const ultimaVisita = visitasGestacao[0];
          const diasSemVisita = CalculosObstetricos.diferencaEmDias(ultimaVisita.dataVisita, hoje);

          if (diasSemVisita > 30) {
            alertas.push({
              id: `visita-atrasada-${paciente.id}`,
              pacienteId: paciente.id,
              pacienteNome: paciente.nome,
              cpf: paciente.cpf,
              tipo: 'VISITA_GESTAO_ATRASADA',
              gravidade: diasSemVisita > 45 ? 'CRITICA' : 'ALTA',
              titulo: `Visita domiciliar atrasada há ${diasSemVisita} dias`,
              mensagem: `Última visita registrada em ${ultimaVisita.dataVisita}. O intervalo máximo preconizado na gestação é de 30 dias.`,
              diasDesdeUltimoEvento: diasSemVisita,
              semanasGestacionais: ig.semanas,
            });
          }
        }

        // b) Alerta de Imunização: dTpa a partir da 20ª semana
        if (ig.semanas >= 20) {
          const temDtpa = vacinacoes.some((v) => /dtpa/i.test(v.vacinaNomeTipo));
          if (!temDtpa) {
            alertas.push({
              id: `vacina-dtpa-${paciente.id}`,
              pacienteId: paciente.id,
              pacienteNome: paciente.nome,
              cpf: paciente.cpf,
              tipo: 'VACINA_DTPA_PENDENTE',
              gravidade: ig.semanas >= 28 ? 'CRITICA' : 'ALTA',
              titulo: `Vacina dTpa não registrada (${ig.semanas}ª semana)`,
              mensagem: `A paciente atingiu a ${ig.semanas}ª semana gestacional e ainda não possui registro da vacina dTpa (obrigatória a partir da 20ª semana para Nota C3).`,
              semanasGestacionais: ig.semanas,
            });
          }
        }
      }

      // ==========================================
      // 2. Alertas de Puérperas
      // ==========================================
      if (paciente.status === StatusPaciente.PUERPERA && paciente.dataParto) {
        const diasPosParto = CalculosObstetricos.diferencaEmDias(paciente.dataParto, hoje);
        const visitasPuerperio = visitas.filter((v) => v.fase === 'PUERPERA');

        // Puerpério dura até 42 dias
        if (diasPosParto <= 42) {
          // Prioridade máxima: 1ª semana puerperal (até 7 dias)
          if (visitasPuerperio.length === 0) {
            const gravidade = diasPosParto > 7 ? 'CRITICA' : 'ALTA';
            alertas.push({
              id: `visita-puerperal-zero-${paciente.id}`,
              pacienteId: paciente.id,
              pacienteNome: paciente.nome,
              cpf: paciente.cpf,
              tipo: 'VISITA_PUERPERAL_PENDENTE',
              gravidade,
              titulo:
                diasPosParto > 7
                  ? `URGENTE: Visita da 1ª semana pós-parto atrasada (${diasPosParto} dias de puerpério)`
                  : `Visita puerperal prioritária pendente (${diasPosParto}º dia pós-parto)`,
              mensagem: `O Ministério da Saúde preconiza visita domiciliar do ACS na primeira semana após o parto para avaliação da mãe e do recém-nascido.`,
              diasPosParto,
            });
          }
        }
      }
    }

    const criticos = alertas.filter((a) => a.gravidade === 'CRITICA').length;
    const altas = alertas.filter((a) => a.gravidade === 'ALTA').length;
    const moderadas = alertas.filter((a) => a.gravidade === 'MODERADA').length;

    return {
      totalAlertas: alertas.length,
      criticos,
      altas,
      moderadas,
      alertas,
    };
  }
}
