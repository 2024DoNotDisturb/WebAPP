# 스마트 루틴 관리 APP : 해방

## 코드 사용법
1. git clone   
```git clone https://github.com/2024DoNotDisturb/WebAPP.git```   

2. 가상환경 생성 후 requirements download   
```pip install requirements.txt```   
각자 환경이 다르므로 패키지 충돌이 일어날 수 있습니다. Werkzeug 패키지는 2.2.2 버전 추천합니다.

3. Grounding DINO 모델 clone 및 가중치 파일 다운로드   
```git clone https://github.com/IDEA-Research/GroundingDINO.git```
```wget https://github.com/IDEA-Research/GroundingDINO/releases/download/v0.1.0-alpha/groundingdino_swint_ogc.pth```

4. ```config.py```와  ```key.py```, ```firebase-adminsdk.json```이 필요하나, 보안의 이유로 팀 메신저로 공유하도록 합니다.   

5. ```FLASKA_APP=app.py``` 로 지정   

6. ```flask run```
