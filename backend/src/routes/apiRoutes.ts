import { Router } from 'express';
import { ProfissionalController } from '../controllers/ProfissionalController';
import { PacienteController } from '../controllers/PacienteController';
import { MovimentacoesController } from '../controllers/MovimentacoesController';
import { InteligenciaController } from '../controllers/InteligenciaController';

export const apiRouter = Router();

const profissionalController = new ProfissionalController();
const pacienteController = new PacienteController();
const movimentacoesController = new MovimentacoesController();
const inteligenciaController = new InteligenciaController();

// 1. Profissionais
apiRouter.get('/profissionais', profissionalController.listar);
apiRouter.post('/profissionais', profissionalController.cadastrar);

// 2. Pacientes
apiRouter.get('/pacientes', pacienteController.listar);
apiRouter.get('/pacientes/:id', pacienteController.obterPorId);
apiRouter.post('/pacientes', pacienteController.cadastrar);
apiRouter.put('/pacientes/:id/parto', pacienteController.registrarParto);
apiRouter.delete('/pacientes/:id', pacienteController.excluir);

// 3. Movimentações Clínicas
apiRouter.post('/movimentacoes/visitas', movimentacoesController.registrarVisita);
apiRouter.post('/movimentacoes/consultas', movimentacoesController.registrarConsulta);
apiRouter.post('/movimentacoes/vacinacoes', movimentacoesController.registrarVacinacao);
apiRouter.post('/movimentacoes/odonto', movimentacoesController.registrarOdonto);

// 4. Inteligência (Nota C3 e Agenda de Alertas)
apiRouter.get('/inteligencia/indicadores', inteligenciaController.obterResumoGeralC3);
apiRouter.get('/inteligencia/indicadores/:pacienteId', inteligenciaController.calcularNotaC3);
apiRouter.get('/inteligencia/alertas', inteligenciaController.obterAlertas);
