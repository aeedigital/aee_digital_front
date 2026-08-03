# Copilot Instructions

Este documento fornece orientações para o uso eficaz do GitHub Copilot e agentes de código neste repositório (`aee_digital_front`). Ele inclui boas práticas gerais para desenvolvimento e referências aos skills disponíveis para tarefas específicas.

## Boas Práticas Gerais

### 1. Contexto e Preparação
- Sempre leia o arquivo `AGENTS.md` antes de iniciar qualquer tarefa para entender o projeto, estrutura e convenções.
- Use ferramentas de busca (como `grep_search` ou `semantic_search`) para localizar arquivos relevantes antes de editar.
- Verifique erros de lint e build após mudanças usando `npm run lint` e `npm run build`.

### 2. Desenvolvimento
- Mantenha textos e labels em português, conforme convenções do projeto.
- Priorize componentes existentes em `components/ui` para consistência de UI.
- Use `apiUrl` e `apiFetch` de `lib/api.ts` para chamadas à API, evitando URLs hardcoded.
- Reutilize interfaces de `interfaces/*` e evite `any` quando houver tipos existentes.
- Para mudanças em autenticação, cadastro ou consulta pública, valide filtros LGPD em `config/lgpd-hidden-questions.ts`.

### 3. Validação e Testes
- Após edições, execute `npm run lint` e `npm run build` para validar.
- Teste manualmente fluxos críticos: login, cadastro, resumo e consulta pública.
- Use testes automatizados quando possível, mas o projeto atualmente não possui suite de testes.

### 4. Segurança e Privacidade
- Evite expor credenciais ou dados sensíveis em commits.
- Respeite regras LGPD na consulta pública, ocultando perguntas sensíveis.

### 5. Colaboração
- Mantenha mudanças pequenas e focadas.
- Preserve comportamento por perfil de usuário (`admin`, `coord_geral`, `coord_regional`, `presidente`).
- Reporte arquivos alterados e riscos após edições.

## Skills Disponíveis

### normatizar-interfaces-ui
- **Descrição**: Padronizar contratos TypeScript e consistência de UI no projeto AEE Digital (Next.js + Tailwind + shadcn). Usar quando criar, revisar ou refatorar interfaces em `interfaces/*`, props de componentes React, modelos de resposta da API, formulários e telas, garantindo tipagem forte, nomenclatura consistente, reutilização de components/ui e textos em português.
- **Arquivo de Instruções**: `.github/skills/normatizar-interfaces-ui/SKILL.md`
- **Quando Usar**: Ao trabalhar com interfaces TypeScript, componentes React, formulários ou qualquer elemento de UI para garantir consistência e qualidade.
- **Como Aplicar**: Leia o skill file usando a ferramenta `read_file` para obter instruções detalhadas antes de implementar.

Para mais skills ou atualizações, consulte a seção de skills no contexto do projeto.