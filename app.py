from flask import Flask, request
import flask_login
import ssl
from model.model_platform import User, Session, db
from config import Config
from main.views import views_bp
from main.auth import auth
from main.profile import profile
from main.dashboard import dashboard



# SSL 검증 비활성화
if getattr(ssl, '_create_unverified_context', None):
    ssl._create_default_https_context = ssl._create_unverified_context

app = Flask(__name__)
app.config.from_object(Config)

# 데이터베이스 초기화
db.init_app(app)

# 로그인 매니저 초기화
login_manager = flask_login.LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(id):
    session_db = Session()
    user = session_db.query(User).filter_by(ID=id).first()
    session_db.close()
    return user

# 블루프린트 등록
app.register_blueprint(views_bp)
app.register_blueprint(auth, url_prefix='/auth')
app.register_blueprint(profile, url_prefix='/profile')
app.register_blueprint(dashboard, url_prefix='/dashboard')

if __name__ == '__main__':
    app.run(debug=True)