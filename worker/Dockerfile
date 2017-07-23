
FROM node:alpine

# http://jdlm.info/articles/2016/03/06/lessons-building-node-app-docker.html

#RUN useradd --user-group --create-home --shell /bin/false deploy
#ENV HOME=/home/deploy
#USER deploy

RUN npm install pm2 -g
RUN npm install yarn -g

VOLUME ["/app"]
WORKDIR /app

COPY package.json /tmp/package.json
RUN cd /tmp && yarn
RUN yarn cache clean
RUN mkdir -p /app && cp -a /tmp/node_modules/ /app
COPY . /app

#RUN chown -R deploy:deploy $HOME/*

CMD ["node", "index.js"]