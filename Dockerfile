# Backend Build stage
FROM golang:1.23-alpine AS be-builder
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Final stage
FROM alpine:latest
WORKDIR /root/
COPY --from=be-builder /app/main .
COPY dist/ ./dist
EXPOSE 8080
CMD ["./main"]
