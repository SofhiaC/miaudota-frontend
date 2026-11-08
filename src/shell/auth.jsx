import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { setAoExpirar, setToken } from '../compartilhado/api.js';
import { sessaoValida } from '../compartilhado/util.js';

const Ctx = createContext(null);
const CHAVE = 'miaudota.sessao';

function lerSessao() {
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE));
    return sessaoValida(s) ? s : null; // sessão antiga ou corrompida é descartada
  } catch {
    return null;
  }
}

/** O shell é dono da sessão (JWT + usuário). Os microfrontends recebem o usuário e os callbacks só por props. */
export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(() => {
    const s = lerSessao();
    if (s) setToken(s.token); // precisa estar definido antes das primeiras chamadas
    return s;
  });

  const sair = useCallback(() => {
    setToken(null);
    setSessao(null);
    try { localStorage.removeItem(CHAVE); } catch { /* ignora */ }
  }, []);

  useEffect(() => { setAoExpirar(sair); }, [sair]);

  const entrar = (resposta) => {
    if (!sessaoValida(resposta)) throw new Error('Resposta inesperada do servidor.');
    setToken(resposta.token);
    setSessao(resposta);
    try { localStorage.setItem(CHAVE, JSON.stringify(resposta)); } catch { /* ignora */ }
  };

  return (
    <Ctx.Provider value={{ usuario: sessao?.usuario || null, logado: !!sessao, entrar, sair }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
