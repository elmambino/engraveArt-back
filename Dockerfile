FROM docker.io/library/node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install

EXPOSE 8182

CMD ["node", "index.js"]
