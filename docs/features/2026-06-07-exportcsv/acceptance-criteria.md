# Critérios de aceite: Exportação de dados em CSV

## Cenário 1: Exportação de dados em CSV para um centro específico
Dado que o usuário é um coordenador ou administrador do sistema
E o usuário tem acesso a um centro específico
Quando o usuário solicita a exportação de dados em CSV para esse centro
Então o sistema deve gerar um arquivo CSV que representa a estrutura de dados do sistema, seguindo o modelo do current-data-model.md, e refletindo as respostas dos usuários para os formulários respondidos
E o arquivo CSV deve ser organizado de forma clara e precisa, facilitando a análise e o uso dos dados exportados pelos usuários. Cada coluna deve representar uma questão ou um grupo de questões, e cada linha deve representar uma resposta de um usuário para um formulário específico.

## Cenário 2: Exportação de dados em CSV para uma regional específica
Dado que o usuário é um coordenador ou administrador do sistema
E o usuário tem acesso a uma regional específica
Quando o usuário solicita a exportação de dados em CSV para essa regional
Então o sistema deve gerar um arquivo CSV que representa a estrutura de dados do sistema, seguindo o modelo do current-data-model.md, e refletindo as respostas dos usuários para os formulários respondidos
E o arquivo CSV deve ser organizado de forma clara e precisa, facilitando a análise e o uso dos dados exportados pelos usuários. Cada coluna deve representar uma questão ou um grupo de questões, e cada linha deve representar uma resposta de um usuário para um formulário específico.

## Cenário 3: Exportação de dados em CSV para toda a aliança
Dado que o usuário é um coordenador ou administrador do sistema
E o usuário tem acesso a toda a aliança
Quando o usuário solicita a exportação de dados em CSV para toda a aliança
Então o sistema deve gerar um arquivo CSV que representa a estrutura de dados do sistema, seguindo o modelo do current-data-model.md, e refletindo as respostas dos usuários para os formulários respondidos
E o arquivo CSV deve ser organizado de forma clara e precisa, facilitando a análise e o uso dos dados exportados pelos usuários. Cada coluna deve representar uma questão ou um grupo de questões, e cada linha deve representar uma resposta de um usuário para um formulário específico.