import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Profissional } from '../entities/Profissional';
import { Paciente } from '../entities/Paciente';
import { Bebe } from '../entities/Bebe';
import { Vacina } from '../entities/Vacina';
import { Visita } from '../entities/Visita';
import { Consulta } from '../entities/Consulta';
import { Vacinacao } from '../entities/Vacinacao';
import { AvaliacaoOdontologica } from '../entities/AvaliacaoOdontologica';

const isPostgres = process.env.DB_TYPE === 'postgres';

export const AppDataSource = new DataSource(
  isPostgres
    ? {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'sistema_cegonha',
        synchronize: true,
        logging: false,
        entities: [
          Profissional,
          Paciente,
          Bebe,
          Vacina,
          Visita,
          Consulta,
          Vacinacao,
          AvaliacaoOdontologica,
        ],
      }
    : {
        type: 'sqlite',
        database: process.env.DB_DATABASE || 'sistema_cegonha.sqlite',
        synchronize: true,
        logging: false,
        entities: [
          Profissional,
          Paciente,
          Bebe,
          Vacina,
          Visita,
          Consulta,
          Vacinacao,
          AvaliacaoOdontologica,
        ],
      }
);
