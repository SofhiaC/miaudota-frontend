import { useState } from 'react';
import { api } from '../compartilhado/api.js';
import { Aviso, Carregando, Mensagem, Vazio, tentar, useCarregar, useMensagem } from '../compartilhado/componentes.jsx';
import { capitalizar, emojiDaEspecie, rotuloIdade } from '../compartilhado/util.js';

const VAZIO = { nome: '', especie: '', idade: 0, descricao: '' };

/** Formulário usado para cadastrar e para editar (quando `animal` vem preenchido). */
function FormAnimal({ animal, aoSalvar, aoCancelar }) {
  const [f, setF] = useState(animal ? { nome: animal.nome, especie: animal.especie, idade: animal.idade, descricao: animal.descricao || '' } : VAZIO);
  const m = useMensagem();
  const [salvando, setSalvando] = useState(false);
  const set = (c) => (e) => setF({ ...f, [c]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setSalvando(true);
    const dados = { nome: f.nome.trim(), especie: f.especie.trim(), idade: Number(f.idade) };
    if (f.descricao.trim()) dados.descricao = f.descricao.trim();
    const ok = await tentar(m, () => (animal ? api.atualizarAnimal(animal._id, dados) : api.criarAnimal(dados)));
    setSalvando(false);
    if (ok) {
      if (!animal) setF(VAZIO);
      aoSalvar(animal ? 'Animal atualizado!' : 'Animal cadastrado!');
    }
  }

  return (
    <form className="cartao form-grade" onSubmit={enviar}>
      <h2>{animal ? `Editar ${animal.nome}` : 'Cadastrar animal'}</h2>
      <label>Nome<input value={f.nome} onChange={set('nome')} required maxLength={60} /></label>
      <label>Espécie<input value={f.especie} onChange={set('especie')} required minLength={2} maxLength={40} placeholder="cachorro, gato…" /></label>
      <label>Idade (anos)<input type="number" min="0" max="40" value={f.idade} onChange={set('idade')} required placeholder="0 se tiver menos de 1 ano" /></label>
      <label className="largo">Descrição<textarea value={f.descricao} onChange={set('descricao')} maxLength={500} rows={2} /></label>
      <Mensagem msg={m.msg} />
      <div className="acoes largo">
        <button className="primario" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</button>
        <button type="button" className="secundario" onClick={aoCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

export default function MeusAnimais() {
  const m = useMensagem();
  const { dados, erro, carregando, recarregar } = useCarregar(() => api.meusAnimais());
  const [cadastrando, setCadastrando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  function salvou(texto) {
    setCadastrando(false);
    setEditandoId(null);
    m.ok(texto);
    recarregar();
  }
  async function excluir(a) {
    if (!window.confirm(`Excluir ${a.nome}?`)) return;
    if (await tentar(m, () => api.excluirAnimal(a._id), `${a.nome} foi excluído.`)) recarregar();
  }

  return (
    <>
      <div className="titulo-linha">
        <h1>Meus animais</h1>
        {!cadastrando && <button className="primario" onClick={() => { setCadastrando(true); setEditandoId(null); }}>Cadastrar animal</button>}
      </div>
      {cadastrando && <FormAnimal aoSalvar={salvou} aoCancelar={() => setCadastrando(false)} />}

      <Mensagem msg={m.msg} />
      {carregando && <Carregando />}
      <Aviso>{erro}</Aviso>
      {dados && !dados.length && <Vazio>Você ainda não cadastrou nenhum animal.</Vazio>}

      <div className="grade">
        {!carregando && dados?.map((a) => (
          editandoId === a._id ? (
            <FormAnimal key={a._id} animal={a} aoSalvar={salvou} aoCancelar={() => setEditandoId(null)} />
          ) : (
            <article className="cartao animal" key={a._id}>
              <div className="mini-foto" aria-hidden="true">{emojiDaEspecie(a.especie)}</div>
              <h2>{a.nome}</h2>
              <p className="muted">{capitalizar(a.especie)} · {rotuloIdade(a.idade)}</p>
              {a.descricao && <p>{a.descricao}</p>}
              <span className={`selo ${a.disponivel ? 'ok' : ''}`}>{a.disponivel ? 'Disponível' : 'Adotado'}</span>
              {a.disponivel && (
                <div className="acoes">
                  <button className="secundario" onClick={() => { setEditandoId(a._id); setCadastrando(false); }}>Editar</button>
                  <button className="perigo" onClick={() => excluir(a)}>Excluir</button>
                </div>
              )}
            </article>
          )
        ))}
      </div>
    </>
  );
}
