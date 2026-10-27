import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { AppDataSource } from './config/data-source';
import { apiRouter } from './routes/apiRoutes';
import { runSeed } from './database/seed';
import { Paciente } from './entities/Paciente';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api', apiRouter);

// Endpoint de verificação de integridade / saúde do sistema
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    metodologia: 'AI-DLC',
    versao: '1.0.0-mvp',
  });
});

// Servir frontend compilado estaticamente se existir
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

export async function bootstrap() {
  try {
    console.log('🔄 Inicializando DataSource do Sistema Cegonha...');
    await AppDataSource.initialize();
    console.log('✅ Banco de dados conectado com sucesso!');

    // Se o banco estiver vazio, executar seed inicial
    const pacRepo = AppDataSource.getRepository(Paciente);
    const count = await pacRepo.count();
    if (count === 0) {
      console.log('📦 Base de dados sem registros. Executando seed de demonstração...');
      await runSeed();
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor Sistema Cegonha rodando na porta ${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    });

    return { app, server };
  } catch (error) {
    console.error('❌ Erro ao inicializar o servidor:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  bootstrap();
}

export { app };
