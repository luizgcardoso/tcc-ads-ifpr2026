# Sistema Cegonha 🤰👶
> **Sistema de Apoio para o Atendimento às Gestantes e Puérperas na Atenção Primária à Saúde (APS / SUS)**  
> Desenvolvido estritamente sob a metodologia **AI-DLC (*AI-Driven Software Development Life Cycle* - AWS Labs)**

---

## 🎯 Visão Geral
O **Sistema Cegonha** é uma plataforma web concebida para substituir o controle manual (cadernos físicos, planilhas avulsas e formulários impressos) utilizado por Agentes Comunitários de Saúde (ACS) e equipes da Estratégia Saúde da Família (ESF). O software automatiza o acompanhamento pré-natal e puerperal, integrando:
1. **Agenda Operacional de Alertas de Busca Ativa do ACS:** Detecta proativamente visitas atrasadas (> 30 dias na gestação), puerpério prioritário na 1ª semana pós-parto e vacinas pendentes (dTpa a partir da 20ª semana).
2. **Motor de Inteligência da Nota Metodológica C3 (Portaria GM/MS nº 3.493/2024):** Avalia as 11 boas práticas oficiais e calcula o score de cofinanciamento federal (0 a 100 pontos).
3. **Prontuário Longitudinal & Gestão Clínica:** Cadastro de pacientes com cálculo obstétrico automático de DPP (Regra de 280 dias / Naegele), consultas com PA, peso e altura simultâneos, vacinações e avaliações odontológicas com exclusão condicional protetiva.

---

## 🏗️ Metodologia AI-DLC Aplicada

O desenvolvimento seguiu os **23 estágios do Perfil MVP da metodologia AI-DLC (AWS Labs)**:
* **Fase 0 - Inicialização (`0.1` a `0.3`):** Espaço de trabalho, isolamento de ambiente e registro de governança.
* **Fase 1 - Ideação (`1.1`, `1.3`, `1.4`, `1.6`):** Captura de intenção (`intent.md`), estudo de viabilidade, delimitação de escopo enxuto e protótipos de baixa fidelidade.
* **Fase 2 - Inceção (`2.1` a `2.9`):** Requisitos com critérios de aceitação, histórias de usuário (BDD/INVEST), modelo de domínio e contratos de API REST.
* **Fase 3 - Construção (`3.1` a `3.7`):** Codificação orientada por especificação, testes unitários e de integração (100% de sucesso), motores de inteligência e frontend React responsivo.

Toda a documentação dos estágios encontra-se versionada em `docs/aidlc/`.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* Node.js v18+ (recomendado Node.js 22)
* npm ou pnpm

### 1. Inicializar o Backend e a API REST
```bash
cd backend
npm install
npm run seed     # Popula profissionais, gestantes e cenários clínicos reais
npm run dev      # Inicia o servidor com hot-reload na porta 3001
```
> O backend iniciará em `http://localhost:3001` com banco SQLite embedded já populado e pronto para consumo.

### 2. Inicializar o Frontend (SPA React + TailwindCSS)
Em outro terminal:
```bash
cd frontend
npm install
npm run dev
```
> O frontend abrirá em `http://localhost:3000` conectado via proxy transparente à API.

### 3. Rodar a Suíte de Testes Automatizados
```bash
cd backend
npm test
```
Executa os 16 testes automatizados validando cálculos obstétricos, a pontuação da Nota C3, a agenda de alertas e as regras de exclusão condicional da API.

---

## 🏛️ Stack Tecnológica
* **Frontend:** React 18, TypeScript, TailwindCSS, Lucide Icons, Vite.
* **Backend:** Node.js, Express, TypeScript, Zod (validação estrita e algoritmo do CPF).
* **Persistência / ORM:** TypeORM com suporte a PostgreSQL e SQLite embedded.
* **Qualidade / Testes:** Test Runner nativo do Node.js (`node:test`, `node:assert`, `tsx`).
