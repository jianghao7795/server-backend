FROM docker.io/library/node:22 AS builder

LABEL org.opencontainers.image.authors="jianghao"

WORKDIR /app/
COPY . /app/
# COPY ./node_modules /app/

RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g pnpm
RUN pnpm config set registry https://registry.npmmirror.com
RUN pnpm install
RUN pnpm run build

FROM docker.io/library/nginx:stable
LABEL org.opencontainers.image.authors="jianghao"

# COPY ./conf.d/nginx.conf /etc/nginx/nginx.conf
# COPY ./conf.d/config.conf /etc/nginx/conf.d/config.conf
# COPY --from=builder /backend/dist /usr/share/nginx/html/backend
# RUN ls -al /usr/share/nginx/html

RUN rm -rf /usr/share/nginx/html/* && mkdir -p /usr/share/nginx/html/backend
COPY --from=builder /app/dist /usr/share/nginx/html/backend
COPY ./conf.d/config.conf /etc/nginx/conf.d/default.conf
COPY ./conf.d/nginx.conf /etc/nginx/nginx.conf