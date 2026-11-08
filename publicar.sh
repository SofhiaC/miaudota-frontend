#!/usr/bin/env bash
# Constrói e publica a imagem do frontend no Docker Hub (rode "docker login" antes).
# Uso: ./publicar.sh   (a imagem aponta para o gateway definido em VITE_API_URL / .env.production)
set -euo pipefail
cd "$(dirname "$0")"
IMAGEM="sofhiachromiec/pjbl-frontend:v1"
URL="${VITE_API_URL:-$(grep -E '^VITE_API_URL=' .env.production | cut -d= -f2-)}"
docker build --platform linux/amd64 --build-arg "VITE_API_URL=${URL}" -t "$IMAGEM" .
docker push "$IMAGEM"
echo "Publicado: $IMAGEM"
