import { api } from '../compartilhado/api.js';
import { Mensagem, tentar, useMensagem } from '../compartilhado/componentes.jsx';

export default function Perfil({ usuario, onSair }) {
  const m = useMensagem();
  const ong = usuario.tipo === 'ONG';

  async function excluir() {
    const aviso =
      'Seus dados serão apagados permanentemente, incluindo seus animais, favoritos e solicitações' +
      (ong ? ' e suas feiras.' : '.') + '\n\nDeseja excluir sua conta?';
    if (!window.confirm(aviso)) return;
    const ok = await tentar(m, () => api.excluirConta());
    if (ok) onSair();
  }

  return (
    <>
      <h1>Meu perfil</h1>
      <section className="cartao perfil">
        <h2 className="nome-perfil">{usuario.nome}</h2>
        <p>{usuario.email}</p>
        <span className="selo">{ong ? 'ONG' : 'Pessoa'}</span>
        <Mensagem msg={m.msg} />
        <div className="acoes">
          <button className="primario" onClick={onSair}>Sair</button>
          <button className="perigo" onClick={excluir}>Excluir minha conta</button>
        </div>
      </section>
    </>
  );
}
