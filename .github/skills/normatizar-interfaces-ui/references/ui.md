# Padrao de UI

## 1) Base visual

- Reutilizar componentes de `components/ui` antes de criar novo componente base.
- Manter linguagem de interface em portugues.
- Manter consistencia de espaco, tipografia e hierarquia visual dentro da tela.

## 2) Composicao de componentes

- Criar componente de tela como composicao de blocos menores.
- Tipar props de cada bloco com interface dedicada.
- Evitar logica de negocio espalhada em componentes puramente visuais.

## 3) Estados obrigatorios de tela

- Definir estado de carregamento quando houver fetch.
- Definir estado de erro com mensagem acionavel.
- Definir estado vazio quando a lista/consulta nao retornar dados.
- Desabilitar acoes durante submissao para evitar clique duplicado.

## 4) Formularios

- Associar campo e label de forma explicita.
- Mostrar validacao de obrigatoriedade de forma visivel.
- Preservar comportamento de autosave e confirmacoes existentes no fluxo de cadastro.

## 5) Acessibilidade e responsividade

- Garantir navegacao por teclado nos controles interativos.
- Usar atributos `aria-*` quando o componente nao for autoexplicativo.
- Validar layout em mobile e desktop.
- Evitar largura fixa sem fallback responsivo.

## 6) Regras de alteracao segura

- Nao trocar biblioteca de UI sem requisicao explicita.
- Nao remover filtros de privacidade (LGPD) em telas publicas.
- Nao alterar fluxo de permissao por perfil sem revisar `app/actions/permitions.ts`.

## 7) Checklist manual

1. Navegar no fluxo completo da tela alterada.
2. Confirmar feedback visual de sucesso/erro.
3. Confirmar que componentes reutilizados mantem estilo e comportamento esperado.
4. Confirmar ausencia de regressao em perfis relevantes.
