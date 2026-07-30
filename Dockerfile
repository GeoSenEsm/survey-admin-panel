FROM node:20-alpine AS build
WORKDIR /usr/local/app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build


FROM nginx:1.27-alpine
COPY --from=build /usr/local/app/dist/survey-admin-panel/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
RUN rm /etc/nginx/conf.d/default.conf
COPY start-admin-panel.sh /docker-entrypoint.d/start-admin-panel.sh
RUN chmod +x /docker-entrypoint.d/start-admin-panel.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.d/start-admin-panel.sh"]
