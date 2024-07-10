from flask import Blueprint, jsonify, current_app, request
from flask_login import login_required
from sqlalchemy import and_, func
from model.model_routine import db, RoutineSchedules, RoutineActions
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
    

