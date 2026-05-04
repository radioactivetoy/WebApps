FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG BASE_PATH=/circle-of-fifths/
RUN npm run build -- --base=${BASE_PATH}

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# SPA fallback so refreshing a deep URL doesn't 404
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' \
    > /etc/nginx/conf.d/default.conf
EXPOSE 80
