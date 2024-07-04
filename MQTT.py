import paho.mqtt.client as mqtt

#MQTT 설정
MQTT_BROKER = "localhost" #Mosquitto가 로컬에서 실행중
MQTT_PORT = 3306
MQTT_TOPIC = "smart_home/#"

device_data = {}

# MQTT 콜백 함수
def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    print(f"Received message on topic {msg.topic}: {msg.payload.decode()}")
    device_id = msg.topic.split('/')[-1]
    device_data[device_id] = msg.payload.decode()


# MQTT 클라이언트 설정
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)

# MQTT 루프 시작 (백그라운드에서 실행)
mqtt_client.loop_start()

