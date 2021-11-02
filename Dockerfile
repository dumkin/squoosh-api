FROM node:lts-alpine AS build-env
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./app.js ./app.js

EXPOSE 1041

ENTRYPOINT ["node", "app.js"]