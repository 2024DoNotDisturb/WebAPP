from flask import Blueprint, request, jsonify, current_app
import flask_login
from model.model_platform import User, db
from firebase_admin import messaging
import requests
from config import Config

fcm = Blueprint('fcm', __name__)

# FCM 토큰 구독 처리
@fcm.route('/subscribe', methods=['POST'])
def subscribe():
    data = request.get_json()
    token = data.get('token')
    return jsonify({"success": True})

# 주어진 토큰으로 FCM 알림 전송
@fcm.route('/send_notification', methods=['POST'])
def send_notification():
    data = request.get_json()
    token = data.get('token')
    message = data.get('message')

    headers = {
        'Authorization': 'key=' + Config.apiKey,
        'Content-Type': 'application/json'
    }

    payload = {
        'to': token,
        'notification': {
            'title': 'Notification Title',
            'body': message
        },
        'data': {
            'url': '/routine_notice'
        }
    }

    response = requests.post('https://fcm.googleapis.com/fcm/send', headers=headers, json=payload)

    if response.status_code == 200:
        return jsonify({"success": True}), 200
    else:
        return jsonify({"failed": True}), 500

# Firebase 키 반환
@fcm.route('/firebase_config')
def firebase_config():
    config = {
        "apiKey": Config.apiKey,
        "authDomain": Config.authDomain,
        "projectId": Config.projectId,
        "storageBucket": Config.storageBucket,
        "messagingSenderId": Config.messagingSenderId,
        "appId": Config.appId,
        "VAPID":Config.VAPID,
        "measurementId": Config.measurementId,
    }
    return jsonify(config)

# FCM 토큰을 저장
@fcm.route('/save_fcm_token', methods=['POST'])
def save_fcm_token():
    data = request.json
    token = data.get('token')
    user_id = flask_login.current_user.UserID
    
    user = User.query.get(user_id)
    if user:
        user.FCMToken = token
        db.session.commit()
        return jsonify({"message": "Token saved successfully"}), 200
    return jsonify({"error": "User not found"}), 404
