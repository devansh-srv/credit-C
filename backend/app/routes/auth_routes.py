from flask import Blueprint, request, jsonify
from app import db, bcrypt, create_access_token
from app.models.user import User
import json
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], email=data['email'], password=hashed_password, role=data['role'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        identity = json.dumps({"username": user.username, "role": user.role})
        access_token = create_access_token(identity=identity)
        return jsonify(access_token=access_token), 200
    return jsonify({"message": "Invalid credentials"}), 401

