import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../compartilhado/api.js';
import { Mensagem, useMensagem } from '../compartilhado/componentes.jsx';
import { capitalizar, emojiDaEspecie, montarFila, rotuloIdade } from '../compartilhado/util.js';

// Animais que a pessoa pulou nesta sessão (voltam quando ela busca de novo).
const pulados = new Set();
const LIMITE = 110; // pixels de arrasto para valer como curtir/pular

/** Cartão que acompanha o mouse/dedo: direita = curtir, esquerda = pular. Os botões fazem o mesmo. */
function Cartao({ animal, onCurtir, onPular, onSolicitar }) {
  const [dx, setDx] = useState(0);
  const [arrastando, setArrastando] = useState(false);
  const [saindo, setSaindo] = useState(0);
  const inicio = useRef(null);

  const sair = (direcao, depois) => {
    setSaindo(direcao);
    setTimeout(depois, 220);
  };

  function aoPressionar(e) {
    if (e.target.closest('button')) return; // clique em botão não inicia arrasto
    inicio.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
    setArrastando(true);
  }
  function aoMover(e) {
    if (inicio.current != null) setDx(e.clientX - inicio.current);
  }
  function aoSoltar() {
    if (inicio.current == null) return;
    inicio.current = null;
    setArrastando(false);
    if (dx > LIMITE) sair(1, onCurtir);
    else if (dx < -LIMITE) sair(-1, onPular);
    else setDx(0);
  }

  const x = saindo ? saindo * 700 : dx;
  const estilo = {
    transform: `translateX(${x}px) rotate(${x / 14}deg)`,
    transition: arrastando ? 'none' : 'transform 0.22s ease',
  };

  return (
    <article
      className="cartao-animal"
      style={estilo}
      onPointerDown={aoPressionar}
      onPointerMove={aoMover}
      onPointerUp={aoSoltar}
      onPointerCancel={aoSoltar}
    >
      <div className="foto" aria-hidden="true">{emojiDaEspecie(animal.especie)}</div>
      <span className="selo-gesto curtir" style={{ opacity: Math.min(Math.max(dx / LIMITE, 0), 1) }}>♥</span>
      <span className="selo-gesto pular" style={{ opacity: Math.min(Math.max(-dx / LIMITE, 0), 1) }}>✕</span>
      <div className="painel-animal">
        <h2>{animal.nome}</h2>
        <p className="linha2">{capitalizar(animal.especie)} · {rotuloIdade(animal.idade)}</p>
        {animal.descricao && <p className="descricao">{animal.descricao}</p>}
        <div className="botoes-redondos">
          <button className="redondo curtir" aria-label="Curtir" title="Curtir (→)" onClick={() => sair(1, onCurtir)}>♥</button>
          <button className="redondo" aria-label="Solicitar adoção" title="Solicitar adoção" onClick={onSolicitar}>✉</button>
          <button className="redondo pular" aria-label="Pular" title="Pular (←)" onClick={() => sair(-1, onPular)}>✕</button>
        </div>
      </div>
    </article>
  );
}

export default function Descobrir() {
  const m = useMensagem();
  const [fila, setFila] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const topoRef = useRef(null);

  const carregar = useCallback(async (limpar = false) => {
    if (limpar) pulados.clear();
    setCarregando(true);
    try {
      const [sug, todos, fav, env] = await Promise.all([api.sugestoes(), api.animais(), api.favoritos(), api.enviadas()]);
      setFila(montarFila(sug, todos, fav, env, pulados));
    } catch (e) {
      m.erro(e.message);
    }
    setCarregando(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const tirar = (animal) => setFila((f) => f.filter((a) => a._id !== animal._id));

  function curtir(animal) {
    tirar(animal);
    api.curtir(animal._id).catch((e) => {
      m.erro(`Não foi possível curtir: ${e.message}`);
      setFila((f) => [...f, animal]); // devolve para o fim da pilha
    });
  }
  function pular(animal) {
    pulados.add(animal._id);
    tirar(animal);
  }
  async function solicitar(animal) {
    if (!window.confirm(`Solicitar a adoção de ${animal.nome}?\n\nQuem cuida dele será avisado e poderá aprovar ou recusar o pedido.`)) return;
    m.limpar();
    try {
      await api.solicitar(animal._id);
      tirar(animal);
      m.ok(`Pedido enviado! Acompanhe a resposta em "Pedidos".`);
    } catch (e) {
      m.erro(e.message);
    }
  }

  const topo = fila[0];
  topoRef.current = topo;

  // atalhos de teclado: → curtir, ← pular
  useEffect(() => {
    function aoTeclar(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || !topoRef.current) return;
      if (e.key === 'ArrowRight') curtir(topoRef.current);
      if (e.key === 'ArrowLeft') pular(topoRef.current);
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  return (
    <>
      <h1>Descobrir animais</h1>
      <p className="muted">Arraste o cartão para a direita para curtir e para a esquerda para pular. Também funciona com os botões e com as setas do teclado.</p>
      <Mensagem msg={m.msg} />

      {topo ? (
        <div className="pilha">
          {fila.length > 1 && <div className="cartao-de-tras" />}
          <Cartao
            key={topo._id}
            animal={topo}
            onCurtir={() => curtir(topo)}
            onPular={() => pular(topo)}
            onSolicitar={() => solicitar(topo)}
          />
          <p className="muted centro restantes">{fila.length} {fila.length === 1 ? 'animal' : 'animais'} na pilha</p>
        </div>
      ) : (
        <div className="sem-animais">
          <button className="lupa" onClick={() => carregar(true)} disabled={carregando} aria-label="Buscar animais">🔍</button>
          <p>{carregando ? 'Procurando novos amigos…' : 'Por enquanto é só! Clique na lupa para buscar de novo.'}</p>
        </div>
      )}
    </>
  );
}
