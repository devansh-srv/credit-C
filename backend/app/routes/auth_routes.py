# auth_routes.py
from flask import Blueprint, request, jsonify, current_app
from app import db, bcrypt
from flask_jwt_extended import  create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.models.user import User
from datetime import datetime, timedelta, timezone
import traceback

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/user', methods=['GET'])
@jwt_required()
def get_user():
    try:
        # Log the request details
        current_app.logger.info(f"User verification request received")
        
        # Get current user identity from JWT
        current_user = get_jwt_identity()
        
        # Get the JWT object
        jwt = get_jwt()
        
        current_app.logger.info(f"JWT Identity: {current_user}")
        current_app.logger.info(f"JWT Claims: {jwt}")
        
        # Check if token is about to expire (optional)
        now = datetime.now(timezone.utc)
        exp_timestamp = datetime.fromtimestamp(jwt["exp"], tz=timezone.utc)
        
        # Get user from database
        user = User.query.filter_by(username=current_user['username']).first()
        
        if not user:
            current_app.logger.error(f"User not found: {current_user['username']}")
            return jsonify({"error": "User not found"}), 404
            
        response_data = {
            "username": user.username,
            "role": user.role,
            "email": user.email
        }
        
        # If token is about to expire, generate new one
        if exp_timestamp - now < timedelta(minutes=10):
            new_token = create_access_token(identity={"username": user.username, "role": user.role})
            response_data["new_token"] = new_token
            current_app.logger.info("Generated new token due to expiration")
            
        return jsonify(response_data), 200
        
    except Exception as e:
        current_app.logger.error(f"User verification error: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({"error": "Authentication failed", "details": str(e)}), 401


@auth_bp.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({"error": "Missing username or password"}), 400
            
        user = User.query.filter_by(username=data['username']).first()
        
        if user and bcrypt.check_password_hash(user.password, data['password']):
            access_token = create_access_token(
                identity={"username": user.username, "role": user.role}
            )
            
            return jsonify({
                "token": access_token,
                "username": user.username,
                "role": user.role,
                "email": user.email
            }), 200
        
        return jsonify({"error": "Invalid credentials"}), 401
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'role']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
            
        # Check if username already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"error": "Username already exists"}), 409
            
        # Check if email already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email already exists"}), 409
            
        # Validate role
        if data['role'] not in ['admin', 'buyer']:
            return jsonify({"error": "Invalid role"}), 400
            
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        new_user = User(
            username=data['username'],
            email=data['email'],
            password=hashed_password,
            role=data['role']
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"message": "User created successfully"}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500