FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# build
RUN npm run build

# SPA routing用
RUN cp public/_redirects dist/_redirects

# serve install
RUN npm install -g serve

# 本番起動
CMD ["serve", "-s", "dist", "-l", "3000"]