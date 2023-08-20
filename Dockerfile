FROM alpine:3.18 as build

RUN apk add nodejs npm python3 make gcc g++ musl-dev

WORKDIR /app

COPY package-lock.json package.json /app/

RUN npm install

FROM alpine:3.18

RUN apk add nodejs npm

WORKDIR /app

COPY --from=build /app/node_modules/ /app/node_modules/
COPY . /app

ENTRYPOINT ["npm", "run", "dev"]
