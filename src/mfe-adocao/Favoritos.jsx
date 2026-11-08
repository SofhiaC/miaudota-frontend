import { api } from '../compartilhado/api.js';
import { Aviso, Carregando, Mensagem, Vazio, tentar, useCarregar, useMensagem } from '../compartilhado/componentes.jsx';
import { capitalizar, emojiDaEspecie, rotuloIdade } from '../compartilhado/util.js';

export default function Favoritos() {
  const m = useMensagem();
  const { dados, erro, carregando, recarregar } = useCarregar(() => api.favoritos());

  async function remover(a) {
    if (await tentar(m, () => api.descurtir(a._id), `${a.nome} saiu dos favoritos.`)) recarregar();
  }
  async function solicitar(a) {
    if (!window.confirm(`Solicitar a adoção de ${a.nome}?`)) return;
    await tentar(m, () => api.solicitar(a._id), 'Pedido enviado! Acompanhe em "Pedidos".');
  }

  return (
    <>
      <h1>Favoritos</h1>
      <Mensagem msg={m.msg} />
      {carregando && <Carregando />}
      <Aviso>{erro}</Aviso>
      {dados && !dados.length && <Vazio>Nenhum favorito ainda. Curta um bichinho em "Descobrir"!</Vazio>}
      <div className="grade">
        {dados?.map((a) => (
          <article className="cartao animal" key={a._id}>
            <div className="mini-foto" aria-hidden="true">{emojiDaEspecie(a.especie)}</div>
            <h2>{a.nome}</h2>
            <p className="muted">{capitalizar(a.especie)} · {rotuloIdade(a.idade)}</p>
            {a.descricao && <p>{a.descricao}</p>}
            <div className="acoes">
              <button className="perigo" onClick={() => remover(a)}>Remover</button>
              <button className="primario" disabled={!a.disponivel} onClick={() => solicitar(a)}>
                {a.disponivel ? 'Solicitar adoção' : 'Já adotado'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
