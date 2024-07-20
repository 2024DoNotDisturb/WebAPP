from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, Boolean, Time, LargeBinary, Float, DateTime, func
from model.model_platform import db
from sqlalchemy.orm import relationship

# 루틴 테이블
class Routines(db.Model):
    __bind_key__ = 'service_db'
    __tablename__ = 'Routines'
    RoutineID = Column(Integer, primary_key=True, autoincrement=True)
    RoutineName = Column(String(100), nullable=False)
    Description = Column(Text)

# 루틴 스케줄 테이블
class RoutineSchedules(db.Model):
    __bind_key__ = 'service_db'
    __tablename__ = 'RoutineSchedules'

    ScheduleID = Column(Integer, primary_key=True, autoincrement=True)
    RoutineID = Column(Integer)
    UserID = Column(Integer)
    Username = Column(String(255), nullable=False)
    RoutineName = Column(String(100), nullable=False)
    StartTime = Column(Time)
    Duration = Column(Time)
    DayOfWeek = Column(Enum('월', '화', '수', '목', '금', '토', '일'))
    AlarmText = Column(Text)

# 스마트홈 디바이스 테이블
class SmartDevices(db.Model):
    __bind_key__ = 'service_db'
    __tablename__ = 'SmartDevices'

    DeviceID = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey('Users.UserID'))
    DeviceName = Column(String(50), nullable=False)
    DeviceType = Column(Enum('sensor', 'light', 'mainboard'))
    Location = Column(String(100))
    IsActive = Column(Boolean, default=False)


# 디바이스 데이터 테이블
class DeviceData(db.Model):
    __bind_key__ = 'service_db'
    __tablename__ = 'DeviceData'

    DataID = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey('platfrom.Users.UserID'))
    DeviceID = Column(Integer, ForeignKey('SmartDevices.DeviceID'))
    Value = Column(Float)
    Timestamp = Column(Time, default=func.now())

# 루틴 액션 테이블
class RoutineActions(db.Model):
    __bind_key__ = 'service_db'
    __tablename__ = 'RoutineActions'

    ActionID = Column(Integer, primary_key=True, autoincrement=True)
    RoutineID = Column(Integer, ForeignKey('Routines.RoutineID'))
    ScheduleID = Column(Integer, ForeignKey('RoutineSchedules.ScheduleID'))
    DeviceID = Column(Integer, ForeignKey('SmartDevices.DeviceID'))
    StartTime = Column(Time, ForeignKey('RoutineSchedules.StartTime'))
    RoutineName = Column(String(100), ForeignKey('Routines.RoutineName'), nullable=False)
    ActionType = Column(Enum('TRUE', 'FALSE', 'WAIT'))
    UserID = Column(Integer)

# 알람 테이블
class Alarms(db.Model):
    __bind_key__ = 'service_db'
    __tablename__ = 'Alarms'

    AlarmID = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey('Users.UserID'))
    ScheduleID = Column(Integer, ForeignKey('RoutineSchedules.ScheduleID'))
    StartTime = Column(Time, ForeignKey('RoutineSchedules.StartTime'))
    AlarmText = Column(Text, ForeignKey('RoutineSchedules.AlarmText'))

# 칭호 테이블
class Title(db.Model):
    __bind_key__ = 'service_db'
    __tablename__ = 'Title'

    TitleID = Column(Integer, primary_key=True, autoincrement=True)
    TitleName = Column(String(255), unique=True, nullable=False)
    Type = Column(Enum('First', 'Last'), nullable=False)  # 'First' for 앞, 'Last' for 뒤
    HiddenMission = Column(String(255), nullable=True)  # 히든 미션 설명

# 칭호 해제 테이블
class UserTitleStatus(db.Model):
    __bind_key__ = 'service_db'
    __tablename__ = 'UserTitleStatus'

    UserID = Column(Integer, ForeignKey('Users.UserID'))
    TitleID = Column(Integer, ForeignKey('Title.TitleID'))
    UnlockedID = Column(Integer, primary_key=True)  # 칭호 해제 여부
    UnlockedDate = Column(DateTime, nullable=True)  # 칭호 해제 날짜

# 사용자 칭호 착용 상태 테이블
class UserEquippedTitle(db.Model):
    __bind_key__ = 'service_db'
    __tablename__ = 'UserEquippedTitle'

    UserID = Column(Integer, primary_key=True)
    EquippedFirstTitleID = Column(Integer, ForeignKey('Title.TitleID'), nullable=True)  # 앞 칭호
    EquippedLastTitleID = Column(Integer, ForeignKey('Title.TitleID'), nullable=True)  # 뒤 칭호

    # 관계 설정
    first_title = relationship('Title', foreign_keys=[EquippedFirstTitleID])
    last_title = relationship('Title', foreign_keys=[EquippedLastTitleID])

class Fooddetection(db.Model):
    bind_key = 'service_db'
    __tablename = 'Food_detection'

    DetectionID = Column(Integer, primary_key=True)
    UserID = Column(Integer, nullable=True)
    Prompt = Column(String(255), nullable=True)
    Image = Column(LargeBinary)
    Annotated_Img = Column(LargeBinary)