from flask import Flask, request, jsonify, send_from_directory
import flask_login
import ssl
from model.model_platform import User, Session, db
from config import Config
from main.views import views_bp
from main.auth import auth
from main.profile import profile
from main.dashboard import dashboard
from main.routine_home import routine
from main.smarthome import smarthome
from main.title import title
from main.generate_ai import generate
from main.fcm import fcm
from main.routine_schedule import routine_schedule
from main.food import food
import firebase_admin
from firebase_admin import credentials, messaging
from apscheduler.schedulers.background import BackgroundScheduler
from pytz import timezone

# SSL 검증 비활성화
if getattr(ssl, '_create_unverified_context', None):
    ssl._create_default_https_context = ssl._create_unverified_context

app = Flask(__name__)
app.config.from_object(Config)

# 데이터베이스 초기화
db.init_app(app)

# Firebase 초기화
cred = credentials.Certificate("firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
# FCM 토큰 저장을 위한 간단한 in-memory 저장소
fcm_tokens = set()

scheduler = BackgroundScheduler(timezone=timezone('Asia/Seoul'))
scheduler.start()

# 로그인 매니저 초기화
login_manager = flask_login.LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(id):
    session_db = Session()
    user = session_db.query(User).filter_by(ID=id).first()
    session_db.close()
    return user

@app.errorhandler(404)
def not_found_error(error):
    print(f"404 error: {error}, Path: {request.path}")
    return jsonify({"error": "Not found", "path": request.path}), 404

@app.route('/firebase-messaging-sw.js')
def serve_sw():
    return send_from_directory('static/js', 'firebase-messaging-sw.js')

@app.route('/register', methods=['POST'])
def register_device():
    token = request.json.get('token')
    if token:
        fcm_tokens.add(token)
        print(f"Token registered: {token}")  # 디버그 출력
        print(f"Total tokens: {len(fcm_tokens)}")  # 디버그 출력
        return jsonify({"message": "Device registered successfully"}), 200
    return jsonify({"error": "No token provided"}), 400

@app.route('/send_notification', methods=['POST'])
def send_notification():
    title = request.json.get('title')
    body = request.json.get('body')
    
    if not title or not body:
        return jsonify({"error": "Title and body are required"}), 400
    
    if not fcm_tokens:
        return jsonify({
            "error": "No registered devices",
            "token_count": len(fcm_tokens)
        }), 400
    
    message = messaging.MulticastMessage(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        tokens=list(fcm_tokens),
    )
    
    try:
        response = messaging.send_multicast(message)
        return jsonify({
            "success": response.success_count,
            "failure": response.failure_count
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 블루프린트 등록
app.register_blueprint(views_bp)
app.register_blueprint(auth, url_prefix='/auth')
app.register_blueprint(profile, url_prefix='/profile')
app.register_blueprint(dashboard, url_prefix='/dashboard')
app.register_blueprint(routine, url_prefix='/routine')
app.register_blueprint(title, url_prefix='/title')
app.register_blueprint(generate, url_prefix='/generate')
app.register_blueprint(fcm, url_prefix='/fcm')
app.register_blueprint(routine_schedule, url_prefix='/routine_schedule')
app.register_blueprint(smarthome, url_prefix='/smarthome')
app.register_blueprint(food, url_prefix='/food')


if __name__ == '__main__':
    app.run(debug=True)