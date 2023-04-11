FROM --platform=linux/amd64 node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3004
CMD [ "node", "server.mjs" ]
