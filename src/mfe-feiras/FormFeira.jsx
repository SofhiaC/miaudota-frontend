import { useState } from 'react';
import { api } from '../compartilhado/api.js';
import { Mensagem, tentar, useMensagem } from '../compartilhado/componentes.jsx';
import { geocodificar } from '../compartilhado/geocodificar.js';
import { inputLocalParaIso, isoParaInputLocal } from '../compartilhado/util.js';
import SeletorAnimais from './SeletorAnimais.jsx';

const VAZIO = { nome: '', descricao: '', endereco: '', latitude: '', longitude: '', inicio: '', fim: '' };

/** Cadastra uma feira (com os animais) ou, com `feira`, edita os dados dela. */
export default function FormFeira({ feira, aoSalvar, aoCancelar }) {
  const [f, setF] = useState(
    feira
      ? {
          nome: feira.nome, descricao: feira.descricao || '', endereco: feira.endereco,
          latitude: String(feira.latitude), longitude: String(feira.longitude),
          inicio: isoParaInputLocal(feira.dataInicio), fim: isoParaInputLocal(feira.dataFim),
        }
      : VAZIO,
  );
  const [animais, setAnimais] = useState([]);
  const [salvando, setSalvando] = useState(false);
  const m = useMensagem();
  const set = (c) => (e) => setF({ ...f, [c]: e.target.value });

  async function buscarEndereco() {
    const r = await tentar(m, () => geocodificar(f.endereco));
    if (r && r !== true) setF({ ...f, latitude: String(r.latitude), longitude: String(r.longitude) });
  }

  function usarMinhaPosicao() {
    m.limpar();
    if (!navigator.geolocation) return m.erro('Seu navegador não oferece geolocalização.');
    navigator.geolocation.getCurrentPosition(
      (p) => setF((atual) => ({ ...atual, latitude: String(p.coords.latitude), longitude: String(p.coords.longitude) })),
      () => m.erro('Permissão de localização negada.'),
      { timeout: 8000 },
    );
  }

  async function enviar(e) {
    e.preventDefault();
    const dataInicio = inputLocalParaIso(f.inicio);
    const dataFim = inputLocalParaIso(f.fim);
    if (!dataInicio || !dataFim) return m.erro('Informe as datas de início e fim.');
    if (f.latitude === '' || f.longitude === '') return m.erro('Informe latitude e longitude (ou busque pelo endereço).');

    const dados = {
      nome: f.nome.trim(), endereco: f.endereco.trim(),
      latitude: Number(f.latitude), longitude: Number(f.longitude), dataInicio, dataFim,
    };
    if (f.descricao.trim()) dados.descricao = f.descricao.trim();

    setSalvando(true);
    const ok = await tentar(m, () => (feira ? api.atualizarFeira(feira._id, dados) : api.criarFeira({ ...dados, animais })));
    setSalvando(false);
    if (ok) {
      if (!feira) { setF(VAZIO); setAnimais([]); }
      aoSalvar(feira ? 'Feira atualizada!' : 'Feira cadastrada!');
    }
  }

  return (
    <form className="cartao form-grade" onSubmit={enviar}>
      <h2>{feira ? `Editar ${feira.nome}` : 'Cadastrar feira de adoção'}</h2>
      <label>Nome da feira<input value={f.nome} onChange={set('nome')} required minLength={2} maxLength={100} /></label>
      <label>Endereço<input value={f.endereco} onChange={set('endereco')} required minLength={3} maxLength={200} placeholder="Parque Barigui, Curitiba" /></label>
      <div className="acoes largo">
        <button type="button" className="secundario" onClick={buscarEndereco} disabled={f.endereco.trim().length < 3}>Buscar pelo endereço</button>
        <button type="button" className="secundario" onClick={usarMinhaPosicao}>Usar minha posição</button>
      </div>
      <label>Latitude<input type="number" step="any" min="-90" max="90" value={f.latitude} onChange={set('latitude')} required /></label>
      <label>Longitude<input type="number" step="any" min="-180" max="180" value={f.longitude} onChange={set('longitude')} required /></label>
      <label>Início<input type="datetime-local" value={f.inicio} onChange={set('inicio')} required /></label>
      <label>Fim<input type="datetime-local" value={f.fim} onChange={set('fim')} required /></label>
      <label className="largo">Descrição<textarea value={f.descricao} onChange={set('descricao')} maxLength={500} rows={2} /></label>
      {!feira && <div className="largo"><SeletorAnimais selecionados={animais} onChange={setAnimais} /></div>}
      <Mensagem msg={m.msg} />
      <div className="acoes largo">
        <button className="primario" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</button>
        <button type="button" className="secundario" onClick={aoCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
