import { z } from 'zod';
import { FuncaoProfissional } from '../entities/Profissional';
import { FaseAcompanhamento } from '../entities/Visita';
import { SexoBebe } from '../entities/Bebe';

/**
 * Validador oficial de CPF (dígitos verificadores módulo 11)
 */
export function validarCPF(cpf: string): boolean {
  const limpo = cpf.replace(/\D/g, '');
  if (limpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(limpo)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(limpo.charAt(i), 10) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(limpo.charAt(9), 10)) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(limpo.charAt(i), 10) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(limpo.charAt(10), 10);
}

export const CpfSchema = z.string().refine(validarCPF, {
  message: 'CPF inválido de acordo com o algoritmo de verificação.',
});

export const ProfissionalCreateSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: CpfSchema,
  funcao: z.nativeEnum(FuncaoProfissional),
});

export const PacienteCreateSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: CpfSchema,
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data deve ser YYYY-MM-DD'),
  dum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de DUM deve ser YYYY-MM-DD'),
  profissionalId: z.string().uuid('ID do profissional ACS inválido'),
});

export const RegistroPartoSchema = z.object({
  dataParto: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data deve ser YYYY-MM-DD'),
  bebe: z
    .object({
      nome: z.string().min(2, 'Nome do bebê obrigatório'),
      sexo: z.nativeEnum(SexoBebe),
      pesoNascimentoGramas: z.number().int().positive('Peso deve ser em gramas e positivo'),
    })
    .optional(),
});

export const VisitaCreateSchema = z.object({
  pacienteId: z.string().uuid(),
  profissionalId: z.string().uuid(),
  dataVisita: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fase: z.nativeEnum(FaseAcompanhamento),
  observacoes: z.string().optional(),
});

export const ConsultaCreateSchema = z.object({
  pacienteId: z.string().uuid(),
  profissionalId: z.string().uuid(),
  dataConsulta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pressaoArterial: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Formato de pressão arterial deve ser ex: 120/80'),
  pesoKg: z.number().positive('Peso em kg deve ser positivo'),
  alturaCm: z.number().int().min(50).max(250, 'Altura deve ser em cm válida'),
  fase: z.nativeEnum(FaseAcompanhamento),
  observacoes: z.string().optional(),
});

export const VacinacaoCreateSchema = z.object({
  pacienteId: z.string().uuid(),
  vacinaNomeTipo: z.string().min(2),
  dataAplicacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dose: z.number().int().positive().default(1),
});

export const AvaliacaoOdontoCreateSchema = z.object({
  pacienteId: z.string().uuid(),
  profissionalId: z.string().uuid(),
  dataAvaliacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  observacoes: z.string().optional(),
});
