import { AppDataSource } from '../config/data-source';
import { Profissional, FuncaoProfissional } from '../entities/Profissional';
import { Paciente, StatusPaciente } from '../entities/Paciente';
import { Bebe, SexoBebe } from '../entities/Bebe';
import { Visita, FaseAcompanhamento } from '../entities/Visita';
import { Consulta } from '../entities/Consulta';
import { Vacinacao } from '../entities/Vacinacao';
import { AvaliacaoOdontologica } from '../entities/AvaliacaoOdontologica';
import { Vacina } from '../entities/Vacina';
import { CalculosObstetricos } from '../services/CalculosObstetricos';

export async function runSeed() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const profRepo = AppDataSource.getRepository(Profissional);
  const pacRepo = AppDataSource.getRepository(Paciente);
  const bebeRepo = AppDataSource.getRepository(Bebe);
  const visitaRepo = AppDataSource.getRepository(Visita);
  const consRepo = AppDataSource.getRepository(Consulta);
  const vacRepo = AppDataSource.getRepository(Vacinacao);
  const vacPadraoRepo = AppDataSource.getRepository(Vacina);
  const odontoRepo = AppDataSource.getRepository(AvaliacaoOdontologica);

  // Limpar tabelas existentes para garantir estado limpo e determinístico
  await odontoRepo.clear();
  await vacRepo.clear();
  await consRepo.clear();
  await visitaRepo.clear();
  await bebeRepo.clear();
  await pacRepo.clear();
  await profRepo.clear();
  await vacPadraoRepo.clear();

  console.log('🌱 Populando dados primários do Sistema Cegonha...');

  // 1. Vacinas Padrão
  for (const nome of ['dTpa', 'VSR', 'Hepatite B', 'Influenza']) {
    await vacPadraoRepo.save(vacPadraoRepo.create({ nomeVacinaTipo: nome }));
  }

  // 2. Profissionais da ESF (Estratégia Saúde da Família)
  const acsAna = await profRepo.save(
    profRepo.create({
      nome: 'Ana Paula Silva (ACS Microárea 01)',
      cpf: '74125896300',
      funcao: FuncaoProfissional.ACS,
    })
  );

  const acsCarlos = await profRepo.save(
    profRepo.create({
      nome: 'Carlos Eduardo Mendes (ACS Microárea 02)',
      cpf: '85236974100',
      funcao: FuncaoProfissional.ACS,
    })
  );

  const medRoberto = await profRepo.save(
    profRepo.create({
      nome: 'Dr. Roberto Martins (Médico de Família)',
      cpf: '96325874100',
      funcao: FuncaoProfissional.MEDICO,
    })
  );

  const enfJuliana = await profRepo.save(
    profRepo.create({
      nome: 'Enfª Juliana Costa (Enfermagem Obstétrica)',
      cpf: '15935748600',
      funcao: FuncaoProfissional.ENFERMEIRO,
    })
  );

  const dentBeatriz = await profRepo.save(
    profRepo.create({
      nome: 'Dra. Beatriz Santos (Cirurgiã-Dentista)',
      cpf: '35715948600',
      funcao: FuncaoProfissional.DENTISTA,
    })
  );

  // 3. Pacientes Clínicas com Cenários da Atenção Primária
  // Caso 1: Mariana - 24 semanas de gestação, captação precoce, mas dTpa PENDENTE
  const pacMariana = await pacRepo.save(
    pacRepo.create({
      nome: 'Mariana Ferreira Lima',
      cpf: '12345678909',
      dataNascimento: '1998-04-12',
      dum: '2026-05-10', // ~24 semanas em relação a out/2026
      dpp: CalculosObstetricos.calcularDPP('2026-05-10'),
      status: StatusPaciente.GESTANTE,
      profissionalId: acsAna.id,
    })
  );

  // 1ª Consulta Precoce (8ª semana)
  await consRepo.save(
    consRepo.create({
      pacienteId: pacMariana.id,
      profissionalId: medRoberto.id,
      dataConsulta: '2026-07-05',
      pressaoArterial: '110/70',
      pesoKg: 58.0,
      alturaCm: 162,
      idadeGestacionalSemanas: 8,
      fase: FaseAcompanhamento.GESTANTE,
    })
  );

  // Visita Domiciliar ACS recente
  await visitaRepo.save(
    visitaRepo.create({
      pacienteId: pacMariana.id,
      profissionalId: acsAna.id,
      dataVisita: '2026-10-15',
      fase: FaseAcompanhamento.GESTANTE,
      observacoes: 'Gestante relata bem-estar. Orientada sobre vacina dTpa.',
    })
  );

  // Caso 2: Patrícia - 34 semanas, visita ACS ATRASADA (> 35 dias)
  const pacPatricia = await pacRepo.save(
    pacRepo.create({
      nome: 'Patrícia Gomes Rocha',
      cpf: '23456789012',
      dataNascimento: '1995-08-20',
      dum: '2026-03-01',
      dpp: CalculosObstetricos.calcularDPP('2026-03-01'),
      status: StatusPaciente.GESTANTE,
      profissionalId: acsAna.id,
    })
  );

  // Última visita há 45 dias
  await visitaRepo.save(
    visitaRepo.create({
      pacienteId: pacPatricia.id,
      profissionalId: acsAna.id,
      dataVisita: '2026-09-10', // Mais de 45 dias atrás
      fase: FaseAcompanhamento.GESTANTE,
      observacoes: 'Acompanhamento domiciliar de rotina.',
    })
  );

  // Vacina dTpa tomada
  await vacRepo.save(
    vacRepo.create({
      pacienteId: pacPatricia.id,
      vacinaNomeTipo: 'dTpa',
      dataAplicacao: '2026-07-28',
      dose: 1,
      idadeGestacionalSemanas: 21,
    })
  );

  // Caso 3: Camila - Puérpera (parto há 4 dias), bebê nascido, sem visita da 1ª semana!
  const pacCamila = await pacRepo.save(
    pacRepo.create({
      nome: 'Camila Rodrigues dos Santos',
      cpf: '34567890123',
      dataNascimento: '2001-11-05',
      dum: '2026-01-15',
      dpp: CalculosObstetricos.calcularDPP('2026-01-15'),
      dataParto: '2026-10-23', // Parto há 4 dias
      status: StatusPaciente.PUERPERA,
      profissionalId: acsCarlos.id,
    })
  );

  await bebeRepo.save(
    bebeRepo.create({
      pacienteId: pacCamila.id,
      nome: 'Lucas Rodrigues dos Santos',
      dataNascimento: '2026-10-23',
      sexo: SexoBebe.M,
      pesoNascimentoGramas: 3420,
    })
  );

  // Caso 4: Juliana - Alta adesão e conformidade com Nota C3 (score exemplar)
  const pacJuliana = await pacRepo.save(
    pacRepo.create({
      nome: 'Juliana Cristina de Oliveira',
      cpf: '45678901234',
      dataNascimento: '1993-02-14',
      dum: '2026-03-10',
      dpp: CalculosObstetricos.calcularDPP('2026-03-10'),
      status: StatusPaciente.GESTANTE,
      profissionalId: acsAna.id,
    })
  );

  // 1ª Consulta Precoce
  await consRepo.save(
    consRepo.create({
      pacienteId: pacJuliana.id,
      profissionalId: enfJuliana.id,
      dataConsulta: '2026-04-18', // ~5ª semana
      pressaoArterial: '120/80',
      pesoKg: 64.0,
      alturaCm: 168,
      idadeGestacionalSemanas: 5,
      fase: FaseAcompanhamento.GESTANTE,
    })
  );

  // Mais 6 consultas para totalizar 7 com PA, peso e altura
  const datasConsultas = [
    '2026-05-15',
    '2026-06-12',
    '2026-07-10',
    '2026-08-07',
    '2026-09-04',
    '2026-10-02',
  ];
  for (let i = 0; i < datasConsultas.length; i++) {
    await consRepo.save(
      consRepo.create({
        pacienteId: pacJuliana.id,
        profissionalId: i % 2 === 0 ? medRoberto.id : enfJuliana.id,
        dataConsulta: datasConsultas[i],
        pressaoArterial: '120/80',
        pesoKg: 64.0 + (i + 1) * 1.2,
        alturaCm: 168,
        idadeGestacionalSemanas: 9 + i * 4,
        fase: FaseAcompanhamento.GESTANTE,
      })
    );
  }

  // 4 Visitas domiciliares do ACS
  for (const dataV of ['2026-05-02', '2026-06-20', '2026-08-15', '2026-10-10']) {
    await visitaRepo.save(
      visitaRepo.create({
        pacienteId: pacJuliana.id,
        profissionalId: acsAna.id,
        dataVisita: dataV,
        fase: FaseAcompanhamento.GESTANTE,
        observacoes: 'Acompanhamento pré-natal regular no domicílio.',
      })
    );
  }

  // Vacina dTpa na 22ª semana
  await vacRepo.save(
    vacRepo.create({
      pacienteId: pacJuliana.id,
      vacinaNomeTipo: 'dTpa',
      dataAplicacao: '2026-08-10',
      dose: 1,
      idadeGestacionalSemanas: 22,
    })
  );

  // Consulta Odontológica
  await odontoRepo.save(
    odontoRepo.create({
      pacienteId: pacJuliana.id,
      profissionalId: dentBeatriz.id,
      dataAvaliacao: '2026-06-05',
      observacoes: 'Exame clínico odontológico gestacional, profilaxia e orientação bucal.',
    })
  );

  console.log('✅ Base de dados do Sistema Cegonha populada com êxito!');
}

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Erro no seed:', err);
      process.exit(1);
    });
}
