# Feature: Export CSV

## Contexto

Hoje o sistema tem uma funcionalidade de exportação de dados em CSV mas ele não está representando completamente a estutura de dados e como os dados do sistema são armazenados. O objetivo da feature é levantar a estrutura de dados do sistema e garantir que a exportação de dados em CSV esteja refletindo a estrutura de dados do sistema.

## Objetivo

Garantir que a exportação de dados em CSV esteja refletindo a estrutura de dados do sistema, para que os usuários possam ter uma visão clara e precisa dos dados exportados.

## Usuário da feature

O usuário da feature é um coordenador ou administrador do sistema que precisa exportar os dados dos centros da Aliança Espírita Evangélica (AEE) para análise e relatórios.

## Contexto

Os dados utilizados devem seguir o modelo no arquivo current-data-model.md, que representa a estrutura de dados atual do sistema. A exportação em CSV deve refletir essa estrutura, garantindo que os dados sejam organizados de forma clara e precisa, facilitando a análise e o uso dos dados exportados pelos usuários.

O summaries são o que determinam a resposta que usuário deu mas cada summary tem um form_id que descreve a estrutura do formulario que foi utilizado.

É importante notar que o formulario é composto por algumas questoes, algumas telas tem marcação de IS_MULTIPLE, o que significa que o usuario pode ter mais de uma resposta para a mesma. 

Na estrutura existe FORM que contem Paginas, que contem quizes, que contem group, que contem questoes. Os groups podem ser IS_MULTIPLE, o que significa que o usuario pode ter mais de um grupo respondido. Quando for representar no excel, cada grupo deve ficar em grupos de colunas, ou seja, se o grupo tem 3 questoes, cada resposta do grupo deve ser representada em 3 colunas, e se o usuario tiver respondido o grupo 2 vezes, ele terá 6 colunas para representar as respostas do grupo.

## Entrada esperada

Uma exportação pode ser a entrada de 1 summary, ou um conjunto de summaries, dependendo do nivel de exportação. O usuário pode solicitar exportar o resultado de 1 centro, de 1 regional, que é o conjunto de centros, ou de toda a aliança, que é o conjunto de regionais. O resultado da exportação deve ser um arquivo CSV que representa a estrutura de dados do sistema, seguindo o modelo do current-data-model.md, e refletindo as respostas dos usuários para os formulários respondidos.

## Saída esperada

A saída esperada é um arquivo CSV que representa a estrutura de dados do sistema, seguindo o modelo do current-data-model.md, e refletindo as respostas dos usuários para os formulários respondidos. O arquivo CSV deve ser organizado de forma clara e precisa, facilitando a análise e o uso dos dados exportados pelos usuários. Cada coluna deve representar uma questão ou um grupo de questões, e cada linha deve representar uma resposta de um usuário para um formulário específico.
