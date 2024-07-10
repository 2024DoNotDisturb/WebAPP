from flask import Blueprint, jsonify, render_template, redirect, url_for, request
from flask_login import current_user, login_required
import base64

views_bp = Blueprint('views', __name__)

@views_bp.route('/')
def home():
    if current_user.is_authenticated:
        user_profile = current_user.user_profile[0]
        profile_picture = user_profile.ProfilePicture
        encoded_profile_picture = None
        if profile_picture:
            encoded_profile_picture = base64.b64encode(profile_picture).decode('utf-8')

        return render_template('Platform/home.html', encoded_profile_picture=encoded_profile_picture)
    else:
        return redirect(url_for('auth.login'))

@views_bp.route('/account')
def account():
    if current_user.is_authenticated:
        user_profile = current_user.user_profile[0]
        profile_picture = user_profile.ProfilePicture
        encoded_profile_picture = None
        if profile_picture:
            encoded_profile_picture = base64.b64encode(profile_picture).decode('utf-8')

        return render_template('Platform/account.html', encoded_profile_picture=encoded_profile_picture)
    else:
        return redirect(url_for('auth.login'))

@views_bp.route('/error')
def error():
    return render_template('Platform/error.html')

@views_bp.route('/donotdisturb')
def donotdisturb():
    return render_template('Platform/donotdisturb.html')

@views_bp.route('/introdeveloper')
def introdeveloper():
    return render_template('Platform/introdeveloper.html')

@views_bp.route('/introservice')
def introservice():
    return render_template('Platform/introservice.html')

@views_bp.route('/Dashboard')
def dashboard_page():
    return render_template('Platform/dashboard.html')

@views_bp.route('/routine')
def loading():
    return render_template('SmartRoutine/loading.html')

@views_bp.route('/check-login-status') # 로딩 페이지 - 로그인 확인
def check_login_status():
    if current_user.is_authenticated:
        return jsonify({"isLoggedIn": True})
    else:
        return jsonify({"isLoggedIn": False})

@views_bp.route('/routine-home')
@login_required
def routine():
    return render_template('SmartRoutine/routine.html')

@views_bp.route('/routine_setting')
def routine_setting():
    return render_template('SmartRoutine/routine_setting.html')

@views_bp.route('/redirect-to-webapp')
def redirect_to_webapp():
    if current_user.is_authenticated:
        return redirect(url_for('views.routine'))  # 로그인된 경우 app으로 리다이렉트
    else:
        return redirect(url_for('auth.login'))  # 로그인되지 않은 경우 로그인 페이지로 리다이렉트