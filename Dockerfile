FROM node:18.20.4 AS builder

LABEL org.opencontainers.image.authors="jianghao"

WORKDIR /backend/
COPY . /backend/

RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g pnpm
RUN pnpm config set registry https://registry.npmmirror.com
RUN pnpm install
RUN pnpm run build

FROM nginx
LABEL org.opencontainers.image.authors="jianghao"

COPY ./conf.d/my.conf /etc/nginx/conf.d/my.conf
COPY --from=builder /backend/dist /usr/share/nginx/html/backend
RUN ls -al /usr/share/nginx/html
