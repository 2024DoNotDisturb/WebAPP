class Config:
    user = "root"
    password = "wsu1234!"
    host = "10.101.123.75"
    port = "3306"
    database = "platform"

    #Maria db
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
    )
    # 서비스 DB 설정
    SQLALCHEMY_BINDS = {
    'service_db': f'mysql+pymysql://{user}:{password}@{host}:{port}/service_routine'
    }

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'smartplatform'
    GOOGLE_OAUTH2_CLIENT_SECRETS_FILE = 'API/client_secret_.json'
    GOOGLE_OAUTH2_CLIENT_ID = "1021951775935-k5mi217r2uos4j428ficboa3ip55ldrn.apps.googleusercontent.com"
    GOOGLE_OAUTH2_CLIENT_SECRET = "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"