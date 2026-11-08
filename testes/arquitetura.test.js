// Testes de arquitetura do frontend: garantem as fronteiras entre shell, microfrontends e código compartilhado,
// e que só um módulo fala com o backend (o API Gateway).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');
const MFES = ['mfe-conta', 'mfe-adocao', 'mfe-feiras'];

function arquivos(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = path.join(dir, nome);
    if (statSync(caminho).isDirectory()) return arquivos(caminho);
    return /\.(jsx?|mjs)$/.test(nome) ? [caminho] : [];
  });
}

/** Pasta de primeiro nível dentro de src a que um caminho pertence (ex.: "mfe-conta", "shell"). */
const modulo = (caminho) => path.relative(SRC, caminho).split(path.sep)[0];

function importsRelativos(arquivo) {
  const codigo = readFileSync(arquivo, 'utf8');
  const especificadores = [...codigo.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g)].map((m) => m[1]);
  return especificadores
    .filter((e) => e.startsWith('.'))
    .map((e) => path.resolve(path.dirname(arquivo), e));
}

test('cada microfrontend existe e expõe um index.jsx', () => {
  for (const mfe of MFES) assert.ok(existsSync(path.join(SRC, mfe, 'index.jsx')), `${mfe}/index.jsx não encontrado`);
});

test('microfrontends não importam uns aos outros nem o shell (só o código compartilhado)', () => {
  for (const mfe of MFES) {
    for (const arquivo of arquivos(path.join(SRC, mfe))) {
      for (const alvo of importsRelativos(arquivo)) {
        const destino = modulo(alvo);
        assert.ok(
          destino === mfe || destino === 'compartilhado',
          `${path.relative(SRC, arquivo)} importa "${destino}", mas só pode usar o próprio módulo e "compartilhado"`,
        );
      }
    }
  }
});

test('o código compartilhado não depende de microfrontends nem do shell', () => {
  for (const arquivo of arquivos(path.join(SRC, 'compartilhado'))) {
    for (const alvo of importsRelativos(arquivo)) {
      assert.equal(modulo(alvo), 'compartilhado', `${path.relative(SRC, arquivo)} importa "${modulo(alvo)}"`);
    }
  }
});

test('só api.js (gateway) e geocodificar.js (mapas externos) usam fetch', () => {
  const permitidos = new Set(['compartilhado/api.js', 'compartilhado/geocodificar.js']);
  for (const arquivo of arquivos(SRC)) {
    const rel = path.relative(SRC, arquivo).split(path.sep).join('/');
    if (permitidos.has(rel)) continue;
    assert.ok(!/\bfetch\s*\(/.test(readFileSync(arquivo, 'utf8')), `${rel} chama fetch diretamente; use compartilhado/api.js`);
  }
});

test('o frontend não conhece o endereço de nenhum microsserviço (só o do gateway)', () => {
  for (const arquivo of arquivos(SRC)) {
    const codigo = readFileSync(arquivo, 'utf8');
    for (const proibido of ['miaudota-usuarios', 'miaudota-adocao', 'miaudota-geolocalizacao', 'miaudota-bff']) {
      assert.ok(!codigo.includes(proibido), `${path.relative(SRC, arquivo)} cita ${proibido}`);
    }
  }
});
