#!/usr/bin/python3

from flask import *
from werkzeug.middleware.proxy_fix import ProxyFix
import os
from dotenv import load_dotenv
import hmac
import hashlib

FLASK_ENV = os.getenv("FLASK_ENV", "development")
load_dotenv(f".env.{FLASK_ENV}")

app = Flask(__name__)

app.wsgi_app = ProxyFix(
    app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1
)

@app.route('/server-webhook', methods=["POST"])
def otlplus_redeploy():
    webhook_secret = os.getenv("WEBHOOK_SECRET").encode()
    signature = 'sha256=' + hmac.new(webhook_secret, request.data, hashlib.sha256).hexdigest()
    if 'X-Hub-Signature-256' not in request.headers or not hmac.compare_digest(
        signature, request.headers['X-Hub-Signature-256']
    ):
        abort(403) 
    
    os.spawnl(os.P_NOWAIT, "/bin/bash", "/bin/bash", "/home/otlplus/server/deploy.sh -e dev")
    return "Done", 200

@app.route('/server-webhook-status', methods=["GET"])
def clubs_stage_redeploy():
    # os.spawnl(os.P_NOWAIT, "/bin/bash", "/bin/bash", "/home/otlplus/server/deploy.sh -e dev")
    return "Done", 200

if __name__ == '__main__':
    app.run(host="127.0.0.1", threaded=True, port=5000)