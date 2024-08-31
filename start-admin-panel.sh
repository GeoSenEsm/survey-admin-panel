#!/bin/sh

API_URL=${API_URL:-http://localhost:8080}
sed -i "s|http://localhost:8080|$API_URL|g" /usr/share/nginx/html/assets/config/config.json
nginx -g 'daemon off;'