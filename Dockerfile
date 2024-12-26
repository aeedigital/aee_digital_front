# Etapa de build
FROM node:18-alpine AS builder

# Argumento para a URL da API
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Diretório de trabalho no container
WORKDIR /app

# Copiar os arquivos necessários
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.mjs ./

# Instalar dependências
RUN npm install

# Copiar o restante do código
COPY . .

# Construir a aplicação Next.js
RUN npm run build

# Etapa de produção
FROM node:18-alpine AS runner

# Instalar o curl
RUN apk add --no-cache curl

# Diretório de trabalho no container
WORKDIR /app

# Copiar arquivos da etapa de build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./

# Instalar apenas as dependências de produção
RUN npm install --production

# Expor a porta padrão do Next.js
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
