from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate 
from dotenv import load_dotenv
import os
import secrets

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_urlsafe(32) 
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = secrets.token_urlsafe(32) 
CORS(app)
app.config['JWT_SECRET_KEY'] = "1d3b5c4a2954c1d15880c3a45005dfe9"
db = SQLAlchemy(app)
migrate = Migrate(app, db)  
jwt = JWTManager(app)


from routes.auth import auth_bp
from routes.carbon import carbon_bp
from routes.transaction import transaction_bp

app.register_blueprint(auth_bp, url_prefix = '/api/auth')
app.register_blueprint(carbon_bp, url_prefix = '/api/carbon')
app.register_blueprint(transaction_bp, url_prefix = '/api/transaction')

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
