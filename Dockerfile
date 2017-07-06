FROM node:latest
RUN apt-get update
RUN apt-get install nano
RUN apt-get install -y netcat
COPY . /app
WORKDIR /app
RUN npm install --production -s
CMD ["npm","start"]