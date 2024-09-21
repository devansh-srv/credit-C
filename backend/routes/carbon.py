from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.carbon_credit import CarbonCredit
from app import db


carbon_bp = Blueprint('carbon',__name__)

@carbon_bp.route('/',methods =['POST'])
def create_carbon_credits():
    data = request.get_json()
    new_credit = CarbonCredit(
        credit_id=data.get('credit_id'),
        owner_id=data.get('owner_id'),
        quantity=data.get('quantity')
    )
    db.session.add(new_credit)
    db.session.commit()
    return jsonify({"message": "Carbon credit created"}), 201

@carbon_bp.route('/',methods = ['GET'])
def get_carbon_credits():
    credits = CarbonCredit.query.all()
    return jsonify([credit.serialize() for credit in credits]),200
