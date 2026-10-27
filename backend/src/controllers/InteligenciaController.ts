import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Paciente } from '../entities/Paciente';
import { CalculadoraC3Service } from '../services/CalculadoraC3Service';
import { AlertasPendenciasService } from '../services/AlertasPendenciasService';

export class InteligenciaController {
  private pacienteRepo = AppDataSource.getRepository(Paciente);

  public calcularNotaC3 = async (req: Request, res: Response): Promise<Response> => {
    try {
      const pacienteId = Array.isArray(req.params.pacienteId)
        ? req.params.pacienteId[0]
        : req.params.pacienteId;

      const paciente = await this.pacienteRepo.findOne({
        where: { id: pacienteId },
        relations: [
          'consultas',
          'visitas',
          'vacinacoes',
          'avaliacoesOdonto',
          'profissional',
          'bebes',
        ],
      });

      if (!paciente) {
        return res.status(404).json({ error: 'Paciente não encontrada.' });
      }

      const resultado = CalculadoraC3Service.calcular(paciente);
      return res.json(resultado);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  public obterResumoGeralC3 = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const pacientes = await this.pacienteRepo.find({
        relations: ['consultas', 'visitas', 'vacinacoes', 'avaliacoesOdonto'],
      });

      if (pacientes.length === 0) {
        return res.json({
          totalPacientes: 0,
          mediaPontuacao: 0,
          distribuicao: [],
          pacientesScores: [],
        });
      }

      const scores = pacientes.map((p) => CalculadoraC3Service.calcular(p));
      const somaPontos = scores.reduce((acc, s) => acc + s.pontuacaoTotal, 0);
      const mediaPontuacao = Math.round(somaPontos / scores.length);

      return res.json({
        totalPacientes: pacientes.length,
        mediaPontuacao,
        pacientesScores: scores,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  public obterAlertas = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { dataReferencia } = req.query;

      const pacientes = await this.pacienteRepo.find({
        relations: ['visitas', 'vacinacoes', 'consultas'],
      });

      const relatorio = AlertasPendenciasService.gerarAlertas(
        pacientes,
        typeof dataReferencia === 'string' ? dataReferencia : new Date()
      );

      return res.json(relatorio);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}
