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

export enum FaseAcompanhamento {
  GESTANTE = 'GESTANTE',
  PUERPERA = 'PUERPERA',
}

@Entity('visitas')
export class Visita {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pacienteId: string;

  @ManyToOne(() => Paciente, (paciente) => paciente.visitas, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column({ type: 'uuid' })
  profissionalId: string;

  @ManyToOne(() => Profissional, (profissional) => profissional.visitas, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'profissionalId' })
  profissional: Profissional;

  @Column({ type: 'date' })
  dataVisita: string;

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
