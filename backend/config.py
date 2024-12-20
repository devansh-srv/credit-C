from datetime import timedelta

class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///carbon_credits.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'your-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
