from flask import Blueprint, request, redirect, url_for, render_template, flash, session, jsonify
import flask_login
import bcrypt
import datetime
from model.model_platform import User, UserProfiles, UserRoles, Roles, Permissions, db, Session
from model.google import init_google_oauth
from config import Config

auth = Blueprint('auth', __name__)
google = init_google_oauth(Config.GOOGLE_OAUTH2_CLIENT_ID, Config.GOOGLE_OAUTH2_CLIENT_SECRET)

# 로그인
@auth.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        id = request.form.get("id")
        password = request.form.get("password")
        user = User.query.filter_by(ID=id).first()

        if user and bcrypt.checkpw(password.encode('utf-8'), user.Password.encode('utf-8')):
            flask_login.login_user(user)
            if user.is_admin():
                return redirect(url_for("views.dashboard_page")) 
            else:
                return redirect(url_for("views.home"))
        else:
            flash('Login failed. Please check your username and password.', 'error')
            return redirect(url_for('auth.login'))
    return render_template('Platform/login.html')

# 구글 로그인
@auth.route("/google/login")
def google_login():
    return google.authorize(callback=url_for('auth.google_callback', _external=True))

@auth.route('/google/callback')
def google_callback():
    resp = google.authorized_response()
    if resp is None or resp.get('access_token') is None:
        return 'Access denied: reason=%s error=%s' % (
            request.args['error_reason'],
            request.args['error_description']
        )
    
    session['google_token'] = (resp['access_token'], '')
    user_info = google.get('userinfo').data

    email = user_info['email']
    name = user_info.get('name', '')

    session_db = Session()
    user = session_db.query(User).filter_by(Email=email).first()

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
        session_db.add(new_user)
        session_db.commit()

        new_user_profile = UserProfiles(
            UserID=new_user.UserID,
            ID=email,
            Username=name,
            FirstName='새로운',
            LastName='뉴비',
            Address=''
        )
        session_db.add(new_user_profile)
        session_db.commit()

        default_role = session_db.query(Roles).filter_by(RoleName='Basic User').first()
        default_permission = session_db.query(Permissions).filter_by(PermissionName='User').first()

        new_user_role = UserRoles(
            UserID=new_user.UserID,
            RoleID=default_role.RoleID,
            PermissionID=default_permission.PermissionID
        )
        session_db.add(new_user_role)
        session_db.commit()

        user = new_user

    flask_login.login_user(user)
    return redirect(url_for('home'))

@google.tokengetter
def get_google_oauth_token():
    return session.get('google_token')

# 로그아웃
@auth.route("/logout")
def logout():
    flask_login.logout_user()
    return redirect(url_for('auth.login'))  # 로그아웃 후 로그인 페이지로 리디렉션합니다.

# 회원가입
@auth.route('/register', methods=['POST'])
def register():
    name = request.form.get('name')
    join_id = request.form.get('join_id')
    join_pwd = request.form.get('join_pwd')
    birth = request.form.get('birth')
    phone = request.form.get('phone')
    email = request.form.get('email')
    address = request.form.get('address')
    address2 = request.form.get('address2')
    address3 = request.form.get('address3')

    hashed_pwd = bcrypt.hashpw(join_pwd.encode('utf-8'), bcrypt.gensalt())
    full_address = f"{address}, {address2}, {address3}"
    
    session_db = Session()
    
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
    session_db.add(new_user)
    session_db.commit()

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

    default_role = session_db.query(Roles).filter_by(RoleName='Basic User').first()
    default_permission = session_db.query(Permissions).filter_by(PermissionName='User').first()

    new_user_role = UserRoles(
        UserID=new_user.UserID,
        RoleID=default_role.RoleID,
        PermissionID=default_permission.PermissionID
    )
    session_db.add(new_user_role)
    session_db.commit()
    session_db.close()

    flash('Account created successfully!', 'success')
    return redirect(url_for('auth.login'))

# 아이디 중복 확인
@auth.route('/check_id', methods=['GET'])
def check_id():
    join_id = request.args.get('join_id')
    user = User.query.filter_by(ID=join_id).first()
    return jsonify({'exists': user is not None})

# 개인정보 동의 문서 읽어오기
@auth.route('/get_terms_of_use')
def get_terms_of_use():
    with open('static/src/TermsofUse/TermsofUse.txt', 'r', encoding='utf-8') as file:
        terms_of_use = file.read()
    return terms_of_use

@auth.route('/get_personal_information')
def get_personal_information():
    with open('static/src/TermsofUse/PersonalInformation.txt', 'r', encoding='utf-8') as file:
        personal_information = file.read()
    return personal_information
