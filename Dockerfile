FROM node:latest as build
WORKDIR /usr/local/app
COPY ./ /usr/local/app
RUN npm install --force
RUN npm run build --prod


FROM nginx:latest
COPY --from=build /usr/local/app/dist/survey-admin-panel/browser /usr/share/nginx/html
COPY start-admin-panel.sh /docker-entrypoint.d/start-admin-panel.sh
RUN chmod +x /docker-entrypoint.d/start-admin-panel.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.d/start-admin-panel.sh", "&&", "nginx", "-g", "'daemon off;'"]