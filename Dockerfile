FROM alpine:3.22 AS build

RUN apk add nodejs npm python3 py3-setuptools make gcc g++ musl-dev

WORKDIR /app

COPY package-lock.json package.json /app/

RUN npm install --omit=dev

FROM alpine:3.22

RUN apk --no-cache add nodejs npm

WORKDIR /app

COPY --from=build /app/node_modules/ /app/node_modules/
COPY . /app

ENTRYPOINT ["node", "index.js"]
