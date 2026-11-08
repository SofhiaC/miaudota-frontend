import { api } from '../compartilhado/api.js';
import { useCarregar } from '../compartilhado/componentes.jsx';
import { capitalizar } from '../compartilhado/util.js';

/** Lista os animais disponíveis da ONG e deixa marcar quais vão para a feira. */
export default function SeletorAnimais({ selecionados, onChange }) {
  const { dados, carregando } = useCarregar(async () => (await api.meusAnimais()).filter((a) => a.disponivel));

  if (carregando) return <p className="muted">Carregando seus animais…</p>;
  if (!dados?.length) return <p className="muted">Você não tem animais disponíveis para levar à feira.</p>;

  const alternar = (id) => onChange(selecionados.includes(id) ? selecionados.filter((x) => x !== id) : [...selecionados, id]);

  return (
    <fieldset className="seletor">
      <legend>Animais que você levará</legend>
      {dados.map((a) => (
        <label className="check" key={a._id}>
          <input type="checkbox" checked={selecionados.includes(a._id)} onChange={() => alternar(a._id)} />
          {a.nome} ({capitalizar(a.especie)})
        </label>
      ))}
    </fieldset>
  );
}
