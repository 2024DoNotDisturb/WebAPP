import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from flask import Blueprint, request, jsonify, current_app
from firebase_admin import messaging
from model.model_platform import User
from model.model_routine import RoutineSchedules
from pytz import timezone

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

routine_schedule = Blueprint('routine_schedule', __name__)

scheduler = BackgroundScheduler(timezone=timezone('Asia/Seoul'))
scheduler.start()

day_of_week_map = {
    '월': 'mon',
    '화': 'tue',
    '수': 'wed',
    '목': 'thu',
    '금': 'fri',
    '토': 'sat',
    '일': 'sun'
}

@routine_schedule.route('/schedule_notifications', methods=['POST'])
def schedule_notifications():
    try:
        schedules = RoutineSchedules.query.all()
        for schedule in schedules:
            day_of_week = day_of_week_map.get(schedule.DayOfWeek, schedule.DayOfWeek)

            scheduler.add_job(
                func=send_notification_with_context,
                trigger=CronTrigger(day_of_week=day_of_week, hour=schedule.StartTime.hour, minute=schedule.StartTime.minute),
                id=f'notification_{schedule.ScheduleID}',
                replace_existing=True,
                args=[current_app._get_current_object(), schedule.UserID, schedule.RoutineName, schedule.AlarmText, schedule.DayOfWeek, schedule.StartTime.hour, schedule.StartTime.minute]
            )
        return jsonify({"message": "Notifications scheduled successfully"}), 200
    except Exception as e:
        logger.error(f"Error scheduling notifications: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500
    
def send_notification_with_context(app, user_id, routine_name, alarm_text, day_of_week, hour, minuite):
    with app.app_context():
        send_notification(user_id, routine_name, alarm_text, day_of_week, hour, minuite)

def send_notification(user_id, routine_name, alarm_text, day_of_week, hour, minuite):
    with current_app.app_context():
        try:
            user = User.query.get(user_id)
            if user and user.FCMToken:
                message = messaging.Message(
                    notification=messaging.Notification(
                        title=f'{routine_name} - {hour}:{minuite} ({day_of_week})',
                        body=alarm_text or f'{routine_name} 루틴을 시작할 시간입니다!'
                    ),
                    token=user.FCMToken,
                    data={
                        'url': '/routine_notice',
                        'title': f'{routine_name} - {hour}:{minuite}({day_of_week})',
                    },
                     webpush=messaging.WebpushConfig(
                        notification=messaging.WebpushNotification(
                            icon='/static/src/notification_logo.png'
                        )
                    )
                )
                response = messaging.send(message)
                print(f'Successfully sent message to {user_id}: {response}')
            else:
                print(f'User {user_id} not found or FCM token not available')
        except Exception as e:
            print(f'Error sending message to {user_id}: {e}')

@routine_schedule.route('/test_notification', methods=['POST'])
def test_notification():
    data = request.json
    user_id = data.get('user_id')
    routine_name = data.get('routine_name', 'Test Routine')
    alarm_text = data.get('alarm_text', 'This is a test notification')
    
    send_notification(user_id, routine_name, alarm_text,'목',10,30)
    return jsonify({"message": "Test notification sent"}), 200

@routine_schedule.route('/list_jobs', methods=['GET'])
def list_jobs():
    jobs = scheduler.get_jobs()
    job_list = [{"id": job.id, "next_run_time": str(job.next_run_time)} for job in jobs]
    return jsonify({"jobs": job_list}), 200
