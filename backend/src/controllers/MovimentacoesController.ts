import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Visita } from '../entities/Visita';
import { Consulta } from '../entities/Consulta';
import { Vacinacao } from '../entities/Vacinacao';
import { AvaliacaoOdontologica } from '../entities/AvaliacaoOdontologica';
import { Paciente } from '../entities/Paciente';
import {
  VisitaCreateSchema,
  ConsultaCreateSchema,
  VacinacaoCreateSchema,
  AvaliacaoOdontoCreateSchema,
} from '../schemas/validationSchemas';
import { CalculosObstetricos } from '../services/CalculosObstetricos';

export class MovimentacoesController {
  private visitaRepo = AppDataSource.getRepository(Visita);
  private consultaRepo = AppDataSource.getRepository(Consulta);
  private vacinacaoRepo = AppDataSource.getRepository(Vacinacao);
  private odontoRepo = AppDataSource.getRepository(AvaliacaoOdontologica);
  private pacienteRepo = AppDataSource.getRepository(Paciente);

  public registrarVisita = async (req: Request, res: Response): Promise<Response> => {
    try {
      const parsed = VisitaCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', detalhes: parsed.error.format() });
      }

      const { pacienteId, profissionalId, dataVisita, fase, observacoes } = parsed.data;

      const paciente = await this.pacienteRepo.findOne({ where: { id: pacienteId } });
      if (!paciente) return res.status(404).json({ error: 'Paciente não encontrada.' });

      const visita = this.visitaRepo.create({
        pacienteId,
        profissionalId,
        dataVisita,
        fase,
        observacoes,
      });

      await this.visitaRepo.save(visita);
      return res.status(201).json(visita);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  public registrarConsulta = async (req: Request, res: Response): Promise<Response> => {
    try {
      const parsed = ConsultaCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', detalhes: parsed.error.format() });
      }

      const { pacienteId, profissionalId, dataConsulta, pressaoArterial, pesoKg, alturaCm, fase, observacoes } =
        parsed.data;

      const paciente = await this.pacienteRepo.findOne({ where: { id: pacienteId } });
      if (!paciente) return res.status(404).json({ error: 'Paciente não encontrada.' });

      // Cálculo da Idade Gestacional na data da consulta
      const ig = CalculosObstetricos.calcularIdadeGestacional(paciente.dum, dataConsulta);

      const consulta = this.consultaRepo.create({
        pacienteId,
        profissionalId,
        dataConsulta,
        pressaoArterial,
        pesoKg,
        alturaCm,
        idadeGestacionalSemanas: ig.semanas,
        fase,
        observacoes,
      });

      await this.consultaRepo.save(consulta);
      return res.status(201).json(consulta);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  public registrarVacinacao = async (req: Request, res: Response): Promise<Response> => {
    try {
      const parsed = VacinacaoCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', detalhes: parsed.error.format() });
      }

      const { pacienteId, vacinaNomeTipo, dataAplicacao, dose } = parsed.data;

      const paciente = await this.pacienteRepo.findOne({ where: { id: pacienteId } });
      if (!paciente) return res.status(404).json({ error: 'Paciente não encontrada.' });

      // Cálculo da Idade Gestacional na data da aplicação da dose
      const ig = CalculosObstetricos.calcularIdadeGestacional(paciente.dum, dataAplicacao);

      const vacinacao = this.vacinacaoRepo.create({
        pacienteId,
        vacinaNomeTipo,
        dataAplicacao,
        dose,
        idadeGestacionalSemanas: ig.semanas,
      });

      await this.vacinacaoRepo.save(vacinacao);
      return res.status(201).json(vacinacao);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  public registrarOdonto = async (req: Request, res: Response): Promise<Response> => {
    try {
      const parsed = AvaliacaoOdontoCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', detalhes: parsed.error.format() });
      }

      const { pacienteId, profissionalId, dataAvaliacao, observacoes } = parsed.data;

      const paciente = await this.pacienteRepo.findOne({ where: { id: pacienteId } });
      if (!paciente) return res.status(404).json({ error: 'Paciente não encontrada.' });

      const odonto = this.odontoRepo.create({
        pacienteId,
        profissionalId,
        dataAvaliacao,
        observacoes,
      });

      await this.odontoRepo.save(odonto);
      return res.status(201).json(odonto);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}
