FROM node

RUN mkdir -p /usr/src/grofar-backend
WORKDIR /usr/src/grofar-backend

COPY package*.json ./

RUN npm install

COPY . .

CMD ./scripts/wait-for.sh db:3306 -- npm start
