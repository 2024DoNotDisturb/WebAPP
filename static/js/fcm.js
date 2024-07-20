let VAPID;

//Firebase 메시징 설정/초기 키 로드
function load_key() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK is not loaded. Make sure it\'s included before fcm.js');
        return;
    }

    fetch('/fcm/firebase_config')
        .then(response => response.json())
        .then(firebaseConfig => {
            VAPID = firebaseConfig.VAPID;
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            } else {
                firebase.app(); // 이미 초기화되어 있다면 기존 앱을 사용
            }

            if (!firebase.messaging.isSupported()) {
                console.error('This browser doesn\'t support Firebase Messaging.');
                return;
            }

            window.messagingInstance = firebase.messaging();
            initializeFCM();
        })
        .catch(error => console.error('Error loading Firebase config:', error));
}

// 서비스 워커를 등록 및 메시지 수신 시 알림을 표시
function initializeFCM() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js')
            .then(function (registration) {
                console.log('Service Worker registered with scope:', registration.scope);

                //메시지 수신 후 알림 표시 (포그라운드)
                window.messagingInstance.onMessage((payload) => {
                    console.log('Message received. ', payload);

                    const notificationOptions = {
                        body: payload.notification.body,
                        icon: payload.notification.icon,
                        data: {
                            url: payload.data.url,
                            title: payload.notification.title,

                        }
                    };

                    const notification = new Notification(payload.notification.title, notificationOptions);

                    // 알림 클릭 시 특정 URL로 이동
                    notification.onclick = function(event) {
                        window.open('/routine_notice?title=' + event.target.data.title + '&body=' + event.target.data.body, '_blank');
                    };
                });
            }).catch(function (err) {
                console.log('Service Worker registration failed: ', err);
            });
    }
}

//로그인 시 메시징 토큰을 요청 및 저장
window.onLogin = function () {
    if (!window.messagingInstance) {
        console.error('Firebase messaging is not initialized');
        return;
    }
    window.messagingInstance.getToken({ vapidKey: VAPID })
        .then((currentToken) => {
            if (currentToken) {
                sendTokenToServer(currentToken);
            } else {
                console.log('No registration token available. Request permission to generate one.');
            }
        }).catch((err) => {
            console.error('An error occurred while retrieving token. ', err);
        });
}

//FCM 토큰 저장
function sendTokenToServer(token) {
    fetch('/fcm/save_fcm_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token }),
    })
        .then(response => response.json())
        .then(data => console.log('Token saved:', data))
        .catch((error) => console.error('Error saving token:', error));
}

// 로그아웃 시 FCM 토큰을 삭제
window.onLogout = function () {
    if (!window.messagingInstance) {
        console.error('Firebase messaging is not initialized');
        return;
    }

    window.messagingInstance.deleteToken().then(() => {
        console.log('Token deleted.');
    }).catch((err) => {
        console.error('Unable to delete token. ', err);
    });
}

// 페이지 로드 시 Firebase 초기화
document.addEventListener('DOMContentLoaded', load_key);
