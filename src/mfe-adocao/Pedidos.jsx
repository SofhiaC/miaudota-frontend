import { useState } from 'react';
import { api } from '../compartilhado/api.js';
import { Aviso, Carregando, Mensagem, SubAbas, Vazio, tentar, useCarregar, useMensagem } from '../compartilhado/componentes.jsx';
import { STATUS_PEDIDO, capitalizar, fmtData, rotuloIdade } from '../compartilhado/util.js';

const COR = { PENDENTE: 'atencao', APROVADA: 'ok', RECUSADA: 'falha' };

export default function Pedidos({ usuario }) {
  const ong = usuario.tipo === 'ONG'; // ONG não adota: só recebe pedidos nos seus animais
  const [modo, setModo] = useState(ong ? 'recebidos' : 'enviados');
  const recebidos = modo === 'recebidos';
  const m = useMensagem();
  const { dados, erro, carregando, recarregar } = useCarregar(() => (recebidos ? api.recebidas() : api.enviadas()), [recebidos]);

  async function responder(id, status) {
    const ok = await tentar(m, () => api.responderSolicitacao(id, status), `Pedido ${status === 'APROVADA' ? 'aprovado' : 'recusado'}.`);
    if (ok) recarregar();
  }

  return (
    <>
      <h1>Pedidos de adoção</h1>
      {!ong && (
        <SubAbas
          opcoes={[{ id: 'enviados', rotulo: 'Enviados por mim' }, { id: 'recebidos', rotulo: 'Recebidos' }]}
          atual={modo}
          onSelecionar={setModo}
        />
      )}
      <Mensagem msg={m.msg} />
      {carregando && <Carregando />}
      <Aviso>{erro}</Aviso>
      {dados && !dados.length && (
        <Vazio>{recebidos ? 'Ninguém pediu seus animais ainda.' : 'Você ainda não pediu nenhuma adoção.'}</Vazio>
      )}

      <div className="grade">
        {!carregando && dados?.map((s) => {
          const a = s.animal;
          return (
            <article className="cartao" key={s._id}>
              <h2>{s.animalNome ?? 'Animal removido'}</h2>
              {a && <p className="muted">{capitalizar(a.especie)} · {rotuloIdade(a.idade)}</p>}
              {a?.descricao && <p>{a.descricao}</p>}
              {recebidos && s.adotante && <p>Adotante: <strong>{s.adotante.nome}</strong> · {s.adotante.email}</p>}
              <p className="muted">Pedido em {fmtData(s.createdAt)}</p>
              <span className={`selo ${COR[s.status] || ''}`}>{STATUS_PEDIDO[s.status] || s.status}</span>
              {recebidos && s.status === 'PENDENTE' && (
                <div className="acoes">
                  <button className="primario" onClick={() => responder(s._id, 'APROVADA')}>Aprovar</button>
                  <button className="perigo" onClick={() => responder(s._id, 'RECUSADA')}>Recusar</button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
