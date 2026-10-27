import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Profissional } from './Profissional';
import { Bebe } from './Bebe';
import { Visita } from './Visita';
import { Consulta } from './Consulta';
import { Vacinacao } from './Vacinacao';
import { AvaliacaoOdontologica } from './AvaliacaoOdontologica';

export enum StatusPaciente {
  GESTANTE = 'GESTANTE',
  PUERPERA = 'PUERPERA',
  FINALIZADA = 'FINALIZADA',
}

@Entity('pacientes')
export class Paciente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nome: string;

  @Column({ type: 'varchar', length: 14, unique: true })
  cpf: string;

  @Column({ type: 'date' })
  dataNascimento: string;

  @Column({ type: 'date' })
  dum: string;

  @Column({ type: 'date' })
  dpp: string;

  @Column({ type: 'date', nullable: true })
  dataParto?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: StatusPaciente.GESTANTE,
  })
  status: StatusPaciente;

  @Column({ type: 'uuid' })
  profissionalId: string;

  @ManyToOne(() => Profissional, (profissional) => profissional.pacientes, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'profissionalId' })
  profissional: Profissional;

  @OneToMany(() => Bebe, (bebe) => bebe.paciente)
  bebes: Bebe[];

  @OneToMany(() => Visita, (visita) => visita.paciente)
  visitas: Visita[];

  @OneToMany(() => Consulta, (consulta) => consulta.paciente)
  consultas: Consulta[];

  @OneToMany(() => Vacinacao, (vacinacao) => vacinacao.paciente)
  vacinacoes: Vacinacao[];

  @OneToMany(() => AvaliacaoOdontologica, (odonto) => odonto.paciente)
  avaliacoesOdonto: AvaliacaoOdontologica[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
