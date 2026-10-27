/**
 * Motor de Cálculos Obstétricos segundo os manuais do Ministério da Saúde.
 * - Regra de Naegele / 280 dias para Data Provável do Parto (DPP).
 * - Cálculo de Idade Gestacional (IG) em semanas e dias.
 */

export interface IdadeGestacionalResult {
  semanas: number;
  dias: number;
  totalDias: number;
  formatada: string;
}

export class CalculosObstetricos {
  /**
   * Converte uma string 'YYYY-MM-DD' ou Date para objeto Date seguro (UTC/Local)
   */
  public static parseData(data: string | Date): Date {
    if (data instanceof Date) return data;
    const [ano, mes, dia] = data.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  }

  /**
   * Formata Date para YYYY-MM-DD
   */
  public static formatarData(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  /**
   * Calcula a DPP com base na DUM (Regra obstétrica padrão de 280 dias / 40 semanas)
   */
  public static calcularDPP(dum: string | Date): string {
    const dataDum = this.parseData(dum);
    const dpp = new Date(dataDum);
    dpp.setDate(dpp.getDate() + 280);
    return this.formatarData(dpp);
  }

  /**
   * Calcula a Idade Gestacional (IG) a partir da DUM em uma data de referência
   */
  public static calcularIdadeGestacional(
    dum: string | Date,
    dataReferencia: string | Date = new Date()
  ): IdadeGestacionalResult {
    const dDum = this.parseData(dum);
    const dRef = this.parseData(dataReferencia);

    const diffMs = dRef.getTime() - dDum.getTime();
    const totalDias = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const semanas = Math.floor(totalDias / 7);
    const dias = totalDias % 7;

    return {
      semanas,
      dias,
      totalDias,
      formatada: `${semanas} semanas e ${dias} dias`,
    };
  }

  /**
   * Calcula a diferença em dias entre duas datas
   */
  public static diferencaEmDias(data1: string | Date, data2: string | Date): number {
    const d1 = this.parseData(data1);
    const d2 = this.parseData(data2);
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}
