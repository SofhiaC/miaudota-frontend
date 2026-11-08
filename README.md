# Miaudota - Frontend Web

SPA em **React** do Miaudota, a plataforma de adoção de animais, organizada em **microfrontends** (Conta, Adoção e Feiras). Ela consome **somente o API Gateway**, que repassa ao BFF; o frontend nunca chama os microsserviços diretamente.

> Arquitetura de Soluções em Nuvem (PUCPR) - PJBL Miaudota - Entrega 3. Integrantes em [GRUPO.md](GRUPO.md). Prompt usado para gerar o frontend em [Prompt.md](Prompt.md).

## Arquitetura

```
Navegador (React SPA) ──HTTPS──▶ API Gateway (JWT, rate limit) ──▶ BFF ──▶ Microsserviço Usuários (MongoDB Atlas)
                                                                      ├─▶ Microsserviço Adoção (MongoDB Atlas)
                                                                      ├─▶ Microsserviço Geolocalização (Azure SQL)
                                                                      └─▶ Azure Function (indicador de adoção)
```

### Microfrontends

| Módulo | Telas | Quem usa |
|---|---|---|
| `src/shell` | Navegação, sessão (JWT), rotas e **Painel** (`GET /aggregated-data`) | todos |
| `src/mfe-conta` | Login, cadastro (com consentimento LGPD), perfil e exclusão de conta | todos |
| `src/mfe-adocao` | Descobrir (cartões com curtir/pular/solicitar), Favoritos, Pedidos e Meus animais | PESSOA e ONG (ONG não tem Descobrir nem Favoritos) |
| `src/mfe-feiras` | Lista e **mapa** de feiras, feiras próximas, cadastro/edição e escolha dos animais da feira | PESSOA vê; ONG gerencia as suas |
| `src/compartilhado` | `api.js` (único acesso ao gateway), componentes, utilitários e CSS | todos os módulos |

Regras de fronteira (verificadas por teste de arquitetura):

- cada microfrontend é um módulo independente, carregado sob demanda (`React.lazy`, um bundle por módulo);
- microfrontends **não importam uns aos outros nem o shell**; só usam `compartilhado`. O contrato com o shell é por props (`pagina`, `usuario`, `onEntrar`, `onSair`);
- só `compartilhado/api.js` fala com o backend (gateway). `compartilhado/geocodificar.js` consulta o OpenStreetMap (sistema externo de mapas, como no C4);
- o frontend não conhece o endereço de nenhum microsserviço.

> Os microfrontends são módulos de uma única aplicação publicada junto (sem Module Federation, que é opcional na disciplina). A divisão reflete os três MFEs do arc42 e permite evoluir cada domínio separadamente.

## Tecnologias

React 18 · Vite 5 · React Router 6 · Leaflet + OpenStreetMap · CSS puro · nginx (imagem de produção) · Docker · Azure Static Web Apps

## Rotas consumidas (todas via gateway)

| Tela | Chamadas |
|---|---|
| Login / Criar conta | `POST /usuarios/login`, `POST /usuarios` |
| Painel | `GET /aggregated-data` (MongoDB + Azure SQL + Azure Function numa resposta) |
| Descobrir | `GET /animais/sugestoes`, `GET /animais`, `GET /favoritos`, `GET /solicitacoes/enviadas`, `POST /favoritos`, `POST /solicitacoes` |
| Favoritos | `GET /favoritos`, `DELETE /favoritos/:id`, `POST /solicitacoes` |
| Pedidos | `GET /solicitacoes/enviadas`, `GET /solicitacoes/recebidas`, `PATCH /solicitacoes/:id/status` |
| Meus animais | `GET /animais/meus`, `POST /animais`, `PATCH /animais/:id`, `DELETE /animais/:id` |
| Feiras | `GET /feiras`, `GET /feiras/proximas`, `POST /feiras`, `PATCH /feiras/:id`, `PATCH /feiras/:id/animais`, `DELETE /feiras/:id` |
| Perfil | `DELETE /usuarios/me` |

## Como rodar

URLs na nuvem (backend já publicado):

- API Gateway: https://miaudota-gateway.proudground-4968a7f1.canadacentral.azurecontainerapps.io
- Frontend publicado (Azure Static Web Apps): https://red-mushroom-01f218510.4.azurestaticapps.net
- Imagem Docker Hub: `sofhiachromiec/pjbl-frontend:v1`

### Opção 1: desenvolvimento local, falando com o backend na nuvem

```bash
cp .env.example .env      # VITE_API_URL já aponta para o gateway na nuvem
npm install
npm run dev               # http://localhost:5173
```

### Opção 2: build de produção

```bash
npm install
npm run build             # gera ./dist
npm run preview           # http://localhost:4173
```

### Publicar no Azure Static Web Apps

```bash
az login
./publicar-swa.sh        # testa, compila, cria o recurso (1ª vez) e publica; no final mostra a URL
```

O arquivo `public/staticwebapp.config.json` faz as rotas do React Router funcionarem ao recarregar a página.

### Opção 3: Docker

```bash
docker run --rm -p 8080:80 sofhiachromiec/pjbl-frontend:v1     # http://localhost:8080
```

Para apontar a imagem para outro gateway: `docker build --build-arg VITE_API_URL=https://seu-gateway -t pjbl-frontend .` (a URL é gravada no bundle em tempo de build).

## Testes

```bash
npm test
```

- **Unitários** (`testes/util.test.js`): formatação de datas, rótulos, pilha de animais da tela Descobrir, validação de sessão.
- **Arquitetura** (`testes/arquitetura.test.js`): fronteiras entre shell, microfrontends e código compartilhado; apenas `api.js` fala com o gateway.

Usa o executor nativo do Node (`node --test`), sem dependências extras.

## Integrantes

- Sofhia Chromiec
- Fernanda Giacobbo
- Júlia Melo
- Pedro Serafim
