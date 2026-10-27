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

@Entity('avaliacoes_odontologicas')
export class AvaliacaoOdontologica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pacienteId: string;

  @ManyToOne(() => Paciente, (paciente) => paciente.avaliacoesOdonto, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column({ type: 'uuid' })
  profissionalId: string;

  @ManyToOne(() => Profissional, (profissional) => profissional.avaliacoesOdonto, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'profissionalId' })
  profissional: Profissional;

  @Column({ type: 'date' })
  dataAvaliacao: string;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn()
  createdAt: Date;
}
