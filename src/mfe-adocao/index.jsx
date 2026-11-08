import Descobrir from './Descobrir.jsx';
import Favoritos from './Favoritos.jsx';
import Pedidos from './Pedidos.jsx';
import MeusAnimais from './MeusAnimais.jsx';

/**
 * Microfrontend ADOÇÃO (descobrir animais, favoritos, pedidos e meus animais).
 * Contrato com o shell, só por props: { pagina, usuario }.
 */
export default function MfeAdocao({ pagina, usuario }) {
  switch (pagina) {
    case 'descobrir': return <Descobrir />;
    case 'favoritos': return <Favoritos />;
    case 'pedidos': return <Pedidos usuario={usuario} />;
    case 'meus-animais': return <MeusAnimais />;
    default: return null;
  }
}
