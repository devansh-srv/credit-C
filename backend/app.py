from config import Config
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db = SQLAlchemy(app)
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
