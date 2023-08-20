FROM node:latest

WORKDIR /app

COPY package-lock.json package.json /app/

RUN npm install

COPY . /app

ENTRYPOINT ["npm", "run", "dev"]
