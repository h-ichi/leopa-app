# 修正版 Dockerfile
FROM node:20

WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

RUN npm install

# 全てのソースコードをコピー
COPY . .

# 開発用コマンド
CMD ["npm", "run", "dev"]
