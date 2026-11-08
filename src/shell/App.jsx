import { Suspense, lazy } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { Carregando } from '../compartilhado/componentes.jsx';
import { useAuth } from './auth.jsx';
import Painel from './Painel.jsx';

// Cada microfrontend é um módulo independente carregado sob demanda (um bundle separado por MFE).
const MfeConta = lazy(() => import('../mfe-conta/index.jsx'));
const MfeAdocao = lazy(() => import('../mfe-adocao/index.jsx'));
const MfeFeiras = lazy(() => import('../mfe-feiras/index.jsx'));

// Mesmas abas do app: ONG não adota, então não tem Descobrir nem Favoritos.
const ABAS = [
  { para: '/', rotulo: 'Painel', fim: true },
  { para: '/descobrir', rotulo: 'Descobrir', so: 'PESSOA' },
  { para: '/favoritos', rotulo: 'Favoritos', so: 'PESSOA' },
  { para: '/pedidos', rotulo: 'Pedidos' },
  { para: '/feiras', rotulo: 'Feiras' },
  { para: '/meus-animais', rotulo: 'Meus animais' },
];

function Cabecalho() {
  const { usuario } = useAuth();
  const link = ({ isActive }) => (isActive ? 'ativo' : undefined);
  return (
    <header className="cabecalho">
      <span className="logo">🐾 miaudota</span>
      <nav aria-label="Principal">
        {ABAS.filter((a) => !a.so || a.so === usuario.tipo).map((a) => (
          <NavLink key={a.para} to={a.para} end={a.fim} className={link}>{a.rotulo}</NavLink>
        ))}
      </nav>
      <NavLink to="/perfil" className={({ isActive }) => `perfil-link${isActive ? ' ativo' : ''}`}>
        {usuario.nome} <small>({usuario.tipo === 'ONG' ? 'ONG' : 'Pessoa'})</small>
      </NavLink>
    </header>
  );
}

function Privada({ so, children }) {
  const { logado, usuario } = useAuth();
  if (!logado) return <Navigate to="/login" replace />;
  if (so && usuario.tipo !== so) return <Navigate to="/" replace />;
  return (
    <>
      <Cabecalho />
      <main className="conteudo"><Suspense fallback={<Carregando />}>{children}</Suspense></main>
    </>
  );
}

export default function App() {
  const { logado, usuario, entrar, sair } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={logado ? <Navigate to="/" replace /> : <Suspense fallback={<Carregando />}><MfeConta pagina="login" onEntrar={entrar} /></Suspense>}
      />
      <Route path="/" element={<Privada><Painel /></Privada>} />
      <Route path="/descobrir" element={<Privada so="PESSOA"><MfeAdocao pagina="descobrir" usuario={usuario} /></Privada>} />
      <Route path="/favoritos" element={<Privada so="PESSOA"><MfeAdocao pagina="favoritos" usuario={usuario} /></Privada>} />
      <Route path="/pedidos" element={<Privada><MfeAdocao pagina="pedidos" usuario={usuario} /></Privada>} />
      <Route path="/meus-animais" element={<Privada><MfeAdocao pagina="meus-animais" usuario={usuario} /></Privada>} />
      <Route path="/feiras" element={<Privada><MfeFeiras usuario={usuario} /></Privada>} />
      <Route path="/perfil" element={<Privada><MfeConta pagina="perfil" usuario={usuario} onSair={sair} /></Privada>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
