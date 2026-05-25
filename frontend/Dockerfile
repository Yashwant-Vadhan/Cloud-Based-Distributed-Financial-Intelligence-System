# Stage 1: Build React SPA
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Set environment variables at build time (CRA bakes these in)
ARG REACT_APP_AUTH_URL
ARG REACT_APP_EXPENSE_URL
ARG REACT_APP_ML_URL

ENV REACT_APP_AUTH_URL=$REACT_APP_AUTH_URL
ENV REACT_APP_EXPENSE_URL=$REACT_APP_EXPENSE_URL
ENV REACT_APP_ML_URL=$REACT_APP_ML_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
