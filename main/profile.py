from flask import Blueprint, request, jsonify
import flask_login
import bcrypt
from model.model_platform import User, db, UserProfiles
from model.model_routine import UserEquippedTitle, Title

profile = Blueprint('profile', __name__)

# 사진 파일 형식 확인
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}

# 계정 정보 수정 업데이트
@profile.route('/save_profile_changes', methods=['POST'])
def save_profile_changes():
    try:
        new_username = request.form.get('newUsername')
        new_email = request.form.get('newEmail')
        new_phone = request.form.get('newPhone')
        new_address = request.form.get('newAddress')
        new_status = request.form.get('newStatus')
        new_password = request.form.get('newPassword')
            
        hashed_pwd = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())

        current_user = flask_login.current_user
        if not current_user:
            return jsonify({'success': False, 'message': '사용자를 찾을 수 없습니다.'})

        user = db.session.query(User).filter_by(ID=current_user.ID).first()
        if user:
            if new_username:  
                user.Username = new_username
            if new_password:  # 새로운 비밀번호가 전달된 경우에만 업데이트
                user.Password = hashed_pwd
            if new_email:
                user.Email = new_email
            if new_phone:
                user.Phone = new_phone
            if new_status:
                user.Status = new_status

            user_profile = user.user_profile[0]
            if user_profile and new_address:
                user_profile.Address = new_address

            db.session.commit()
            return jsonify({'success': True, 'message': '프로필이 성공적으로 업데이트되었습니다.'})
        else:
            return jsonify({'success': False, 'message': '사용자를 찾을 수 없습니다.'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '프로필 업데이트에 실패했습니다: ' + str(e)})

# 계정 사진 업데이트
@profile.route('/upload_profile_picture', methods=['POST'])
def upload_profile_picture():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': '파일이 전송되지 않았습니다.'})

        file = request.files['file']

        if file and allowed_file(file.filename):
            file_data = file.read()
            current_user = flask_login.current_user

            user = User.query.filter_by(ID=current_user.ID).first()
            if user:
                user_profile = user.user_profile[0]
                if user_profile:
                    user_profile.ProfilePicture = file_data

                db.session.commit()
                return jsonify({'success': True, 'message': '프로필 사진이 성공적으로 업로드되었습니다.'})
            else:
                return jsonify({'success': False, 'message': '사용자를 찾을 수 없습니다.'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': '프로필 사진 업로드에 실패했습니다: ' + str(e)})

    return jsonify({'success': False, 'message': '허용되지 않는 파일 형식입니다.'})

# 칭호 업데이트
@profile.route('/update_first_lastname', methods=['POST'])
def update_user_profile_title(user_id):
    # 서비스 DB에서 사용자의 착용 칭호 정보 가져오기
    equipped_title = db.query(UserEquippedTitle).filter_by(UserID=user_id).first()
    
    if equipped_title:
        first_title = db.query(Title).get(equipped_title.EquippedFirstTitleID)
        second_title = db.query(Title).get(equipped_title.EquippedSecondTitleID)
        
        # 프로필 DB에서 사용자 프로필 업데이트
        user_profile = db.query(UserProfiles).filter_by(UserID=user_id).first()
        
        if user_profile:
            full_title = f"{first_title.Name if first_title else ''} {user_profile.Username} {second_title.Name if second_title else ''}"
            user_profile.Username = full_title.strip()
            db.commit()

# 비밀번호 수정시 현재 비밀번호 일치 확인
@profile.route('/check_password_match', methods=['POST'])
def check_password_match():
    password = request.form.get('Password')

    current_user = flask_login.current_user
    user = db.session.query(User).filter_by(ID=current_user.ID).first()

    if user and bcrypt.checkpw(password.encode('utf-8'), user.Password.encode('utf-8')):
        return jsonify({'match': True}), 200
    return jsonify({'match': False}), 200
