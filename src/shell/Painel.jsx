import { useState } from 'react';
import { api } from '../compartilhado/api.js';
import { Aviso, Carregando, useCarregar } from '../compartilhado/componentes.jsx';
import { fmtData } from '../compartilhado/util.js';

const NIVEL = { BAIXA: 'baixo', MEDIA: 'medio', ALTA: 'alto' };

function Fonte({ titulo, fonte, children }) {
  const ok = fonte?.status === 'ok';
  return (
    <section className="cartao">
      <div className="fonte-topo">
        <h2>{titulo}</h2>
        <span className={`selo ${ok ? 'ok' : 'falha'}`}>{ok ? 'ok' : 'indisponível'}</span>
      </div>
      <p className="origem">Origem: {fonte?.origem}</p>
      {ok ? children : <Aviso>{fonte?.motivo || 'Fonte indisponível no momento.'}</Aviso>}
    </section>
  );
}

/** Tela do endpoint obrigatório GET /aggregated-data: Mongo + Azure SQL + Azure Function numa resposta. */
export default function Painel() {
  const [duracao, setDuracao] = useState(null);
  const { dados, erro, carregando, recarregar } = useCarregar(async () => {
    const inicio = performance.now();
    const r = await api.agregado();
    setDuracao(Math.round(performance.now() - inicio));
    return r;
  });

  return (
    <>
      <div className="titulo-linha">
        <h1>Painel</h1>
        <button className="secundario" onClick={recarregar} disabled={carregando}>Atualizar</button>
      </div>
      <p className="muted">
        Uma única chamada ao BFF (<code>GET /aggregated-data</code>) reúne três fontes: animais no MongoDB,
        feiras no Azure SQL e o indicador calculado pela Azure Function.
      </p>

      {carregando && <Carregando texto="Consultando as três fontes… a primeira chamada da Azure Function pode levar alguns segundos." />}
      <Aviso>{erro}</Aviso>

      {dados && !carregando && (
        <>
          {dados.parcial && <Aviso tipo="atencao">Resposta parcial: alguma fonte não respondeu, mas as demais foram exibidas.</Aviso>}
          <p className="muted">Gerado em {fmtData(dados.geradoEm)}{duracao != null && ` · resposta em ${duracao} ms`}</p>

          <div className="grade">
            <Fonte titulo="Indicador de adoção" fonte={dados.indicadorAdocao}>
              <div className="indicador">
                <span className={`nivel ${NIVEL[dados.indicadorAdocao.nivel] || ''}`}>{dados.indicadorAdocao.nivel}</span>
                <strong className="pontuacao">{dados.indicadorAdocao.pontuacao}</strong>
              </div>
              <p>{dados.indicadorAdocao.mensagem}</p>
              <p className="muted">
                {dados.indicadorAdocao.animaisDisponiveis} animais disponíveis · {dados.indicadorAdocao.feirasAtivas} feiras
                {dados.indicadorAdocao.animaisPorFeira != null && ` · ${dados.indicadorAdocao.animaisPorFeira} animais por feira`}
              </p>
            </Fonte>

            <Fonte titulo={`Animais (${dados.animais.total ?? 0})`} fonte={dados.animais}>
              {dados.animais.itens?.length ? (
                <ul className="lista">
                  {dados.animais.itens.map((a) => (
                    <li key={a._id}><strong>{a.nome}</strong> <span className="muted">{a.especie}, {a.idade} {a.idade === 1 ? 'ano' : 'anos'}</span></li>
                  ))}
                </ul>
              ) : <p className="muted">Nenhum animal cadastrado ainda.</p>}
            </Fonte>

            <Fonte titulo={`Feiras (${dados.feiras.total ?? 0})`} fonte={dados.feiras}>
              {dados.feiras.itens?.length ? (
                <ul className="lista">
                  {dados.feiras.itens.map((f) => (
                    <li key={f._id}><strong>{f.nome}</strong> <span className="muted">{f.endereco} · {fmtData(f.dataInicio)}</span></li>
                  ))}
                </ul>
              ) : <p className="muted">Nenhuma feira cadastrada ainda.</p>}
            </Fonte>
          </div>
        </>
      )}
    </>
  );
}
