// Funções puras (sem React e sem rede), compartilhadas pelos microfrontends e cobertas por testes unitários.

export const capitalizar = (t = '') => t.charAt(0).toUpperCase() + t.slice(1);

export function rotuloIdade(idade) {
  if (idade === 0) return 'menos de 1 ano';
  return idade === 1 ? '1 ano' : `${idade} anos`;
}

const dois = (n) => String(n).padStart(2, '0');

/** 12/03/2026 12:00 (horário local). Data inválida vira "—". */
export function fmtData(d) {
  if (!d) return '—';
  const x = new Date(d);
  if (isNaN(x.getTime())) return '—';
  return `${dois(x.getDate())}/${dois(x.getMonth() + 1)}/${x.getFullYear()} ${dois(x.getHours())}:${dois(x.getMinutes())}`;
}

/** Valor de <input type="datetime-local"> (horário local) -> ISO em UTC, ou null se vazio/inválido. */
export function inputLocalParaIso(valor) {
  if (!valor) return null;
  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/** ISO -> valor de <input type="datetime-local"> (para editar uma feira existente). */
export function isoParaInputLocal(iso) {
  const x = new Date(iso);
  if (isNaN(x.getTime())) return '';
  return `${x.getFullYear()}-${dois(x.getMonth() + 1)}-${dois(x.getDate())}T${dois(x.getHours())}:${dois(x.getMinutes())}`;
}

/** Ilustração simples por espécie (o sistema ainda não guarda fotos). */
export function emojiDaEspecie(especie = '') {
  const s = especie.toLowerCase();
  if (/cachorr|cao|cão|cadel|cãozinho/.test(s)) return '🐶';
  if (/gat/.test(s)) return '🐱';
  if (/coelh/.test(s)) return '🐰';
  if (/passar|ave|papag|calop/.test(s)) return '🦜';
  if (/hamster|roedor|porquinho/.test(s)) return '🐹';
  return '🐾';
}

export const STATUS_PEDIDO = { PENDENTE: 'Aguardando retorno', APROVADA: 'Aprovada', RECUSADA: 'Recusada' };

/**
 * Pilha de animais da tela Descobrir: sugestões primeiro, depois os demais, sem repetir e sem incluir
 * quem já foi favoritado, já recebeu pedido ou foi pulado nesta sessão.
 */
export function montarFila(sugestoes = [], todos = [], favoritos = [], enviadas = [], pulados = new Set()) {
  const fora = new Set([...favoritos.map((a) => a._id), ...enviadas.map((s) => s.id_animal), ...pulados]);
  const vistos = new Set();
  return [...sugestoes, ...todos].filter((a) => {
    if (!a || fora.has(a._id) || vistos.has(a._id)) return false;
    vistos.add(a._id);
    return true;
  });
}

/** Resposta de login/cadastro só vale se trouxer token e usuário com tipo. */
export const sessaoValida = (r) => !!(r && r.token && r.usuario && r.usuario.tipo);
