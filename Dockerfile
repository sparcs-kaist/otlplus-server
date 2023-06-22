FROM node:18

ENV NODE_ENV=dev

RUN mkdir -p /var/www/otlplus-server
WORKDIR /var/www/otlplus-server

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run prisma-generate
RUN npm run build

EXPOSE 3000
CMD [ "node", "dist/src/bootstrap/bootstrap.js" ]
