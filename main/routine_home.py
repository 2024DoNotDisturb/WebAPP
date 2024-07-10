from flask import Blueprint, jsonify, current_app, request
from flask_login import login_required, current_user
from sqlalchemy import and_
from model.model_routine import db, RoutineSchedules, RoutineActions, Routines
from model.model_platform import User
from datetime import timedelta
import flask_login

routine = Blueprint('routine', __name__)

@routine.route('/user_routines', methods=['GET'])
@login_required
def get_user_routines():
    try:
        current_user = flask_login.current_user
        user_id = current_user.UserID
        current_app.logger.info(f"Fetching routines for user ID: {user_id}")
        
        routines = db.session.query(RoutineSchedules)\
            .filter(RoutineSchedules.UserID == user_id)\
            .order_by(RoutineSchedules.StartTime)\
            .all()
        
        routine_list = []
        for schedule in routines:
            days = convert_day_of_week(schedule.DayOfWeek)
            
            routine_list.append({
                "StartTime": schedule.StartTime.strftime("%H:%M") if schedule.StartTime else None,
                "RoutineName": schedule.RoutineName,
                "Days": days
            })
        
        current_app.logger.info(f"Returning {len(routine_list)} routines")
        return jsonify(routine_list)
    except Exception as e:
        current_app.logger.error(f"Error in get_user_routines: {str(e)}")
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


def convert_day_of_week(day_of_week):
    if day_of_week == '매일매일':
        return ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']
    elif day_of_week == '주말만':
        return ['토요일', '일요일']
    elif day_of_week == '평일만':
        return ['월요일', '화요일', '수요일', '목요일', '금요일']
    else:
        return [day_of_week[0]]

def calculate_duration(routine_time):
    if '시간' in routine_time:
        hours = int(routine_time.split('시간')[0])
        minutes = 0 if '30분' not in routine_time else 30
    else:
        hours = 0
        minutes = 30 if '30분' in routine_time else 60

    return timedelta(hours=hours, minutes=minutes)
