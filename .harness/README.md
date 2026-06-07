# Harness de desenvolvimento

Esta pasta define o ciclo de execucao e validacao usado por pessoas e agentes de
codigo no projeto. Os scripts sao chamados pelo `package.json`; prefira os
comandos npm para manter a mesma interface em qualquer ambiente.

## Comandos

```bash
npm run harness:setup
npm run harness:check:quick
npm run harness:check
npm run harness:preflight
npm run harness:smoke
```

- `harness:setup`: valida Node/npm, instala dependencias com `npm ci` e avisa
  quando a configuracao local esta incompleta.
- `harness:check:quick`: executa lint e verificacao de tipos.
- `harness:check`: executa a checagem rapida, gera o build estatico e valida os
  artefatos essenciais em `out/`. O comando tambem reprova falhas de API que o
  Next.js registra durante o prerender sem retornar codigo de erro.
- `harness:preflight`: confirma que a API necessaria para o export estatico
  responde antes de iniciar o build.
- `harness:smoke`: valida somente os artefatos do ultimo build.

## Contrato do ambiente

- Node.js 18 ou superior.
- npm disponivel.
- `NEXT_PUBLIC_API_URL` definido em `.env` ou no ambiente para fluxos que
  consultam a API durante o build.
- A API configurada deve estar acessivel quando o export estatico precisar
  gerar rotas publicas dinamicas.

## Fluxo recomendado

1. Execute `npm run harness:setup` ao preparar um workspace novo.
2. Durante a implementacao, use `npm run harness:check:quick`.
3. Antes de concluir a tarefa, use `npm run harness:check`.
4. Valide manualmente no navegador o fluxo funcional alterado.

O smoke test nao substitui a validacao manual dos perfis, do cadastro anual nem
dos filtros LGPD.

Use `.harness/tasks/TEMPLATE.md` quando a tarefa precisar de um contrato
persistente com escopo, criterios de aceite e cenarios de validacao.

O workflow `.github/workflows/quality.yml` executa a checagem rapida em pushes
para `main` e em pull requests. A validacao completa permanece dependente da API
configurada e deve ser executada antes da conclusao da tarefa.
