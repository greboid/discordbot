FROM oven/bun:1.3.11-alpine AS build

RUN apk add nodejs npm python3 py3-setuptools make gcc g++ musl-dev

WORKDIR /app

COPY bun.lock package.json /app/

RUN bun install --omit=dev

FROM alpine:3.23

RUN apk --no-cache add nodejs

WORKDIR /app

COPY --from=build /app/node_modules/ /app/node_modules/
COPY . /app

ENTRYPOINT ["node", "index.js"]
