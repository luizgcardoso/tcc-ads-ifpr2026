import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CalculosObstetricos } from '../src/services/CalculosObstetricos';

describe('CalculosObstetricos (AI-DLC Gate 1)', () => {
  it('deve calcular a DPP corretamente adicionando 280 dias à DUM', () => {
    const dum = '2026-01-01';
    const dpp = CalculosObstetricos.calcularDPP(dum);
    // 2026-01-01 + 280 dias = 2026-10-08
    assert.strictEqual(dpp, '2026-10-08');
  });

  it('deve calcular a idade gestacional exata em semanas e dias', () => {
    const dum = '2026-01-01';
    const dataRef = '2026-03-12'; // 70 dias = 10 semanas exatas
    const ig = CalculosObstetricos.calcularIdadeGestacional(dum, dataRef);

    assert.strictEqual(ig.semanas, 10);
    assert.strictEqual(ig.dias, 0);
    assert.strictEqual(ig.totalDias, 70);
  });

  it('deve calcular dias residuais na idade gestacional', () => {
    const dum = '2026-01-01';
    const dataRef = '2026-01-16'; // 15 dias = 2 semanas e 1 dia
    const ig = CalculosObstetricos.calcularIdadeGestacional(dum, dataRef);

    assert.strictEqual(ig.semanas, 2);
    assert.strictEqual(ig.dias, 1);
  });

  it('deve calcular a diferença de dias corretamente entre duas datas', () => {
    const d1 = '2026-05-01';
    const d2 = '2026-05-31';
    const diff = CalculosObstetricos.diferencaEmDias(d1, d2);
    assert.strictEqual(diff, 30);
  });
});
