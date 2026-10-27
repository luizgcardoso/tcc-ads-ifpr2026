import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Profissional } from '../entities/Profissional';
import { ProfissionalCreateSchema } from '../schemas/validationSchemas';

export class ProfissionalController {
  private repo = AppDataSource.getRepository(Profissional);

  public listar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { funcao } = req.query;
      const where: any = {};
      if (funcao) {
        where.funcao = funcao;
      }

      const profissionais = await this.repo.find({
        where,
        order: { nome: 'ASC' },
      });

      return res.json(profissionais);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  public cadastrar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const parsed = ProfissionalCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Dados inválidos.',
          detalhes: parsed.error.format(),
        });
      }

      const { nome, cpf, funcao } = parsed.data;

      // Verificação de duplicidade de CPF
      const existe = await this.repo.findOne({ where: { cpf } });
      if (existe) {
        return res.status(409).json({
          error: 'Já existe um profissional cadastrado com este CPF.',
        });
      }

      const profissional = this.repo.create({ nome, cpf, funcao });
      await this.repo.save(profissional);

      return res.status(201).json(profissional);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}
