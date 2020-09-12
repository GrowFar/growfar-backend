FROM node

RUN rm -f /etc/localtime && ln -s /usr/share/zoneinfo/Asia/Jakarta /etc/localtime

RUN mkdir -p /usr/src/grofar-backend

WORKDIR /usr/src/grofar-backend

COPY package*.json ./

RUN npm install

RUN npm install -g sequelize-cli

COPY . .

CMD ./scripts/wait-for.sh db:3306 -- npm start
