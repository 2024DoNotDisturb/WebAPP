from flask import Blueprint, jsonify, current_app, request
from flask_login import login_required
from sqlalchemy import and_, func
from model.model_routine import db, RoutineSchedules, RoutineActions, Routines
import flask_login
from datetime import datetime, date

routine = Blueprint('routine', __name__)

@routine.route('/user_routines', methods=['GET'])
@login_required
def get_user_routines():
    try:
        current_user = flask_login.current_user
        user_id = current_user.UserID
        current_app.logger.info(f"Fetching routines for user ID: {user_id}")
        
        routines = db.session.query(RoutineSchedules, RoutineActions)\
            .join(RoutineActions, and_(
                RoutineSchedules.ScheduleID == RoutineActions.ScheduleID,
                RoutineSchedules.UserID == RoutineActions.UserID
            ))\
            .filter(RoutineSchedules.UserID == user_id)\
            .order_by(RoutineSchedules.StartTime)\
            .all()
        
        routine_list = []
        for schedule, action in routines:
            routine_list.append({
                "ScheduleID": schedule.ScheduleID,
                "StartTime": schedule.StartTime.strftime("%H:%M") if schedule.StartTime else None,
                "RoutineName": schedule.RoutineName,
                "ActionType": action.ActionType,
                "Day": schedule.DayOfWeek
            })
        
        current_app.logger.info(f"Returning {len(routine_list)} routines")
        return jsonify(routine_list)
    except Exception as e:
        current_app.logger.error(f"Error in get_user_routines: {str(e)}")
        return jsonify({"error": "An internal server error occurred"}), 500

# 루틴 수행 여부 판독 메서드 // 
# @routine.route('/update_routine_status', methods=['POST'])
# @login_required
# def update_routine_status():
#     try:
#         current_user = flask_login.current_user
#         user_id = current_user.UserID
#         data = request.json
#         schedule_id = data.get('schedule_id')
#         action_type = data.get('action_type')

#         if not schedule_id or action_type not in ['TRUE', 'FALSE']:
#             return jsonify({"error": "Invalid input"}), 400

#         routine_action = RoutineActions.query.filter_by(
#             UserID=user_id,
#             ScheduleID=schedule_id
#         ).first()

#         if not routine_action:
#             return jsonify({"error": "Routine not found"}), 404

#         routine_action.ActionType = action_type
#         routine_action.Date = datetime.now()

#         db.session.commit()

#         current_app.logger.info(f"Updated routine status for user {user_id}, schedule {schedule_id} to {action_type}")
#         return jsonify({"message": "Routine status updated successfully"}), 200

#     except Exception as e:
#         current_app.logger.error(f"Error in update_routine_status: {str(e)}")
#         return jsonify({"error": "An internal server error occurred"}), 500
    
# 루틴 수행 여부 초기화 메서드 / 하루 단위로 초기화
@routine.route('/reset_routine_statuses', methods=['POST'])
@login_required
def reset_routine_statuses():
    try:
        current_user = flask_login.current_user
        user_id = current_user.UserID
        
        # 오늘 날짜와 다른 Date를 가진 모든 RoutineActions를 찾아 업데이트
        today = date.today()
        actions_to_reset = RoutineActions.query.filter(
            RoutineActions.UserID == user_id,
            func.date(RoutineActions.Date) != today
        ).all()

        for action in actions_to_reset:
            action.ActionType = 'WAIT'
            action.Date = datetime.now()

        db.session.commit()

        current_app.logger.info(f"Reset {len(actions_to_reset)} routine statuses for user {user_id}")
        return jsonify({
            "message": f"Successfully reset {len(actions_to_reset)} routine statuses",
            "reset_count": len(actions_to_reset)
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error in reset_routine_statuses: {str(e)}")
        return jsonify({"error": "An internal server error occurred"}), 500

@routine.route('/save-routine', methods=['POST'])
def save_routine():
    data = request.get_json()

    try:
        current_user = flask_login.current_user
        user_id = current_user.UserID
        username = current_user.Username

        routine_id = data.get('routineID')
        start_time = data.get('startTime')
        routine_time = data.get('routineTime')
        days_of_week = data.get('daysOfWeek')
        notice_text = data.get('noticeText')

        duration = calculate_duration(routine_time)
        routines = Routines.query.filter_by(RoutineID=routine_id).first()

        for day in days_of_week:
            routine_schedule = RoutineSchedules(
                RoutineID=routine_id,
                UserID=user_id,
                Username=username,
                RoutineName=routines.RoutineName,
                DayOfWeek=day,
                StartTime=start_time,
                Duration=duration,
                AlarmText=notice_text
            )
            db.session.add(routine_schedule)
            db.session.commit()

            schedule_id = routine_schedule.ScheduleID
            routine_action = RoutineActions(
                RoutineID=routine_id,
                # DeviceID=
                ScheduleID=schedule_id,
                UserID=user_id,
                StartTime=start_time,
                RoutineName=routines.RoutineName,
                ActionType='WAIT'
            )

            
            db.session.add(routine_action)
        
        db.session.commit()

        current_app.logger.info("Routine saved successfully")
        return jsonify({'message': 'Routine saved successfully'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in save_routine: {str(e)}")
        return jsonify({"error": "An internal server error occurred"}), 500

def calculate_duration(routine_time):
    if '시간' in routine_time:
        hours = int(routine_time.split('시간')[0])
        minutes = 0 if '30분' not in routine_time else 30
    else:
        hours = 0
        minutes = 30 if '30분' in routine_time else 60

    return timedelta(hours=hours, minutes=minutes)
