# Frontend Build stage
FROM node:20-alpine AS fe-builder
WORKDIR /app
ARG VITE_APP_COMMIT_ID=dev
ENV VITE_APP_COMMIT_ID=$VITE_APP_COMMIT_ID
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

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
COPY --from=fe-builder /app/dist ./dist
EXPOSE 8080
CMD ["./main"]
