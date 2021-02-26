FROM node:12-alpine

RUN apk update && \
    apk add git

WORKDIR /app

RUN git clone https://github.com/LiveChurchSolutions/B1App.git .

RUN git submodule init && git submodule update

RUN npm install --global expo-cli

RUN npm install

CMD npm run $ENVIRONMENT

EXPOSE 19000 19001 19002 19003 19004 19005 19006
