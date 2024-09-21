from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.credit import CarbonCredit
from models.user import User
from app import db


carbon_bp = Blueprint('carbon',__name__)

def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(user_id)

@carbon_bp.route('/',methods =['POST'])
@jwt_required()
def create_carbon_credits():
    current_user = get_current_user()
    if current_user.role not in ['admin']:
        return jsonify({"error":"Unauthorized access"}),403
    data = request.get_json()
    new_credit = CarbonCredit(
        credit_id=data.get('credit_id'),
        owner_id=current_user.id,
        quantity=data.get('quantity')
    )
    db.session.add(new_credit)
    db.session.commit()
    return jsonify({"message": "Carbon credit created"}), 201

@carbon_bp.route('/',methods = ['GET'])
@jwt_required()
def get_carbon_credits():
    credits = CarbonCredit.query.all()
    if len(credits) == 0:
        return jsonify({"error":"no cc"}),404
    return jsonify([credit.serialize() for credit in credits]),200
