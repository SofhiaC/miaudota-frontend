// Único ponto do frontend que fala com o backend: tudo vai para o API Gateway (que repassa ao BFF).
// Nenhum microsserviço é chamado diretamente.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

let token = null;
let aoExpirar = () => {};
export const setToken = (t) => { token = t; };
export const setAoExpirar = (fn) => { aoExpirar = fn; };

async function req(caminho, metodo = 'GET', corpo) {
  let res;
  try {
    res = await fetch(API_URL + caminho, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new Error('Não foi possível falar com o servidor. Verifique sua conexão.');
  }
  const texto = await res.text();
  let dados = null;
  try { dados = texto ? JSON.parse(texto) : null; } catch { dados = null; }

  if (!res.ok) {
    if (res.status === 401 && token) aoExpirar(); // token expirou: volta para o login
    const msg = Array.isArray(dados?.mensagem) ? dados.mensagem.join(' · ') : dados?.mensagem;
    throw new Error(msg || `Erro ${res.status}`);
  }
  return dados;
}

export const api = {
  // conta
  login: (email, senha) => req('/usuarios/login', 'POST', { email, senha }),
  cadastrar: (dados) => req('/usuarios', 'POST', dados),
  excluirConta: () => req('/usuarios/me', 'DELETE'),
  // agregação: animais (MongoDB) + feiras (Azure SQL) + indicador (Azure Function) numa resposta só
  agregado: () => req('/aggregated-data'),
  // animais
  animais: () => req('/animais'),
  sugestoes: () => req('/animais/sugestoes'),
  meusAnimais: () => req('/animais/meus'),
  criarAnimal: (dados) => req('/animais', 'POST', dados),
  atualizarAnimal: (id, dados) => req(`/animais/${id}`, 'PATCH', dados),
  excluirAnimal: (id) => req(`/animais/${id}`, 'DELETE'),
  // favoritos
  curtir: (id_animal) => req('/favoritos', 'POST', { id_animal }),
  favoritos: () => req('/favoritos'),
  descurtir: (id_animal) => req(`/favoritos/${id_animal}`, 'DELETE'),
  // solicitações de adoção
  solicitar: (id_animal) => req('/solicitacoes', 'POST', { id_animal }),
  enviadas: () => req('/solicitacoes/enviadas'),
  recebidas: () => req('/solicitacoes/recebidas'),
  responderSolicitacao: (id, status) => req(`/solicitacoes/${id}/status`, 'PATCH', { status }),
  // feiras
  feiras: () => req('/feiras'),
  feirasProximas: (lat, lng, raioKm = 100) => req(`/feiras/proximas?lat=${lat}&lng=${lng}&raioKm=${raioKm}`),
  criarFeira: (dados) => req('/feiras', 'POST', dados),
  atualizarFeira: (id, dados) => req(`/feiras/${id}`, 'PATCH', dados),
  definirAnimaisFeira: (id, animais) => req(`/feiras/${id}/animais`, 'PATCH', { animais }),
  excluirFeira: (id) => req(`/feiras/${id}`, 'DELETE'),
};
