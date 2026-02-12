# Padrao de Interfaces TypeScript

## 1) Convencoes de nome

- Nomear interfaces e tipos com `PascalCase`.
- Nomear props como `<Componente>Props`.
- Nomear respostas da API com sufixo `Response` quando houver mapeamento explicito.
- Nomear payloads de escrita com sufixo `Payload` ou `Input`.

## 2) Estrategia de organizacao

- Centralizar contratos de dominio em `interfaces/*.interface.ts`.
- Evitar duplicar o mesmo shape em paginas e componentes.
- Exportar tipos reutilizaveis do arquivo de dominio em vez de redefinir localmente.

## 3) Regras de tipagem

- Evitar `any`.
- Preferir `unknown` + validacao quando origem for dinamica.
- Usar union literal para valores fechados (exemplo: `"String" | "Boolean"`).
- Diferenciar campo opcional (`?`) de campo nulo (`| null`) conforme contrato real.
- Usar `Readonly<T>` em estruturas de leitura quando mutacao nao for necessaria.

## 4) Contratos de UI e formulario

- Tipar `onChange` e callbacks com assinatura explicita.
- Tipar estados com generics do React (`useState<T>()`) quando inferencia nao for suficiente.
- Evitar misturar valor bruto de API com valor de exibicao sem camada de adaptacao.

## 5) Processo de revisao

1. Localizar tipo existente com `rg "interface <Nome>|type <Nome>" interfaces components app`.
2. Comparar campos obrigatorios/opcionais com o endpoint consumido.
3. Ajustar tipo central e propagar uso para componentes.
4. Remover tipos locais obsoletos apos migracao.

## 6) Anti-padroes

- Criar novo tipo sem procurar similar existente.
- Tipar callback como `Function`.
- Esconder erro de tipo com `as any`.
- Tipar objeto grande inline em props sem reutilizacao.
