class Config:
    user = "root"
    password = "wsu1234!"
    host = "10.101.96.29"
    port = "3306"
    database = "platform"

    #Maria db
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
    )

    # user = "root"
    # password = "12345678"
    # host = "127.0.0.1"
    # port = "3306"
    # database = "platform"

    # #mysql
    # SQLALCHEMY_DATABASE_URI = (
    #     f"mysql://{user}:{password}@{host}:{port}/{database}"
    # )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'smartplatform'
    GOOGLE_OAUTH2_CLIENT_SECRETS_FILE = 'API/client_secret_.json'
    GOOGLE_OAUTH2_CLIENT_ID = "1021951775935-k5mi217r2uos4j428ficboa3ip55ldrn.apps.googleusercontent.com"
    GOOGLE_OAUTH2_CLIENT_SECRET = "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"