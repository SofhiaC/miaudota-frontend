import Login from './Login.jsx';
import Perfil from './Perfil.jsx';

/**
 * Microfrontend CONTA (login, cadastro e perfil).
 * Contrato com o shell, só por props: { pagina, usuario, onEntrar, onSair }.
 */
export default function MfeConta({ pagina, usuario, onEntrar, onSair }) {
  if (pagina === 'perfil') return <Perfil usuario={usuario} onSair={onSair} />;
  return <Login onEntrar={onEntrar} />;
}
