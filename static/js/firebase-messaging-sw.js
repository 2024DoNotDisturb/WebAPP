importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

let messaging;

// Firebase 초기화 및 메시징 설정 키 로드
function initializeFirebase() {
    fetch('/fcm/firebase_config')
        .then(response => response.json())
        .then(firebaseConfig => {
            firebase.initializeApp(firebaseConfig);
            messaging = firebase.messaging();

            // 메시지 수신 후 알림 표시 (백그라운드)
            messaging.onBackgroundMessage(function(payload) {
                console.log('[firebase-messaging-sw.js] Received background message ', payload);
                
                const notificationTitle = payload.notification.title;
                const notificationOptions = {
                    body: payload.notification.body,
                    icon: payload.notification.icon,
                    data: {
                        url: payload.data.url,
                        title: payload.notification.title,
                        body: payload.notification.body
                    }
                };

                self.registration.showNotification(notificationTitle, notificationOptions);
            });
        })
        .catch(error => console.error('Error loading Firebase config:', error));
}
initializeFirebase();

// 알림 클릭 시 특정 URL로 이동
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const url = event.notification.data.url;
    const title = event.notification.data.title;

    event.waitUntil(clients.matchAll({
        type: "window"
    }).then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if (client.url == '/' && 'focus' in client) {
                return client.focus();
            }
        }
        if (clients.openWindow) {
            return clients.openWindow(`${url}?title=${encodeURIComponent(title)}}`);
        }
    }));
});

// 푸시 이벤트 핸들러
self.addEventListener('push', function(event) {
    const payload = event.data.json();
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
        data: payload.data
    };

    event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
    );
});