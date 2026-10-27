import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Paciente } from './Paciente';
import { Visita } from './Visita';
import { Consulta } from './Consulta';
import { AvaliacaoOdontologica } from './AvaliacaoOdontologica';

export enum FuncaoProfissional {
  ACS = 'ACS',
  MEDICO = 'MEDICO',
  ENFERMEIRO = 'ENFERMEIRO',
  DENTISTA = 'DENTISTA',
}

@Entity('profissionais')
export class Profissional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nome: string;

  @Column({ type: 'varchar', length: 14, unique: true })
  cpf: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: FuncaoProfissional.ACS,
  })
  funcao: FuncaoProfissional;

  @OneToMany(() => Paciente, (paciente) => paciente.profissional)
  pacientes: Paciente[];

  @OneToMany(() => Visita, (visita) => visita.profissional)
  visitas: Visita[];

  @OneToMany(() => Consulta, (consulta) => consulta.profissional)
  consultas: Consulta[];

  @OneToMany(() => AvaliacaoOdontologica, (odonto) => odonto.profissional)
  avaliacoesOdonto: AvaliacaoOdontologica[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
