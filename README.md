# 스마트 루틴 관리 서비스 : 해방
<img width="682" alt="스크린샷 2024-07-26 11 26 28" src="https://github.com/user-attachments/assets/d068fb2c-b166-479b-b159-6cb9fde6f885">

## 문제 정의와 해결책 Problems and Solutions
**[현대 사회의 주도성 상실]**
- 도파민 중독과 숏컨텐츠 소비   
오늘날 많은 사람들은 소셜 미디어와 짧은 동영상 콘텐츠에 중독되어 있습니다. TikTok, Instagram Reels 등에서 끊임없이 새로운 콘텐츠를 소비하는 현상은 사람들이 주도적으로 시간을 관리하지 못하고 시스템에 지배당하는 대표적인 사례입니다. 이는 도파민을 빠르게 분비시켜 일시적인 즐거움을 주지만, 장기적으로는 집중력 저하와 생산성 감소를 초래합니다. 더하여, 스마트폰의 과도한 사용은 인간관계의 질 저하, 수면 장애, 불안감 증가 등의 문제도 야기합니다.
   
- 과도한 기술 의존   
GPT와 같은 인공지능 기술이 발전하면서, 사람들이 스스로 의사결정을 내리는 대신 인공지능에게 의존하는 경향이 강해지고 있습니다. 이는 개인의 판단력과 문제 해결 능력을 저하시킬 수 있습니다. 인간의 자기 결정 능력이 부족하면 1번에서 언급한 ‘중독’ 문제가 발생하더라도 스스로 중독으로부터 벗어나기 어렵습니다.
   
- 주도적인 삶의 개척   
이러한 배경에서 ‘스마트집사 플랫폼 : 해방’과 ‘스마트루틴 서비스’를 고안하게 되었습니다. 인간이 주도적인 삶을 영위할수 있도록 **사용자가 스스로 루틴을 설정하고 수행하며 도파민 중독으로부터 벗어나는 것**이 우리의 목표입니다.

## 핵심 기능 Key functions
**사용자 관리 플랫폼** '유온'과 **사용자 루틴 관리 서비스** '해방'으로 나누어 개발을 진행했습니다.    
- 유온 : 사용자 회원가입, 로그인   
- 유온 : 사용자 프로필 관리(AI 프로필 이미지 생성 서비스)
- 해방 : 사용자 루틴 설정
- 해방 : 루틴 시간대에 맞추어 알람
- 해방 : 루틴 수행 감지 시스템(인증샷 촬영 후 AI가 감지 or 스마트홈 센서로 감지)
- 해방 : 사용자 칭호 시스템(루틴을 수행하며 히든 미션 성공 시 칭호 획득) 
<img width="681" alt="스크린샷 2024-07-26 11 31 37" src="https://github.com/user-attachments/assets/1d165bc4-7b6c-4dd6-a326-afe67c82d643">
<img width="681" alt="스크린샷 2024-07-26 11 31 51" src="https://github.com/user-attachments/assets/fd52fb1d-ddfd-43a4-b605-8c479a8e50c1">
<img width="682" alt="스크린샷 2024-07-26 11 32 07" src="https://github.com/user-attachments/assets/cb0a6b1c-b0f8-4557-8b64-a70b563ecf19">
<img width="681" alt="스크린샷 2024-07-26 11 40 36" src="https://github.com/user-attachments/assets/1d18b820-79e8-4ef5-bce2-c1514f03d1cd">
<img width="682" alt="스크린샷 2024-07-26 11 40 50" src="https://github.com/user-attachments/assets/cc07c3c8-62a3-4fc0-abee-00120cbdd945">
<img width="680" alt="스크린샷 2024-07-26 11 41 02" src="https://github.com/user-attachments/assets/418ba835-74f0-4eee-89cd-78d1d89caa3c">

## 사용한 AI model
### GroundingDINO
**DroundingDINO는 Zero-shot learning 기반 Object Detection 모델입니다.**     
- 식사루틴 수행 감지 역할
- 텍스트 프롬프트(음식명)과 인증샷 이미지(음식사진)을 입력받아 사용자의 루틴 수행 감지
- 비지도학습이지만, Transformer 기반 아키텍처로 좋은 성능을 보임
- 사용자 : 자연스럽게 식단 일지 작성과 식습관 회고
- 관리자 : 번거로운 인증샷 검사 과정 자동화 
![스크린샷 2024-08-06 10 04 32](https://github.com/user-attachments/assets/57d29615-80ef-46f8-a12f-65d112990cf6)
![스크린샷 2024-08-06 10 11 07](https://github.com/user-attachments/assets/57000457-50ed-4e8b-93d5-930c00ccdee4)
![스크린샷 2024-08-06 10 12 13](https://github.com/user-attachments/assets/1e174dfb-6780-4e8f-b62a-e846354ce37d)
![스크린샷 2024-08-06 10 12 31](https://github.com/user-attachments/assets/51ecab9e-df70-434a-b20e-83d3c8bf6417)
   
   
### Stable Diffusion
**프로필 이미지 생성 AI는 **Stable diffusion**을 사용했습니다.**    
- 오픈소스 이미지 생성 모델로, Text to Image 모델을 사용

![스크린샷 2024-08-06 10 13 50](https://github.com/user-attachments/assets/ac39ec13-fe82-4cb3-9a91-02096b918338)
![스크린샷 2024-08-06 10 14 10](https://github.com/user-attachments/assets/fc81c7b6-6b82-4157-8409-60586760f005)

## 제작한 스마트홈 회로도
![스크린샷 2024-08-12 10 08 47](https://github.com/user-attachments/assets/d71d9906-d11a-4876-86a7-3962c4c34950)

## 팀 소개
![스크린샷 2024-08-06 10 23 58](https://github.com/user-attachments/assets/3b7067c3-259a-4727-9bf0-c247ae365775)


|팀장/프로젝트 기획 및 관리|웹 개발|스마트홈 개발|AI 개발|
|:---:|:---:|:---:|:---:|
| [김윤정](https://github.com/kingodjerry) | [이지현](https://github.com/jh226) | [유태양](https://github.com/IAMYUTAEYANG) |  [최원진](https://github.com/onejin123) |

## 사용 도구와 언어 Tools and Stacks
<img width="793" alt="스크린샷 2024-07-27 21 13 35" src="https://github.com/user-attachments/assets/0b33bd5d-7762-43de-bb82-d988625d4e69">


## 코드 사용법
1. git clone   
```git clone https://github.com/2024DoNotDisturb/WebAPP.git```   

2. 가상환경 생성 후 requirements download   
```pip install requirements.txt```   
각자 환경이 다르므로 패키지 충돌이 일어날 수 있습니다. Werkzeug 패키지는 2.2.2 버전 추천합니다.

3. GroundingDINO 모델 clone 및 가중치 파일 다운로드   
```git clone https://github.com/IDEA-Research/GroundingDINO.git```   
```wget https://github.com/IDEA-Research/GroundingDINO/releases/download/v0.1.0-alpha/groundingdino_swint_ogc.pth```   
설치한 후, ```cd GroungindDINO```폴더로 이동해서 ```pip install -e .```   

5. ```config.py```와  ```key.py```, ```firebase-adminsdk.json```이 필요하나, 보안의 이유로 팀 메신저로 공유하도록 합니다.   

6. ```FLASKA_APP=app.py``` 로 지정   

7. ```flask run```

## 파일 구조 File Tree
```
 WebAPP
 ┣ main                                               # Backend 관련 파일
 ┃ ┣ auth.py                                          # 로그인
 ┃ ┣ dashboard.py                                     # 관리자 대시보드
 ┃ ┣ fcm.py                                           # 루틴 알람
 ┃ ┣ food.py                                          # GroundingDINO - 루틴 수행 감지
 ┃ ┣ generate_ai.py                                   # Stable Diffusion - AI 프로필 이미지 생성
 ┃ ┣ profile.py                                       # 프로필 관리
 ┃ ┣ routine_home.py                                  # 홈 화면 관리
 ┃ ┣ routine_schedule.py                              # 루틴 리스트 관리
 ┃ ┣ smarthome.py                                     # 스마트홈 리모컨
 ┃ ┣ title.py                                         # 사용자 칭호 관리
 ┃ ┗ views.py                                         # 화면 관리
 ┣ model                                              # Database 관련 파일
 ┃ ┣ google.py                                        # 구글 로그인 관리
 ┃ ┣ model_platform.py                                # DB 연결 - platform
 ┃ ┗ model_routine.py                                 # DB 연결 - routine_service
 ┣ GorundingDINO                                      # git clone GroundingDINO 
 ┣ src
 ┃ ┗ groundingdino
 ┣ static                                             # Frontend 관련 파일
 ┃ ┣ css                                              # css 파일
 ┃ ┃ ┣ Platform
 ┃ ┃ ┃ ┣ account.css
 ┃ ┃ ┃ ┣ dashboard.css
 ┃ ┃ ┃ ┣ home.css
 ┃ ┃ ┃ ┣ login.css
 ┃ ┃ ┃ ┣ m_login.css
 ┃ ┃ ┃ ┗ sidebar.css
 ┃ ┃ ┗ SmartRoutine
 ┃ ┃ ┃ ┣ control_home.css
 ┃ ┃ ┃ ┣ loading.css
 ┃ ┃ ┃ ┣ routine.css
 ┃ ┃ ┃ ┗ routine_notice.css
 ┃ ┣ js                                                # js 파일
 ┃ ┃ ┣ Platform
 ┃ ┃ ┃ ┣ account.js
 ┃ ┃ ┃ ┣ dashboard.js
 ┃ ┃ ┃ ┣ home.js
 ┃ ┃ ┃ ┣ login.js
 ┃ ┃ ┃ ┣ m_login.js
 ┃ ┃ ┃ ┗ sidebar.js
 ┃ ┃ ┣ SmartRoutine
 ┃ ┃ ┃ ┣ control_home.js
 ┃ ┃ ┃ ┣ loading.js
 ┃ ┃ ┃ ┣ routine.js
 ┃ ┃ ┃ ┗ routine_notice.js
 ┃ ┃ ┣ fcm.js
 ┃ ┃ ┗ firebase-messaging-sw.js
 ┃ ┗ src              
 ┣ templates                                            # html 파일
 ┃ ┣ Platform
 ┃ ┃ ┣ account.html
 ┃ ┃ ┣ dashboard.html
 ┃ ┃ ┣ donotdisturb.html
 ┃ ┃ ┣ error.html
 ┃ ┃ ┣ home.html
 ┃ ┃ ┣ introdeveloper.html
 ┃ ┃ ┣ introservice.html
 ┃ ┃ ┣ login.html
 ┃ ┃ ┗ m_login.html
 ┃ ┣ SmartRoutine
 ┃ ┃ ┣ control_home.html
 ┃ ┃ ┣ loading.html
 ┃ ┃ ┣ routine.html
 ┃ ┃ ┗ routine_notice.html
 ┃ ┗ layouts
 ┃ ┃ ┣ layout.html
 ┃ ┃ ┗ layout_routine.html
 ┣ app.py                                                # flask server 실행 파일
 ┣ config.py                                             # DB 환경 설정 파일
 ┣ firebase-adminsdk.json                                # 알람 관련 파일
 ┣ key.py                                                # 사용되는 key 관리 파일
 ┗ requirements.txt
```
