---
name: normatizar-interfaces-ui
description: Padronizar contratos TypeScript e consistencia de UI no projeto AEE Digital (Next.js + Tailwind + shadcn). Usar quando criar, revisar ou refatorar interfaces em interfaces/*, props de componentes React, modelos de resposta da API, formularios e telas, garantindo tipagem forte, nomenclatura consistente, reutilizacao de components/ui e textos em portugues.
---

# Fluxo de execucao

1. Mapear fluxo impactado (pagina, componentes e endpoints consumidos).
2. Ler contratos existentes em `interfaces/*` e props dos componentes afetados.
3. Definir o contrato alvo antes de editar UI (shape, obrigatoriedade, nulabilidade e nomes).
4. Aplicar padronizacao de interfaces e props sem quebrar comportamento por perfil.
5. Ajustar UI para usar componentes de `components/ui` e manter consistencia visual.
6. Validar com `npm run lint`, `npm run build` e teste manual do fluxo alterado.
7. Reportar arquivos alterados, comandos executados e riscos residuais.

# Carregar referencias sob demanda

- Ler `references/interfaces.md` ao definir ou revisar tipos TypeScript.
- Ler `references/ui.md` ao revisar layout, estados visuais e interacoes de tela.

# Regras obrigatorias

- Reutilizar tipos existentes antes de criar novos.
- Evitar `any`; preferir unions, utilitarios de tipo e `unknown` com refinamento.
- Manter labels e mensagens em portugues.
- Priorizar componentes existentes em `components/ui` antes de criar wrappers.
- Preservar filtros LGPD e regras de perfil (`admin`, `coord_geral`, `coord_regional`, `presidente`).
- Usar `apiUrl` ou `apiFetch` para chamadas novas; nao hardcodar endpoint.

# Definicao de pronto

- Interfaces centralizadas, sem duplicacao obvia de shape.
- Props de componentes tipadas e sem `any`.
- UI com estados de carregamento, erro e vazio quando aplicavel.
- Fluxo manual principal validado sem regressao funcional.
