from flask import *
from werkzeug.middleware.proxy_fix import ProxyFix
import os
from dotenv import load_dotenv
import hmac
import hashlib
import subprocess

FLASK_ENV = os.getenv("FLASK_ENV", "development")
print(FLASK_ENV)
load_dotenv(f"./env/.env.{FLASK_ENV}")

app = Flask(__name__)

app.wsgi_app = ProxyFix(
    app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1
)

@app.route('/server-webhook', methods=["POST"])
def otlplus_redeploy():
    webhook_secret = os.getenv("WEBHOOK_SECRET").encode()
    signature = 'sha256=' + hmac.new(webhook_secret, request.data, hashlib.sha256).hexdigest()
    print(signature)
    print(request.headers.get('X-Hub-Signature-256', ''))
    if 'X-Hub-Signature-256' not in request.headers or not hmac.compare_digest(
        signature, request.headers['X-Hub-Signature-256']
    ):
        abort(403)

    # deploy.sh 실행 및 결과 확인
    try:
        result = subprocess.run(
            [
                "sudo",
                "/bin/bash",
                "/home/otlplus/server/deploy.sh",
                "-e",
                "dev"
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True  # 실패 시 예외 발생
        )
        print(result.stdout)  # 성공 출력 로그
        return {"status": "success", "message": "Deployment completed successfully."}, 200
    except subprocess.CalledProcessError as e:
        print(e.stderr)  # 에러 로그
        return {"status": "error", "message": "Deployment failed.", "details": e.stderr}, 500

@app.route('/server-webhook-status', methods=["GET"])
def clubs_stage_redeploy():
    return "Done", 200

if __name__ == '__main__':
    app.run(host="127.0.0.1", threaded=True, port=5000)
