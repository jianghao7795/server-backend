FROM node:20.18.1-bullseye-slim AS builder

LABEL org.opencontainers.image.authors="jianghao"

WORKDIR /backend/
COPY . /backend/
# COPY ./node_modules /backend/

RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g pnpm
RUN pnpm config set registry https://registry.npmmirror.com
RUN pnpm install
RUN pnpm run build

FROM nginx:stable
LABEL org.opencontainers.image.authors="jianghao"

COPY ./conf.d/nginx.conf /etc/nginx/nginx.conf
COPY ./conf.d/config.conf /etc/nginx/conf.d/config.conf
COPY --from=builder /backend/dist /usr/share/nginx/html/backend
RUN ls -al /usr/share/nginx/html
