from flask import jsonify, request, current_app, Blueprint
from flask_login import current_user, login_required
from model.model_routine import db, Title, UserEquippedTitle, UserTitleStatus
from model.model_platform import UserProfiles
import logging

title = Blueprint('title', __name__)

@title.route('/equip_title', methods=['POST'])
@login_required
def equip_title():
    try:
        data = request.json
        title_name = data.get('title_name')
        title_type = data.get('title_type')

        user_id = current_user.UserID

        # 해당 칭호 찾기
        title = Title.query.filter_by(TitleName=title_name, Type=title_type).first()
        if not title:
            return jsonify({'error': '칭호를 찾을 수 없습니다.'}), 404

        # 사용자가 해당 칭호를 해제했는지 확인
        unlocked = UserTitleStatus.query.filter_by(UserID=user_id, TitleID=title.TitleID).first()
        if not unlocked:
            return jsonify({'error': '아직 해제되지 않은 칭호입니다.'}), 403

        # 트랜잭션 시작
        try:
            # service_db 트랜잭션
            equipped_title = UserEquippedTitle.query.get(user_id)
            if not equipped_title:
                equipped_title = UserEquippedTitle(UserID=user_id)
                db.session.add(equipped_title)

            # 칭호 착용
            if title_type == 'First':
                equipped_title.EquippedFirstTitleID = title.TitleID
            else:  # 'Last'
                equipped_title.EquippedLastTitleID = title.TitleID

            db.session.flush()  # 변경사항을 DB에 반영하지만 커밋하지는 않음

            # platform_db 트랜잭션
            user_profile = UserProfiles.query.filter_by(UserID=user_id).first()
            if user_profile:
                if title_type == 'First':
                    user_profile.FirstName = title_name
                else:  # 'Last'
                    user_profile.LastName = title_name

            db.session.commit()  # 모든 변경사항 커밋

            return jsonify({'message': '칭호가 성공적으로 착용되었습니다.'}), 200

        except SQLAlchemyError as e:
            db.session.rollback()  # 오류 발생 시 롤백
            logging.error(f"Database error in equip_title: {str(e)}", exc_info=True)
            return jsonify({'error': '데이터베이스 오류가 발생했습니다.'}), 500

    except Exception as e:
        logging.error(f"Unexpected error in equip_title: {str(e)}", exc_info=True)
        return jsonify({'error': '서버 오류가 발생했습니다.'}), 500
