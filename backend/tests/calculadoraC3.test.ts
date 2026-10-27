import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CalculadoraC3Service } from '../src/services/CalculadoraC3Service';
import { Paciente, StatusPaciente } from '../src/entities/Paciente';
import { Consulta } from '../src/entities/Consulta';
import { Visita, FaseAcompanhamento } from '../src/entities/Visita';
import { Vacinacao } from '../src/entities/Vacinacao';
import { AvaliacaoOdontologica } from '../src/entities/AvaliacaoOdontologica';

describe('CalculadoraC3Service (AI-DLC Gate 2)', () => {
  it('deve avaliar gestante com captação precoce (item A - 10 pontos)', () => {
    const paciente = new Paciente();
    paciente.id = 'p-1';
    paciente.nome = 'Maria Silva';
    paciente.cpf = '12345678909';
    paciente.dum = '2026-01-01';
    paciente.status = StatusPaciente.GESTANTE;

    const consulta = new Consulta();
    consulta.dataConsulta = '2026-02-15'; // ~6 semanas (< 12 semanas)
    consulta.fase = FaseAcompanhamento.GESTANTE;
    consulta.pressaoArterial = '120/80';
    consulta.pesoKg = 62.5;
    consulta.alturaCm = 165;
    paciente.consultas = [consulta];
    paciente.visitas = [];
    paciente.vacinacoes = [];
    paciente.avaliacoesOdonto = [];

    const resultado = CalculadoraC3Service.calcular(paciente);
    const itemA = resultado.itens.find((i) => i.codigo === 'A');

    assert.ok(itemA);
    assert.strictEqual(itemA?.cumprida, true);
    assert.strictEqual(itemA?.pontosObtidos, 10);
  });

  it('deve validar vacina dTpa aplicada a partir da 20ª semana (item F - 9 pontos)', () => {
    const paciente = new Paciente();
    paciente.id = 'p-2';
    paciente.nome = 'Ana Souza';
    paciente.cpf = '98765432100';
    paciente.dum = '2026-01-01';
    paciente.status = StatusPaciente.GESTANTE;

    const vacina = new Vacinacao();
    vacina.vacinaNomeTipo = 'dTpa (Tríplice bacteriana acelular)';
    vacina.dataAplicacao = '2026-06-05'; // ~22 semanas (> 20)
    vacina.dose = 1;
    vacina.idadeGestacionalSemanas = 22;

    paciente.consultas = [];
    paciente.visitas = [];
    paciente.vacinacoes = [vacina];
    paciente.avaliacoesOdonto = [];

    const resultado = CalculadoraC3Service.calcular(paciente);
    const itemF = resultado.itens.find((i) => i.codigo === 'F');

    assert.ok(itemF);
    assert.strictEqual(itemF?.cumprida, true);
    assert.strictEqual(itemF?.pontosObtidos, 9);
  });

  it('deve pontuar saúde bucal na gestação (item K - 9 pontos)', () => {
    const paciente = new Paciente();
    paciente.id = 'p-3';
    paciente.nome = 'Carla Dias';
    paciente.cpf = '11122233344';
    paciente.dum = '2026-01-01';
    paciente.status = StatusPaciente.GESTANTE;

    const odonto = new AvaliacaoOdontologica();
    odonto.dataAvaliacao = '2026-03-01';
    odonto.observacoes = 'Profilaxia e orientação de higiene';

    paciente.consultas = [];
    paciente.visitas = [];
    paciente.vacinacoes = [];
    paciente.avaliacoesOdonto = [odonto];

    const resultado = CalculadoraC3Service.calcular(paciente);
    const itemK = resultado.itens.find((i) => i.codigo === 'K');

    assert.ok(itemK);
    assert.strictEqual(itemK?.cumprida, true);
    assert.strictEqual(itemK?.pontosObtidos, 9);
  });
});
