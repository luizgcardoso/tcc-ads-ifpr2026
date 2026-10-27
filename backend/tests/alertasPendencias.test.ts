import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AlertasPendenciasService } from '../src/services/AlertasPendenciasService';
import { Paciente, StatusPaciente } from '../src/entities/Paciente';
import { Visita, FaseAcompanhamento } from '../src/entities/Visita';

describe('AlertasPendenciasService (AI-DLC Gate 2)', () => {
  it('deve gerar alerta de visita atrasada quando última visita for > 30 dias', () => {
    const paciente = new Paciente();
    paciente.id = 'p-alerta-1';
    paciente.nome = 'Beatriz Lima';
    paciente.cpf = '22233344455';
    paciente.dum = '2026-01-01';
    paciente.status = StatusPaciente.GESTANTE;

    const visita = new Visita();
    visita.dataVisita = '2026-02-01';
    visita.fase = FaseAcompanhamento.GESTANTE;
    paciente.visitas = [visita];
    paciente.vacinacoes = [];

    // Data de referência: 2026-03-15 (42 dias após última visita)
    const relatorio = AlertasPendenciasService.gerarAlertas([paciente], '2026-03-15');

    assert.strictEqual(relatorio.totalAlertas >= 1, true);
    const alertaVisita = relatorio.alertas.find((a) => a.tipo === 'VISITA_GESTAO_ATRASADA');
    assert.ok(alertaVisita);
    assert.strictEqual(alertaVisita?.diasDesdeUltimoEvento, 42);
  });

  it('deve gerar alerta de visita puerperal prioritária na 1ª semana', () => {
    const paciente = new Paciente();
    paciente.id = 'p-alerta-2';
    paciente.nome = 'Juliana Ramos';
    paciente.cpf = '33344455566';
    paciente.dum = '2025-05-01';
    paciente.dataParto = '2026-02-10';
    paciente.status = StatusPaciente.PUERPERA;
    paciente.visitas = []; // nenhuma visita puerperal

    // Data de referência: 2026-02-15 (5º dia pós parto)
    const relatorio = AlertasPendenciasService.gerarAlertas([paciente], '2026-02-15');

    const alertaPuerperal = relatorio.alertas.find((a) => a.tipo === 'VISITA_PUERPERAL_PENDENTE');
    assert.ok(alertaPuerperal);
    assert.strictEqual(alertaPuerperal?.diasPosParto, 5);
  });

  it('deve gerar alerta de vacina dTpa pendente para gestante com 24 semanas', () => {
    const paciente = new Paciente();
    paciente.id = 'p-alerta-3';
    paciente.nome = 'Fernanda Rocha';
    paciente.cpf = '44455566677';
    paciente.dum = '2026-01-01';
    paciente.status = StatusPaciente.GESTANTE;
    paciente.visitas = [];
    paciente.vacinacoes = []; // sem dTpa

    // 24 semanas após 2026-01-01 = ~ 2026-06-18 (168 dias)
    const relatorio = AlertasPendenciasService.gerarAlertas([paciente], '2026-06-18');

    const alertaVacina = relatorio.alertas.find((a) => a.tipo === 'VACINA_DTPA_PENDENTE');
    assert.ok(alertaVacina);
    assert.strictEqual(alertaVacina?.semanasGestacionais, 24);
  });
});
