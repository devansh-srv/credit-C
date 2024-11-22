from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from datetime import timedelta
from config import Config
import logging

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    logging.basicConfig(level=logging.INFO)
    
    # JWT Configuration
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)  # Set token expiration
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
    
    # CORS Configuration
    CORS(app, 
         resources={
             r"/api/*": {
                 "origins": ["http://localhost:3000"],  # Replace with your React app URL
                 "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                 "allow_headers": ["Content-Type", "Authorization"],
                 "supports_credentials": True
             }
         })
    
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    # Register blueprints
    from .routes.auth_routes import auth_bp
    from .routes.admin_routes import admin_bp
    from .routes.buyer_routes import buyer_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(buyer_bp)
    
    with app.app_context():
        db.create_all()
    
    return app