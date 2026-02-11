# AGENTS.md

Guia para agentes de codigo neste repositorio (`aee_digital_front`).

## 1) Resumo do projeto

- Aplicacao web da Alianca Espirita Evangelica (AEE) para:
  - cadastro anual de centros;
  - acompanhamento por coordenacao;
  - administracao de usuarios/centros/pessoas;
  - consulta publica de respostas (com filtro LGPD).
- Stack principal:
  - `Next.js 14` (App Router) + `React 18`;
  - `TypeScript 5`;
  - `Tailwind CSS` + `shadcn/ui` (Radix);
  - `Chart.js` + `react-chartjs-2`.
- Backend:
  - API separada (Node/Nest), consumida via `NEXT_PUBLIC_API_URL`.

## 2) Estrutura relevante

- `app/`: paginas e fluxos principais.
  - `app/login/page.tsx`: login e redirecionamento por perfil.
  - `app/cadastro/*`: preenchimento de formulario, validacao e historico.
  - `app/resumo/alianca/page.tsx`: visao geral de regionais.
  - `app/resumo/coordenador/page.tsx`: visao regional detalhada.
  - `app/admin/usuarios/page.tsx`: CRUD de usuarios de acesso.
  - `app/respostas/*`: consulta publica (somente leitura).
- `components/`: UI e regras de tela (formularios, tabelas, navegacao, cards).
- `context/UserContext.tsx`: sessao no cliente (localStorage).
- `lib/api.ts`: helper central para construir URL de API.
- `config/lgpd-hidden-questions.ts`: regras de ocultacao na consulta publica.
- `scripts/`: scripts operacionais (deploy estatico e utilitarios XLSX).

## 3) Ambiente e execucao

### Variaveis de ambiente

- Obrigatoria:
  - `NEXT_PUBLIC_API_URL`
- Opcional:
  - `PUBLIC_HIDDEN_EXTRA` (lista separada por virgula para ocultar perguntas publicas)

### Comandos principais

- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run start`
- `npm run deploy` (build estatico + sync S3 + invalidacao CloudFront)

## 4) Fluxos criticos (nao quebrar)

### Autenticacao e sessao

- Login em `app/login/page.tsx`:
  - busca `/passes?user=...&pass=...`;
  - salva usuario no `UserContext` + `localStorage`;
  - grava cookies `userType` e `scope`.
- Guard de rota em `components/AuthGuard.tsx`:
  - permite paths publicos (`/login`, `/about`, `/logout`, `/respostas`...);
  - exige usuario/cookie para resto.
- Regras de perfil e pagina inicial em `app/actions/permitions.ts`.

### Cadastro anual

- `app/cadastro/page.tsx`:
  - carrega formulario ativo;
  - carrega respostas por centro;
  - renderiza `QuizComponent` por pagina;
  - finaliza em `ValidationTab` criando `/summaries`.
- Persistencia de respostas ocorre principalmente em:
  - `components/QuestionComponent.tsx` (`POST/PATCH /answers`);
  - `components/GroupQuestionComponent.tsx` (grupos multiplos, `POST/DELETE /answers`).

### Resumo e coordenacao

- `app/resumo/alianca/page.tsx` usa `/regionais/overview`.
- `app/resumo/coordenador/page.tsx` usa `/regionais/:id/centros-with-answers` e atualiza coordenador da regional.

### Consulta publica e LGPD

- `app/respostas/*` mostra dados somente leitura.
- Filtragem LGPD passa por:
  - `lib/publicAnswers.ts`;
  - `config/lgpd-hidden-questions.ts`.
- Mudancas nesse fluxo exigem validacao extra de privacidade.

## 5) Convencoes de implementacao

- Linguagem e UI:
  - manter textos e labels em portugues;
  - priorizar componentes existentes em `components/ui`.
- Dados e API:
  - usar `apiUrl`/`apiFetch` de `lib/api.ts`;
  - tratar `response.ok` em novas chamadas;
  - evitar URLs hardcoded.
- Tipagem:
  - reutilizar interfaces de `interfaces/*`;
  - evitar `any` quando houver tipo existente.
- Estado:
  - manter padrao atual baseado em hooks React e `UserContext`.

## 6) Qualidade e validacao de mudancas

Este repositorio nao possui suite de testes automatizados. O minimo para toda alteracao:

1. rodar `npm run lint`;
2. rodar `npm run build`;
3. validar manualmente o fluxo alterado no navegador.

Checklist manual sugerido por area:

- Auth:
  - login valido/invalido;
  - redirecionamento por role;
  - logout limpa sessao.
- Cadastro:
  - salvar respostas (inclusive grupos multiplos);
  - validacao de obrigatorios;
  - finalizacao gera summary.
- Resumo:
  - carregamento por regional;
  - exportacoes/botoes administrativos.
- Consulta publica:
  - navegacao regional -> centro;
  - perguntas bloqueadas por LGPD nao aparecem.

## 7) Riscos conhecidos

- `next.config.mjs` usa `output: "export"` (build estatico), enquanto `Dockerfile` usa `npm start` com `.next`. Se mexer em deploy/infra, revisar compatibilidade entre estrategia estatica e runtime Docker.
- Existem arquivos `.xlsx` no repo raiz e scripts com dados sensiveis de credenciais. Evite expor, copiar para logs ou incluir novos dados sensiveis em commits.
- Ha alteracoes locais frequentes em `.env`; nunca commitar valores reais de ambiente.

## 8) Regras de colaboracao para agentes

- Antes de editar:
  - localizar o fluxo completo impactado (pagina + componente + endpoint).
- Ao editar:
  - manter mudancas pequenas e focadas;
  - preservar comportamento por perfil (`admin`, `coord_geral`, `coord_regional`, `presidente`);
  - nao remover filtros LGPD sem requisicao explicita.
- Depois de editar:
  - reportar arquivos alterados;
  - reportar comandos executados e resultado;
  - registrar qualquer risco residual.

