import { useCallback, useEffect, useState } from 'react';

/** Carrega dados de uma função assíncrona e expõe estado de carregamento/erro. */
export function useCarregar(funcao, deps = []) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setDados(await funcao());
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { recarregar(); }, [recarregar]);
  return { dados, erro, carregando, recarregar, setDados };
}

/** Mensagem de sucesso/erro para feedback de ações do usuário. */
export function useMensagem() {
  const [msg, setMsg] = useState({ tipo: 'ok', texto: '' });
  return {
    msg,
    ok: (texto) => setMsg({ tipo: 'ok', texto }),
    erro: (texto) => setMsg({ tipo: 'erro', texto }),
    limpar: () => setMsg({ tipo: 'ok', texto: '' }),
  };
}

/** Executa a ação; mostra sucesso/erro pela mensagem. Devolve o resultado, ou undefined se falhar. */
export async function tentar(m, fn, sucesso) {
  m.limpar();
  try {
    const r = await fn();
    if (sucesso) m.ok(sucesso);
    return r ?? true;
  } catch (e) {
    m.erro(e.message);
    return undefined;
  }
}

export const Aviso = ({ tipo = 'erro', children }) =>
  children ? <div className={`aviso ${tipo}`} role="alert">{children}</div> : null;

export const Mensagem = ({ msg }) => <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>;

export const Carregando = ({ texto = 'Carregando…' }) => <p className="muted centro">{texto}</p>;

export const Vazio = ({ children }) => <p className="vazio">{children}</p>;

export const SubAbas = ({ opcoes, atual, onSelecionar }) => (
  <div className="abas" role="tablist">
    {opcoes.map((o) => (
      <button
        key={o.id}
        role="tab"
        aria-selected={atual === o.id}
        className={atual === o.id ? 'aba ativa' : 'aba'}
        onClick={() => onSelecionar(o.id)}
      >
        {o.rotulo}
      </button>
    ))}
  </div>
);
