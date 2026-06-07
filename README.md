# AEE Digital Front

Frontend da Alianca Espirita Evangelica para cadastro anual de centros,
acompanhamento por coordenacoes, administracao e consulta publica de respostas.

## Requisitos

- Node.js 18 ou superior.
- npm.
- `NEXT_PUBLIC_API_URL` configurado em `.env`.

```bash
cp -n .env.example .env
npm run harness:setup
```

## Desenvolvimento

```bash
npm run dev
```

A aplicacao fica disponivel em [http://localhost:3000](http://localhost:3000).

## Validacao

```bash
# Lint e tipos
npm run harness:check:quick

# Lint, tipos, build estatico e smoke test
npm run harness:check
```

O projeto ainda nao possui suite de testes automatizados. Depois da checagem,
valide manualmente o fluxo alterado no navegador. Consulte
[`.harness/README.md`](.harness/README.md) para o contrato completo.
O harness executa um preflight da API antes do export para evitar builds
publicos incompletos e reprova erros de API registrados durante o prerender.

## Variaveis de ambiente

- `NEXT_PUBLIC_API_URL` (obrigatoria): URL da API backend.
- `PUBLIC_HIDDEN_EXTRA` (opcional): IDs de perguntas publicas adicionais que
  devem ser ocultadas, separados por virgula.

## Comandos

- `npm run dev`: servidor local.
- `npm run build`: export estatico em `out/`.
- `npm run lint`: ESLint.
- `npm run typecheck`: verificacao TypeScript.
- `npm run deploy`: build e publicacao na infraestrutura configurada.

As orientacoes para agentes de codigo estao em [`AGENTS.md`](AGENTS.md).
