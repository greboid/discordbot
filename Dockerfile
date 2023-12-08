FROM alpine:3.19 as build

RUN apk add nodejs npm python3 make gcc g++ musl-dev

WORKDIR /app

COPY package-lock.json package.json /app/

RUN npm install --omit=dev

FROM alpine:3.19

RUN apk --no-cache add nodejs npm

WORKDIR /app

COPY --from=build /app/node_modules/ /app/node_modules/
COPY . /app

ENTRYPOINT ["node", "index.js"]
