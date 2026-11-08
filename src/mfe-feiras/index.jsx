import Feiras from './Feiras.jsx';

/**
 * Microfrontend FEIRAS (lista, mapa e gestão de feiras pela ONG).
 * Contrato com o shell, só por props: { usuario }.
 */
export default function MfeFeiras({ usuario }) {
  return <Feiras usuario={usuario} />;
}
