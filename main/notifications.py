import firebase_admin
from firebase_admin import credentials

cred = credentials.Certificate("../fcm.json")
firebase_admin.initialize_app(cred)

from firebase_admin import messaging

def send_to_firebase_cloud_messaging():
    registration_token = '클라이언트의 FCM 토큰'

    message = messaging.Message(
    notification=messaging.Notification(
        title='안녕하세요 타이틀 입니다',
        body='안녕하세요 메세지 입니다',
    ),
    token=registration_token,
    )

    response = messaging.send(message)
    
    print('Successfully sent message:', response)