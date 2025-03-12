# Node.js 18 기반 이미지 사용
FROM node:18

# 작업 디렉토리 설정
WORKDIR /app

# package.json 및 package-lock.json 복사 후 의존성 설치
COPY package*.json ./
RUN npm install

# Worker 코드 복사
COPY . .

# Push Notification Worker 실행
CMD ["node", "worker.js"]
