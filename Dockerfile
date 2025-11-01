# -------- BUILD IMAGE --------

FROM golang:1.24-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o main .

# -------- FINAL IMAGE --------

FROM alpine:latest

WORKDIR /app

RUN apk add --no-cache ca-certificates

# Copy binary
COPY --from=builder /app/main .

EXPOSE 3000

CMD ["./main"]
