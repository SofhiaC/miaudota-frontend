# ---- etapa 1: compila o React (Vite) ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
# A URL do gateway é gravada no bundle em tempo de build (variáveis VITE_* não existem em runtime).
ARG VITE_API_URL=https://miaudota-gateway.proudground-4968a7f1.canadacentral.azurecontainerapps.io
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- etapa 2: serve os arquivos estáticos com nginx ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ >/dev/null || exit 1
