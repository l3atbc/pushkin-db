FROM node:latest
RUN apt-get update
RUN apt-get install -y netcat
COPY package.json /tmp/package.json
RUN cd /tmp/ && npm install --production -s
RUN mkdir -p /usr/src/app
RUN mv /tmp/node_modules /usr/src/app/
WORKDIR /usr/src/app
COPY . /usr/src/app
CMD npm start
