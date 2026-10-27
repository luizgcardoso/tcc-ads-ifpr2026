import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Paciente } from './Paciente';

export enum SexoBebe {
  M = 'M',
  F = 'F',
}

@Entity('bebes')
export class Bebe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pacienteId: string;

  @ManyToOne(() => Paciente, (paciente) => paciente.bebes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column({ type: 'varchar', length: 150 })
  nome: string;

  @Column({ type: 'date' })
  dataNascimento: string;

  @Column({ type: 'varchar', length: 1, default: SexoBebe.M })
  sexo: SexoBebe;

  @Column({ type: 'int' })
  pesoNascimentoGramas: number;

  @CreateDateColumn()
  createdAt: Date;
}
