# -------- BUILD IMAGE --------

FROM golang:1.24-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
COPY .env .env 2>/dev/null || true

RUN go build -o main .

# -------- FINAL IMAGE --------

FROM alpine:latest

WORKDIR /app

# Copy binary
COPY --from=builder /app/main .

# Copy .env juga ke final image (optional, bisa skip kalau tidak ada)
COPY --from=builder /app/.env .env 2>/dev/null || true

RUN apk add --no-cache ca-certificates

EXPOSE 3000

CMD ["./main"]
