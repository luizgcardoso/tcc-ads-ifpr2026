import { Request, Response } from 'express';
import { Like } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Paciente, StatusPaciente } from '../entities/Paciente';
import { Bebe } from '../entities/Bebe';
import { PacienteCreateSchema, RegistroPartoSchema } from '../schemas/validationSchemas';
import { CalculosObstetricos } from '../services/CalculosObstetricos';

export class PacienteController {
  private pacienteRepo = AppDataSource.getRepository(Paciente);
  private bebeRepo = AppDataSource.getRepository(Bebe);

  public listar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { busca, status, profissionalId } = req.query;

      const qb = this.pacienteRepo
        .createQueryBuilder('paciente')
        .leftJoinAndSelect('paciente.profissional', 'profissional')
        .leftJoinAndSelect('paciente.bebes', 'bebes')
        .orderBy('paciente.nome', 'ASC');

      if (status) {
        qb.andWhere('paciente.status = :status', { status });
      }

      if (profissionalId) {
        qb.andWhere('paciente.profissionalId = :profissionalId', { profissionalId });
      }

      if (busca && typeof busca === 'string') {
        qb.andWhere('(paciente.nome LIKE :busca OR paciente.cpf LIKE :busca)', {
          busca: `%${busca}%`,
        });
      }

      const pacientes = await qb.getMany();

      // Enriquecer com cálculo da idade gestacional atual
      const agora = new Date();
      const resposta = pacientes.map((p) => {
        const ig = CalculosObstetricos.calcularIdadeGestacional(p.dum, agora);
        return {
          ...p,
          idadeGestacionalAtual: ig,
        };
      });

      return res.json(resposta);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  public obterPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const paciente = await this.pacienteRepo.findOne({
        where: { id },
        relations: [
          'profissional',
          'bebes',
          'visitas',
          'visitas.profissional',
          'consultas',
          'consultas.profissional',
          'vacinacoes',
          'avaliacoesOdonto',
          'avaliacoesOdonto.profissional',
        ],
      });

      if (!paciente) {
        return res.status(404).json({ error: 'Paciente não encontrada.' });
      }

      const agora = new Date();
      const ig = CalculosObstetricos.calcularIdadeGestacional(paciente.dum, agora);

      return res.json({
        ...paciente,
        idadeGestacionalAtual: ig,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  public cadastrar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const parsed = PacienteCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados inválidos.',
          detalhes: parsed.error.format(),
        });
      }

      const { nome, cpf, dataNascimento, dum, profissionalId } = parsed.data;

      // Verificação de duplicidade de CPF
      const existe = await this.pacienteRepo.findOne({ where: { cpf } });
      if (existe) {
        return res.status(409).json({
          error: 'Já existe uma paciente cadastrada com este CPF.',
        });
      }

      // Cálculo automático de DPP pelo motor obstétrico
      const dpp = CalculosObstetricos.calcularDPP(dum);

      const paciente = this.pacienteRepo.create({
        nome,
        cpf,
        dataNascimento,
        dum,
        dpp,
        status: StatusPaciente.GESTANTE,
        profissionalId,
      });

      await this.pacienteRepo.save(paciente);

      return res.status(201).json(paciente);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  public registrarParto = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const parsed = RegistroPartoSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados inválidos.',
          detalhes: parsed.error.format(),
        });
      }

      const paciente = await this.pacienteRepo.findOne({ where: { id } });
      if (!paciente) {
        return res.status(404).json({ error: 'Paciente não encontrada.' });
      }

      paciente.dataParto = parsed.data.dataParto;
      paciente.status = StatusPaciente.PUERPERA;
      await this.pacienteRepo.save(paciente);

      if (parsed.data.bebe) {
        const bebe = this.bebeRepo.create({
          pacienteId: paciente.id,
          nome: parsed.data.bebe.nome,
          dataNascimento: parsed.data.dataParto,
          sexo: parsed.data.bebe.sexo,
          pesoNascimentoGramas: parsed.data.bebe.pesoNascimentoGramas,
        });
        await this.bebeRepo.save(bebe);
      }

      return res.json({
        message: 'Parto registrado e paciente transferida para status de Puérpera.',
        paciente,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  /**
   * Exclusão Condicional (Requisito estrito do artigo):
   * Só permite exclusão se não houver registros vinculados.
   */
  public excluir = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const paciente = await this.pacienteRepo.findOne({
        where: { id },
        relations: ['visitas', 'consultas', 'vacinacoes', 'avaliacoesOdonto', 'bebes'],
      });

      if (!paciente) {
        return res.status(404).json({ error: 'Paciente não encontrada.' });
      }

      const totalVinculos =
        (paciente.visitas?.length || 0) +
        (paciente.consultas?.length || 0) +
        (paciente.vacinacoes?.length || 0) +
        (paciente.avaliacoesOdonto?.length || 0) +
        (paciente.bebes?.length || 0);

      if (totalVinculos > 0) {
        return res.status(409).json({
          error:
            'Exclusão bloqueada: a paciente possui movimentações clínicas ou bebê vinculados. Conforme a regra de integridade do Sistema Cegonha, cadastros com histórico clínico não podem ser deletados.',
          totalVinculos,
        });
      }

      await this.pacienteRepo.remove(paciente);

      return res.json({ message: 'Paciente excluída com sucesso.' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}
