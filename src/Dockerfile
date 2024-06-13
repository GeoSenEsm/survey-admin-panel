FROM node:latest as build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod

FROM nginx:latest
COPY --from=build /app/dist/SurveyAdminPanel /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]