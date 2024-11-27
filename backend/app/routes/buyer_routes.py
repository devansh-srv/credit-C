from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.credit import Credit
from app.models.transaction import PurchasedCredit
from app.models.transaction import Transactions
from app.utilis.certificate_generator import generate_certificate_data
import json
from app import db

buyer_bp = Blueprint('buyer_bp', __name__)
def get_current_user():
    try:
        return json.loads(get_jwt_identity())
    except json.JSONDecodeError:
        return None

@buyer_bp.route('/api/buyer/credits', methods=['GET'])
@jwt_required()
def buyer_credits():
    credits = Credit.query.filter_by(is_active =True).all()
    return jsonify([{"id": c.id, "name": c.name, "amount": c.amount, "price": c.price,"creator":c.creator_id} for c in credits])

@buyer_bp.route('/api/buyer/purchase', methods=['POST'])
@jwt_required()
def purchase_credit():
    current_user  = get_current_user()
    if not current_user:
        return jsonify({"message" : "Invalid token"}),401
    data = request.json
    credit = Credit.query.get(data['credit_id'])
    if credit :
        user = User.query.filter_by(username=current_user['username']).first()
        purchased_credit = PurchasedCredit(
            user_id=user.id, 
            credit_id=credit.id, 
            amount=credit.amount,
            creator_id=credit.creator_id
        )
        
        transaction = Transactions(
            buyer_id=user.id,
            credit_id=credit.id,
            amount=credit.amount,
            total_price=credit.price 
        )
        credit.is_active = False
        # db.session.delete(credit)
        db.session.add(purchased_credit)
        db.session.add(transaction)
        db.session.commit()
        return jsonify({"message": "Credit purchased successfully"}), 200
    return jsonify({"message": "Invalid purchase"}), 400

@buyer_bp.route('/api/buyer/purchased', methods=['GET'])
@jwt_required()
def get_purchased_credits():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"message": "Invalid token"}), 401

    user = User.query.filter_by(username=current_user['username']).first()
    purchased_credits = PurchasedCredit.query.filter_by(user_id=user.id).all()
    credits = []
    for pc in purchased_credits:
        credit = Credit.query.get(pc.credit_id)
        creator = User.query.get(pc.creator_id) if pc.creator_id else None
        credits.append({
            "id": credit.id,
            "name": credit.name,
            "amount": pc.amount,
            "price": credit.price,
            "creator": {
                "id": creator.id,
                "username": creator.username,
                "email": creator.email
            } if creator else None
        })
    return jsonify(credits)

@buyer_bp.route('/api/buyer/generate-certificate/<int:purchase_id>', methods=['GET'])
@jwt_required()
def generate_certificate(purchase_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({"message": "Invalid token"}), 401
    
    user = User.query.filter_by(username=current_user['username']).first()
    purchased_credit = PurchasedCredit.query.filter_by(id=purchase_id, user_id=user.id).first()
    if not purchased_credit:
        return jsonify({"message": "Purchase not found"}), 404

    credit = Credit.query.get(purchased_credit.credit_id)
    if credit is None:
        return jsonify({"message":"No such credit found"}),404
    creator = User.query.get(purchased_credit.creator_id) if purchased_credit.creator_id else None
    
    certificate_data = generate_certificate_data(purchase_id, user, purchased_credit, credit) if credit.is_expired else None
    if certificate_data is None:
        return jsonify({"message":f"No credit with {credit.id} has expired"}), 404
    certificate_data['creator'] = {
        "id": creator.id,
        "username": creator.username,
        "email": creator.email
    } if creator else None
    
    return jsonify(certificate_data), 200

