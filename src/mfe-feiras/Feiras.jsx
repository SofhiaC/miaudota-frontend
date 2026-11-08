import { useEffect, useState } from 'react';
import { api } from '../compartilhado/api.js';
import { Aviso, Carregando, Mensagem, SubAbas, Vazio, tentar, useCarregar, useMensagem } from '../compartilhado/componentes.jsx';
import { fmtData } from '../compartilhado/util.js';
import FormFeira from './FormFeira.jsx';
import Mapa from './Mapa.jsx';
import SeletorAnimais from './SeletorAnimais.jsx';

function EscolherAnimais({ feira, aoSalvar }) {
  const [ids, setIds] = useState((feira.animais || []).map((a) => a._id));
  const m = useMensagem();

  async function salvar() {
    if (await tentar(m, () => api.definirAnimaisFeira(feira._id, ids))) aoSalvar('Animais da feira atualizados!');
  }
  return (
    <div className="bloco">
      <SeletorAnimais selecionados={ids} onChange={setIds} />
      <Mensagem msg={m.msg} />
      <button className="primario" onClick={salvar}>Salvar animais</button>
    </div>
  );
}

export default function Feiras({ usuario }) {
  const ehOng = usuario.tipo === 'ONG';
  const m = useMensagem();
  const [modo, setModo] = useState('lista'); // 'lista' | 'mapa'
  const [posicao, setPosicao] = useState(null); // { lat, lng } quando o navegador liberou a localização
  const [localizando, setLocalizando] = useState(true);
  const [todas, setTodas] = useState(false); // ignora a posição e mostra todas as feiras
  const [cadastrando, setCadastrando] = useState(false);
  const [editando, setEditando] = useState(null); // { id, tipo: 'dados' | 'animais' }

  // como no app: tenta a posição; sem ela, mostra todas as feiras
  useEffect(() => {
    if (!navigator.geolocation) { setLocalizando(false); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { setPosicao({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocalizando(false); },
      () => setLocalizando(false),
      { timeout: 8000 },
    );
  }, []);

  const usarPosicao = posicao && !todas;
  const { dados: feiras, erro, carregando, recarregar } = useCarregar(
    () => (usarPosicao ? api.feirasProximas(posicao.lat, posicao.lng) : api.feiras()),
    [usarPosicao, posicao],
  );

  function salvou(texto) {
    setCadastrando(false);
    setEditando(null);
    m.ok(texto);
    recarregar();
  }
  async function excluir(f) {
    if (!window.confirm(`Excluir a feira "${f.nome}"?`)) return;
    if (await tentar(m, () => api.excluirFeira(f._id), 'Feira excluída.')) recarregar();
  }

  if (localizando) return <Carregando texto="Descobrindo sua localização…" />;

  return (
    <>
      <div className="titulo-linha">
        <h1>Feiras de adoção</h1>
        {ehOng && !cadastrando && <button className="primario" onClick={() => { setCadastrando(true); setEditando(null); }}>Cadastrar feira</button>}
      </div>
      {cadastrando && <FormFeira aoSalvar={salvou} aoCancelar={() => setCadastrando(false)} />}

      <div className="barra">
        <SubAbas opcoes={[{ id: 'lista', rotulo: 'Lista' }, { id: 'mapa', rotulo: 'Mapa' }]} atual={modo} onSelecionar={setModo} />
        {posicao && (
          <button className="secundario" onClick={() => setTodas(!todas)}>
            {todas ? 'Mostrar só as próximas' : 'Mostrar todas as feiras'}
          </button>
        )}
      </div>
      {!posicao && <p className="muted">Sem a sua localização, mostramos todas as feiras.</p>}

      <Mensagem msg={m.msg} />
      <Aviso>{erro}</Aviso>
      {carregando && <Carregando />}

      {!carregando && feiras && modo === 'mapa' && <Mapa feiras={feiras} posicao={posicao} />}
      {!carregando && feiras && modo === 'lista' && (
        <>
          {!feiras.length && <Vazio>Nenhuma feira por perto.</Vazio>}
          <div className="grade">
            {feiras.map((f) => {
              const minha = ehOng && f.id_ong === usuario._id;
              const n = f.animais?.length ?? 0;
              if (editando?.id === f._id && editando.tipo === 'dados') {
                return <FormFeira key={f._id} feira={f} aoSalvar={salvou} aoCancelar={() => setEditando(null)} />;
              }
              return (
                <article className="cartao" key={f._id}>
                  <h2>{f.nome}</h2>
                  <p>{f.endereco}</p>
                  {f.descricao && <p className="muted">{f.descricao}</p>}
                  {f.acontecendoAgora && <span className="selo ok">Acontecendo agora</span>}
                  <p className="muted">{fmtData(f.dataInicio)} até {fmtData(f.dataFim)}</p>
                  {f.distanciaKm != null && <p className="muted">≈ {f.distanciaKm} km de você</p>}
                  <p><strong>{n} {n === 1 ? 'animal disponível' : 'animais disponíveis'}</strong></p>
                  {n > 0 && (
                    <ul className="lista">
                      {f.animais.map((a, i) => <li key={a._id || i}>{typeof a === 'string' ? a : `${a.nome} (${a.especie})`}</li>)}
                    </ul>
                  )}
                  {minha && (
                    <div className="acoes">
                      <button className="secundario" onClick={() => setEditando(editando?.id === f._id && editando.tipo === 'animais' ? null : { id: f._id, tipo: 'animais' })}>
                        {editando?.id === f._id && editando.tipo === 'animais' ? 'Fechar' : 'Escolher animais'}
                      </button>
                      <button className="secundario" onClick={() => { setEditando({ id: f._id, tipo: 'dados' }); setCadastrando(false); }}>Editar</button>
                      <button className="perigo" onClick={() => excluir(f)}>Excluir</button>
                    </div>
                  )}
                  {minha && editando?.id === f._id && editando.tipo === 'animais' && <EscolherAnimais feira={f} aoSalvar={salvou} />}
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
