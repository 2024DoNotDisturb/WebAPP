from flask import Blueprint, jsonify, current_app
from flask_login import login_required
from sqlalchemy import and_
from model.model_routine import db, RoutineSchedules, RoutineActions
import flask_login

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
            # DayOfWeek를 적절한 형식으로 변환
            days = convert_day_of_week(schedule.DayOfWeek)
            
            routine_list.append({
                "StartTime": schedule.StartTime.strftime("%H:%M") if schedule.StartTime else None,
                "RoutineName": schedule.RoutineName,
                "ActionType": action.ActionType,
                "Days": days
            })
        
        current_app.logger.info(f"Returning {len(routine_list)} routines")
        return jsonify(routine_list)
    except Exception as e:
        current_app.logger.error(f"Error in get_user_routines: {str(e)}")
        return jsonify({"error": "An internal server error occurred"}), 500

def convert_day_of_week(day_of_week):
    if day_of_week == '매일매일':
        return ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']
    elif day_of_week == '주말만':
        return ['토요일', '일요일']
    elif day_of_week == '평일만':
        return ['월요일', '화요일', '수요일', '목요일', '금요일']
    else:
        return [day_of_week[0]]
