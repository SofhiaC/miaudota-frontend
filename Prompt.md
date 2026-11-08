# Prompt usado para gerar o frontend

Ferramenta: **Claude (Anthropic)**, usado como assistente de código pela integrante Sofhia Chromiec.
Abaixo, o resumo fiel do pedido feito (não é a transcrição literal da conversa).

## Pedido

> Desenvolver o frontend web do Miaudota (PJBL, Arquitetura de Soluções em Nuvem, Entrega 3) como uma SPA em
> React, a partir da documentação arc42 do projeto e da lógica do app mobile já existente (telas Descobrir,
> Favoritos, Pedidos, Meus animais, Feiras, Perfil e Login). O estilo não precisa ser idêntico ao do app, mas as
> funcionalidades devem funcionar com a mesma lógica.
>
> Requisitos:
> - consumir **somente o API Gateway** (que repassa ao BFF), nunca os microsserviços diretamente;
> - ter uma tela que use o endpoint `GET /aggregated-data` (MongoDB + Azure SQL + Azure Function);
> - organizar a interface em microfrontends (Conta, Adoção e Feiras), conforme o C4 do arc42;
> - mapa de feiras de adoção, cadastro/edição de feiras e escolha dos animais de cada feira pela ONG;
> - autenticação por JWT, com perfis PESSOA e ONG vendo telas diferentes;
> - testes unitários e testes de arquitetura;
> - Dockerfile, publicação da imagem no Docker Hub e publicação no Azure Static Web Apps;
> - README com arquitetura, tecnologias, como rodar e os nomes dos integrantes.

## Decisões tomadas a partir do pedido

- React 18 + Vite + React Router; CSS puro com as cores do app mobile.
- Microfrontends como módulos independentes dentro do mesmo app (`src/mfe-*`), carregados sob demanda com
  `React.lazy`. A comunicação com o shell é só por props, e um teste de arquitetura impede que um módulo importe outro.
- Mapa com Leaflet e OpenStreetMap (sem chave de API).
- Conteúdo gerado foi revisado e testado pelo grupo.
