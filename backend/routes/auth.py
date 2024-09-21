from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user import User
from app import db


auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods = ['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if User.query.filter_by(email = email).first():
        return jsonify({"error":"User already exists"}),400
    new_user = User(username = username, email= email, role = data.get('role', 'buyer'))
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify(new_user.serialize()),200

@auth_bp.route('/login', methods = ['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email = data.get('email')).first()
    if not user or not user.check_password(data.get('password')):
        return jsonify({"error":"Invalid credentials"}),401
    access_token = create_access_token(identity = user.id)
    return jsonify(access_token = access_token),200
