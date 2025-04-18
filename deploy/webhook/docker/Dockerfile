# Python 3.10 이상 버전 선택 가능
FROM python:3.10-slim

# 작업 디렉토리 설정
WORKDIR /app

# 필요한 파일 복사
COPY . .

# 의존성 설치
RUN pip install --no-cache-dir -r requirements.txt

# Flask 실행
CMD ["python3", "your_flask_filename.py"]
