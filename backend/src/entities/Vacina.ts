import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vacinas')
export class Vacina {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nomeVacinaTipo: string;
}
