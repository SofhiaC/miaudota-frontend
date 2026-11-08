import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  capitalizar, emojiDaEspecie, fmtData, inputLocalParaIso, isoParaInputLocal,
  montarFila, rotuloIdade, sessaoValida,
} from '../src/compartilhado/util.js';

test('capitalizar põe a primeira letra em maiúscula e aceita vazio', () => {
  assert.equal(capitalizar('cachorro'), 'Cachorro');
  assert.equal(capitalizar(''), '');
  assert.equal(capitalizar(), '');
});

test('rotuloIdade trata 0, 1 e vários anos', () => {
  assert.equal(rotuloIdade(0), 'menos de 1 ano');
  assert.equal(rotuloIdade(1), '1 ano');
  assert.equal(rotuloIdade(5), '5 anos');
});

test('fmtData formata no padrão brasileiro e protege contra data inválida', () => {
  assert.equal(fmtData(new Date(2026, 2, 12, 9, 5).toISOString()), '12/03/2026 09:05');
  assert.equal(fmtData(undefined), '—');
  assert.equal(fmtData('nao-e-data'), '—');
});

test('data do input datetime-local vai e volta sem mudar', () => {
  const iso = inputLocalParaIso('2026-12-05T09:00');
  assert.equal(iso, new Date(2026, 11, 5, 9, 0).toISOString());
  assert.equal(isoParaInputLocal(iso), '2026-12-05T09:00');
  assert.equal(inputLocalParaIso(''), null);
  assert.equal(inputLocalParaIso('lixo'), null);
  assert.equal(isoParaInputLocal('lixo'), '');
});

test('emojiDaEspecie reconhece espécies comuns e usa patinha como padrão', () => {
  assert.equal(emojiDaEspecie('Cachorro'), '🐶');
  assert.equal(emojiDaEspecie('gato'), '🐱');
  assert.equal(emojiDaEspecie('coelho'), '🐰');
  assert.equal(emojiDaEspecie('jabuti'), '🐾');
  assert.equal(emojiDaEspecie(), '🐾');
});

test('montarFila: sugestões primeiro, sem repetir e sem favoritos, pedidos ou pulados', () => {
  const a = (id) => ({ _id: id, nome: id });
  const fila = montarFila(
    [a('s1'), a('s2')],
    [a('s2'), a('t1'), a('t2'), a('t3'), a('t4')],
    [a('t1')], // favoritado
    [{ id_animal: 't2' }], // já pediu a adoção
    new Set(['t3']), // pulado nesta sessão
  );
  assert.deepEqual(fila.map((x) => x._id), ['s1', 's2', 't4']);
});

test('montarFila aceita listas vazias', () => {
  assert.deepEqual(montarFila(), []);
});

test('sessaoValida exige token e usuário com tipo', () => {
  assert.equal(sessaoValida({ token: 'x', usuario: { tipo: 'ONG' } }), true);
  assert.equal(sessaoValida({ token: 'x', usuario: {} }), false);
  assert.equal(sessaoValida({ usuario: { tipo: 'PESSOA' } }), false);
  assert.equal(sessaoValida(null), false);
});
