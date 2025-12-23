FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache nginx && \
    mkdir -p /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
EXPOSE 8008
CMD sh -c "npm ci && npm run build && cp -r dist/* /usr/share/nginx/html/ && nginx -g 'daemon off;'"
