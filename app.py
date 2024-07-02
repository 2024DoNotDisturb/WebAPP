import flask
import flask_login
from config import Config
import datetime
import bcrypt
import ssl
from model.model import User, UserProfiles, UserRoles, Roles, Permissions, db, Session
from model.google import init_google_oauth
import base64
import os
from werkzeug.utils import secure_filename

# 파일 업로드 처리를 위한 설정
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# SSL 검증 비활성화
if getattr(ssl, '_create_unverified_context', None):
    ssl._create_default_https_context = ssl._create_unverified_context

app = flask.Flask(__name__)
app.config.from_object(Config)

# 데이터베이스 초기화
db.init_app(app)

# 로그인 매니저 초기화
login_manager = flask_login.LoginManager()
login_manager.init_app(app)

# 구글 로그인 설정
google = init_google_oauth(
    app.config.get('GOOGLE_OAUTH2_CLIENT_ID'),
    app.config.get('GOOGLE_OAUTH2_CLIENT_SECRET')
)

@login_manager.user_loader
def load_user(id):
    session = Session()
    user = session.query(User).filter_by(ID=id).first()
    session.close()
    return user

#-------------------------------------------------로그인 관련-------------------------------------------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if flask.request.method == 'POST':
        id = flask.request.form.get("id")
        password = flask.request.form.get("password")

        user = User.query.filter_by(ID=id).first()

        if user:
            # 데이터베이스에 저장된 해시된 비밀번호와 입력된 비밀번호 비교
            if bcrypt.checkpw(password.encode('utf-8'), user.Password.encode('utf-8')):
                flask_login.login_user(user)
                return flask.redirect(flask.url_for("home"))
            else:
                flask.flash('Login failed. Please check your username and password.', 'error')
                return flask.redirect(flask.url_for('login'))
        else:
            flask.flash('Login failed. Please check your username and password.', 'error')
            return flask.redirect(flask.url_for('login'))

    return flask.render_template('login.html')

@app.route("/google/login")
def google_login():
    return google.authorize(callback=flask.url_for('google_callback', _external=True))

# 구글 OAuth 콜백 처리
@app.route('/google/callback')
def google_callback():
    resp = google.authorized_response()
    if resp is None or resp.get('access_token') is None:
        return 'Access denied: reason=%s error=%s' % (
            flask.request.args['error_reason'],
            flask.request.args['error_description']
        )
    flask.session['google_token'] = (resp['access_token'], '')
    user_info = google.get('userinfo').data

    email = user_info['email']
    name = user_info.get('name', '')

    session = Session()
    user = session.query(User).filter_by(Email=email).first()

    if user is None:
        new_user = User(
            ID=email,  
            Username=name,
            Password='', 
            Email=email,
            Phone='',
            DateOfBirth=None,
            DateJoined=datetime.datetime.now(),
            Status='active'
        )
        session.add(new_user)
        session.commit()

        new_user_profile = UserProfiles(
            UserID=new_user.UserID,
            ID=email,
            Username=name,
            FirstName='새로운',
            LastName='뉴비',
            Address=''
        )
        session.add(new_user_profile)
        session.commit()

        default_role = session.query(Roles).filter_by(RoleName='Basic User').first()
        default_permission = session.query(Permissions).filter_by(PermissionName='User').first()

        new_user_role = UserRoles(
            UserID=new_user.UserID,
            RoleID=default_role.RoleID,
            PermissionID=default_permission.PermissionID
        )
        session.add(new_user_role)
        session.commit()

        user = new_user

    session.close()
    flask_login.login_user(user)
    return flask.redirect(flask.url_for('home'))

@google.tokengetter
def get_google_oauth_token():
    return flask.session.get('google_token')

# 회원가입
@app.route('/register', methods=['POST'])
def register():
    name = flask.request.form.get('name')
    join_id = flask.request.form.get('join_id')
    join_pwd = flask.request.form.get('join_pwd')
    birth = flask.request.form.get('birth')
    phone = flask.request.form.get('phone')
    email = flask.request.form.get('email')
    address = flask.request.form.get('address')
    address2 = flask.request.form.get('address2')
    address3 = flask.request.form.get('address3')

    # 비밀번호 암호화
    hashed_pwd = bcrypt.hashpw(join_pwd.encode('utf-8'), bcrypt.gensalt())
    full_address = f"{address}, {address2}, {address3}"
    
    session = Session()
    
    # 데이터베이스 저장
    new_user = User(
        ID=join_id,
        Username=name,
        Password=hashed_pwd,
        Email=email,
        Phone=phone,
        DateOfBirth=birth,
        DateJoined= datetime.datetime.now(),
        Status='active'
    )
    session.add(new_user)
    session.commit()

    new_user_profile = UserProfiles(
        UserID=new_user.UserID, 
        ID=join_id, 
        Username=name,
        FirstName="새로운",
        LastName="뉴비",
        Address=full_address
    )
    db.session.add(new_user_profile)
    db.session.commit()

    default_role = session.query(Roles).filter_by(RoleName='Basic User').first()
    default_permission = session.query(Permissions).filter_by(PermissionName='User').first()

    new_user_role = UserRoles(
        UserID=new_user.UserID,
        RoleID=default_role.RoleID,
        PermissionID=default_permission.PermissionID
    )
    session.add(new_user_role)
    session.commit()
    session.close()

    flask.flash('Account created successfully!', 'success')
    return flask.redirect(flask.url_for('login'))

# 개인정보 동의 문서 읽어오기
@app.route('/get_terms_of_use')
def get_terms_of_use():
    with open('TermsofUse/TermsofUse.txt', 'r', encoding='utf-8') as file:
        terms_of_use = file.read()
    return terms_of_use
@app.route('/get_personal_information')
def get_personal_information():
    with open('TermsofUse/PersonalInformation.txt', 'r', encoding='utf-8') as file:
        personal_information = file.read()
    return personal_information

#로그아웃
@app.route("/logout")
def logout():
    flask_login.logout_user()
    return "Logged out"

#아이디 중복 확인
@app.route('/check_id', methods=['GET'])
def check_id():
    join_id = flask.request.args.get('join_id')
    user = User.query.filter_by(ID=join_id).first()
    return flask.jsonify({'exists': user is not None})

@app.context_processor
def inject_flask_login():
    return dict(flask_login=flask_login)
#-----------------------------------------------------------------------------------------------------------


#-------------------------------------------------프로필 수정--------------------------------------------------
@app.route('/save_profile_changes', methods=['POST'])
def save_profile_changes():
    # 클라이언트에서 전송된 데이터 가져오기
    new_username = flask.request.form.get('newUsername')
    new_email = flask.request.form.get('newEmail')
    new_phone = flask.request.form.get('newPhone')
    new_address = flask.request.form.get('newAddress')
    new_status = flask.request.form.get('newStatus')

    # 현재 로그인한 사용자 정보 가져오기
    current_user = flask_login.current_user

    # 데이터베이스 업데이트
    try:
        current_user.Username = new_username
        current_user.Email = new_email
        current_user.Phone = new_phone
        current_user.user_profile[0].Address = new_address
        current_user.Status = new_status

        db.session.commit()
        return flask.jsonify({'success': True, 'message': '프로필이 성공적으로 업데이트되었습니다.'})
    except Exception as e:
        db.session.rollback()
        return flask.jsonify({'success': False, 'message': '프로필 업데이트에 실패했습니다: ' + str(e)})

# 파일 업로드 허용 여부 확인 함수
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload_profile_picture', methods=['POST'])
def upload_profile_picture():
    # 클라이언트에서 전송된 파일 가져오기
    if 'file' not in flask.request.files:
        return flask.jsonify({'success': False, 'message': '파일이 전송되지 않았습니다.'})

    file = flask.request.files['file']

    # 파일 업로드 및 데이터베이스에 저장
    if file and allowed_file(file.filename):
        try:
            # 파일 데이터 읽기
            file_data = file.read()

            # 사용자 프로필 사진 업데이트
            current_user = flask_login.current_user
            profile = current_user.user_profile[0]
            profile.ProfilePicture = file_data

            # 데이터베이스에 커밋
            db.session.commit()

            return flask.jsonify({
                'success': True,
                'message': '프로필 사진이 성공적으로 업로드되었습니다.'
            })
        except Exception as e:
            db.session.rollback()
            return flask.jsonify({
                'success': False,
                'message': '프로필 사진 업로드에 실패했습니다: ' + str(e)
            })

    return flask.jsonify({'success': False, 'message': '허용되지 않는 파일 형식입니다.'})

@app.route('/update_title', methods=['POST'])
def update_title():
    try:
        # 클라이언트에서 전송된 새로운 칭호 가져오기
        new_firstname = flask.request.form.get('newFirstName')
        new_lastname = flask.request.form.get('newLastName')

        # 현재 로그인한 사용자 정보 가져오기
        current_user = flask_login.current_user

        # 데이터베이스 업데이트
        current_user.user_profile[0].FirstName = new_firstname
        current_user.user_profile[0].LastName = new_lastname
        db.session.commit()

        return flask.jsonify({'success': True, 'message': '칭호가 성공적으로 업데이트되었습니다.'})

    except Exception as e:
        db.session.rollback()
        return flask.jsonify({'success': False, 'message': '칭호 업데이트에 실패했습니다: ' + str(e)})

#-----------------------------------------------------------------------------------------------------------


#-------------------------------------------------페이지 라우트------------------------------------------------
@app.route('/')
def home():
    if flask_login.current_user.is_authenticated:
        user_profile = flask_login.current_user.user_profile[0]
        profile_picture = user_profile.ProfilePicture
        encoded_profile_picture = None
        if profile_picture:
            encoded_profile_picture = base64.b64encode(profile_picture).decode('utf-8')
            print(f"Encoded profile picture: {encoded_profile_picture[:30]}...")

        return flask.render_template('home.html', encoded_profile_picture=encoded_profile_picture)
    else:
        return flask.redirect(flask.url_for('login'))

@app.route('/account')
def account():
    user_profile = flask_login.current_user.user_profile[0]
    profile_picture = user_profile.ProfilePicture
    encoded_profile_picture = None
    if profile_picture:
        encoded_profile_picture = base64.b64encode(profile_picture).decode('utf-8')
        print('pic')

    return flask.render_template('account.html', encoded_profile_picture=encoded_profile_picture)


@app.route('/error')
def error():
    return flask.render_template('error.html')

@app.route('/donotdisturb')
def donotdisturb():
    return flask.render_template('donotdisturb.html')

@app.route('/introdeveloper')
def introdeveloper():
    return flask.render_template('introdeveloper.html')

@app.route('/introservice')
def introservice():
    return flask.render_template('introservice.html')

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'])
