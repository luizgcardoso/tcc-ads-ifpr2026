import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Paciente } from './Paciente';

@Entity('vacinacoes')
export class Vacinacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pacienteId: string;

  @ManyToOne(() => Paciente, (paciente) => paciente.vacinacoes, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column({ type: 'varchar', length: 100 })
  vacinaNomeTipo: string; // Ex: 'dTpa', 'VSR'

  @Column({ type: 'date' })
  dataAplicacao: string;

  @Column({ type: 'int', default: 1 })
  dose: number;

  @Column({ type: 'int' })
  idadeGestacionalSemanas: number;

  @CreateDateColumn()
  createdAt: Date;
}
