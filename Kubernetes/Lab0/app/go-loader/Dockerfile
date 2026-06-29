FROM golang:1.23.4-alpine AS build

WORKDIR /src
COPY go.mod ./
COPY cmd ./cmd
COPY internal ./internal
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/loader ./cmd/loader

FROM alpine:3.21 AS runtime

RUN addgroup -S loader && adduser -S loader -G loader
USER loader
WORKDIR /app
COPY --from=build /out/loader /usr/local/bin/loader

ENTRYPOINT ["loader"]

