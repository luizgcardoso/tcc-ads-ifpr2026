import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { app } from '../src/server';
import { AppDataSource } from '../src/config/data-source';
import { runSeed } from '../src/database/seed';

let server: http.Server;
let baseUrl: string;

function makeRequest(
  path: string,
  options: { method?: string; body?: any; headers?: Record<string, string> } = {}
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const bodyStr = options.body ? JSON.stringify(options.body) : null;
    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr).toString() } : {}),
          ...options.headers,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let data;
          try {
            data = JSON.parse(raw);
          } catch {
            data = raw;
          }
          resolve({ status: res.statusCode || 500, data });
        });
      }
    );

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

describe('API REST do Sistema Cegonha (AI-DLC Gate 3)', () => {
  before(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await runSeed();

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as any;
        baseUrl = `http://localhost:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('GET /api/health deve responder status online e AI-DLC', async () => {
    const res = await makeRequest('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'online');
    assert.strictEqual(res.data.metodologia, 'AI-DLC');
  });

  it('GET /api/profissionais deve listar equipe multiprofissional da ESF', async () => {
    const res = await makeRequest('/api/profissionais');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(Array.isArray(res.data), true);
    assert.strictEqual(res.data.length >= 5, true);
  });

  it('GET /api/pacientes deve listar pacientes com cálculo de idade gestacional enriquecido', async () => {
    const res = await makeRequest('/api/pacientes');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(Array.isArray(res.data), true);
    const juliana = res.data.find((p: any) => p.nome.includes('Juliana Cristina'));
    assert.ok(juliana);
    assert.ok(juliana.idadeGestacionalAtual);
  });

  it('GET /api/inteligencia/alertas deve retornar agenda de pendências para busca ativa do ACS', async () => {
    const res = await makeRequest('/api/inteligencia/alertas');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(typeof res.data.totalAlertas, 'number');
    assert.strictEqual(res.data.totalAlertas > 0, true);
    assert.strictEqual(Array.isArray(res.data.alertas), true);
  });

  it('GET /api/inteligencia/indicadores/:pacienteId deve calcular score e 11 boas práticas C3', async () => {
    const pacsRes = await makeRequest('/api/pacientes');
    const juliana = pacsRes.data.find((p: any) => p.nome.includes('Juliana Cristina'));

    const res = await makeRequest(`/api/inteligencia/indicadores/${juliana.id}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(typeof res.data.pontuacaoTotal, 'number');
    assert.strictEqual(res.data.itens.length, 11);
    assert.strictEqual(res.data.pontuacaoTotal >= 50, true);
  });

  it('DELETE /api/pacientes/:id deve bloquear exclusão de paciente com vínculos clínicos (Exclusão Condicional)', async () => {
    const pacsRes = await makeRequest('/api/pacientes');
    const juliana = pacsRes.data.find((p: any) => p.nome.includes('Juliana Cristina'));

    const delRes = await makeRequest(`/api/pacientes/${juliana.id}`, { method: 'DELETE' });
    assert.strictEqual(delRes.status, 409);
    assert.ok(delRes.data.error.includes('Exclusão bloqueada'));
  });
});
