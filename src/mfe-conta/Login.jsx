import { useState } from 'react';
import { api } from '../compartilhado/api.js';
import { Aviso } from '../compartilhado/componentes.jsx';

export default function Login({ onEntrar }) {
  const [cadastro, setCadastro] = useState(false);
  const [f, setF] = useState({ nome: '', email: '', senha: '', tipo: 'PESSOA', consentimentoLgpd: false });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const set = (campo) => (e) =>
    setF({ ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const resposta = cadastro
        ? await api.cadastrar({ nome: f.nome, email: f.email, senha: f.senha, tipo: f.tipo, consentimentoLgpd: f.consentimentoLgpd })
        : await api.login(f.email, f.senha);
      onEntrar(resposta);
    } catch (err) {
      setErro(err.message);
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <form className="cartao login-form" onSubmit={enviar}>
        <h1 className="logo grande">🐾 miaudota</h1>
        <p className="muted centro">Encontre um novo amigo para chamar de seu.</p>

        <div className="abas">
          <button type="button" className={!cadastro ? 'aba ativa' : 'aba'} onClick={() => setCadastro(false)}>Entrar</button>
          <button type="button" className={cadastro ? 'aba ativa' : 'aba'} onClick={() => setCadastro(true)}>Criar conta</button>
        </div>

        {cadastro && (
          <label>Nome<input value={f.nome} onChange={set('nome')} required minLength={2} maxLength={100} autoComplete="name" /></label>
        )}
        <label>E-mail<input type="email" value={f.email} onChange={set('email')} required autoComplete="email" /></label>
        <label>Senha
          <input
            type="password" value={f.senha} onChange={set('senha')} required
            minLength={cadastro ? 8 : 1} maxLength={72}
            placeholder={cadastro ? 'mínimo de 8 caracteres' : ''}
            autoComplete={cadastro ? 'new-password' : 'current-password'}
          />
        </label>

        {cadastro && (
          <>
            <div className="grupo">
              <span className="rotulo">Quem é você?</span>
              <div className="abas">
                <button type="button" className={f.tipo === 'PESSOA' ? 'aba ativa' : 'aba'} onClick={() => setF({ ...f, tipo: 'PESSOA' })}>Pessoa</button>
                <button type="button" className={f.tipo === 'ONG' ? 'aba ativa' : 'aba'} onClick={() => setF({ ...f, tipo: 'ONG' })}>ONG</button>
              </div>
            </div>
            <label className="check">
              <input type="checkbox" checked={f.consentimentoLgpd} onChange={set('consentimentoLgpd')} required />
              Concordo com o tratamento dos meus dados pessoais conforme a LGPD
            </label>
          </>
        )}

        <Aviso>{erro}</Aviso>
        <button className="primario" disabled={enviando}>{enviando ? 'Aguarde…' : cadastro ? 'Cadastrar' : 'Entrar'}</button>
      </form>
    </div>
  );
}
