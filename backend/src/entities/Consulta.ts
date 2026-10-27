import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Paciente } from './Paciente';
import { Profissional } from './Profissional';
import { FaseAcompanhamento } from './Visita';

@Entity('consultas')
export class Consulta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pacienteId: string;

  @ManyToOne(() => Paciente, (paciente) => paciente.consultas, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column({ type: 'uuid' })
  profissionalId: string;

  @ManyToOne(() => Profissional, (profissional) => profissional.consultas, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'profissionalId' })
  profissional: Profissional;

  @Column({ type: 'date' })
  dataConsulta: string;

  @Column({ type: 'varchar', length: 15 })
  pressaoArterial: string; // Ex: "120/80"

  @Column({ type: 'float' })
  pesoKg: number;

  @Column({ type: 'int' })
  alturaCm: number;

  @Column({ type: 'int' })
  idadeGestacionalSemanas: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: FaseAcompanhamento.GESTANTE,
  })
  fase: FaseAcompanhamento;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn()
  createdAt: Date;
}
