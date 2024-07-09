from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, Boolean, Time, TIMESTAMP, Float, func
from model.model_platform import db

# 루틴 테이블
class Routines(db.Model):
    __tablename__ = 'Routines'
    RoutineID = Column(Integer, primary_key=True, autoincrement=True)
    RoutineName = Column(String(100), nullable=False)
    Description = Column(Text)


# 루틴 스케줄 테이블
class RoutineSchedules(db.Model):
    __tablename__ = 'RoutineSchedules'

    ScheduleID = Column(Integer, primary_key=True, autoincrement=True)
    RoutineID = Column(Integer, ForeignKey('Routines.RoutineID'))
    UserID = Column(Integer, ForeignKey('platform.Users.UserID'))
    Username = Column(String(255), ForeignKey('platform.Users.Username'))
    RoutineName = Column(String(100), ForeignKey('Routines.RoutineName'), nullable=False)
    DayOfWeek = Column(Enum('월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일', '매일매일', '주말만', '평일만'))
    StartTime = Column(Time)
    Duration = Column(Time)
    AlarmText = Column(Text)

# 스마트홈 디바이스 테이블
class SmartDevices(db.Model):
    __tablename__ = 'SmartDevices'

    DeviceID = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey('platform.Users.UserID'))
    DeviceName = Column(String(50), nullable=False)
    DeviceType = Column(Enum('sensor', 'light', 'mainboard'))
    Location = Column(String(100))
    IsActive = Column(Boolean, default=False)

# MQTT 토픽 테이블
class MQTTTopics(db.Model):
    __tablename__ = 'MQTTTopics'

    TopicID = Column(Integer, primary_key=True, autoincrement=True)
    DeviceID = Column(Integer, ForeignKey('SmartDevices.DeviceID'))
    TopicName = Column(String(255), nullable=False)

# 디바이스 데이터 테이블
class DeviceData(db.Model):
    __tablename__ = 'DeviceData'

    DataID = Column(Integer, primary_key=True, autoincrement=True)
    TopicID = Column(Integer, ForeignKey('MQTTTopics.TopicID'))
    DeviceID = Column(Integer, ForeignKey('SmartDevices.DeviceID'))
    Value = Column(Float)
    Timestamp = Column(Time, default=func.now())

# 루틴 액션 테이블
class RoutineActions(db.Model):
    __tablename__ = 'RoutineActions'

    ActionID = Column(Integer, primary_key=True, autoincrement=True)
    RoutineID = Column(Integer, ForeignKey('Routines.RoutineID'))
    ScheduleID = Column(Integer, ForeignKey('RoutineSchedules.ScheduleID'))
    DeviceID = Column(Integer, ForeignKey('SmartDevices.DeviceID'))
    StartTime = Column(Time, ForeignKey('RoutineSchedules.StartTime'))
    RoutineName = Column(String(100), ForeignKey('Routines.RoutineName'), nullable=False)
    ActionType = Column(Enum('TRUE', 'FALSE', 'WAIT'))
    UserID = Column(Integer, ForeignKey('platform.Users.UserID'))

# 알람 테이블
class Alarms(db.Model):
    __tablename__ = 'Alarms'

    AlarmID = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey('platform.Users.UserID'))
    ScheduleID = Column(Integer, ForeignKey('RoutineSchedules.ScheduleID'))
    StartTime = Column(Time, ForeignKey('RoutineSchedules.StartTime'))
    AlarmText = Column(Text, ForeignKey('RoutineSchedules.AlarmText'))


# 칭호 테이블
class Title_firstname(db.Model):
    __tablename__ = 'Title_firstname'

    FirstName = Column(String(255), primary_key=True, unique=True)

class Title_secondname(db.Model):
    __tablename__ = 'Title_secondname'

    SecondName = Column(String(255), primary_key=True, unique=True)

class UserTitle(db.Model):
    __tablename__ = 'UserTitle'

    UserID = Column(Integer, ForeignKey('platform.Users.UserID'), primary_key=True)
    FirstName = Column(String(255), ForeignKey('Title_firstname.FirstName'))
    SecondName = Column(String(255), ForeignKey('Title_secondname.SecondName'))
