# ── Build: CircleOf5ths ──────────────────────────────────
FROM node:22-alpine AS build-circle-of-fifths
WORKDIR /app
COPY CircleOf5ths/package*.json ./
RUN npm ci
COPY CircleOf5ths/ .
RUN npm run build -- --base=/circle-of-fifths/

# ── Add more apps here (copy the block above and adjust) ──
# FROM node:22-alpine AS build-my-new-app
# WORKDIR /app
# COPY MyNewApp/package*.json ./
# RUN npm ci
# COPY MyNewApp/ .
# RUN npm run build -- --base=/my-new-app/

# ── Serve everything ──────────────────────────────────────
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY --from=build-circle-of-fifths /app/dist /usr/share/nginx/html/circle-of-fifths
# COPY --from=build-my-new-app      /app/dist /usr/share/nginx/html/my-new-app
EXPOSE 80
