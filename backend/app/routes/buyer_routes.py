from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.credit import Credit
from app.models.transaction import PurchasedCredit
from app.models.transaction import Transactions
from app.utilis.certificate_generator import generate_certificate_data
from app import db

buyer_bp = Blueprint('buyer_bp', __name__)

@buyer_bp.route('/api/buyer/credits', methods=['GET'])
@jwt_required()
def buyer_credits():
    credits = Credit.query.filter_by(is_active =True).all()
    return jsonify([{"id": c.id, "name": c.name, "amount": c.amount, "price": c.price} for c in credits])

@buyer_bp.route('/api/buyer/purchase', methods=['POST'])
@jwt_required()
def purchase_credit():
    current_user = get_jwt_identity()
    data = request.json
    credit = Credit.query.get(data['credit_id'])
    if credit :
        user = User.query.filter_by(username=current_user['username']).first()
        purchased_credit = PurchasedCredit(
            user_id=user.id, 
            credit_id=credit.id, 
            amount=credit.amount
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
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()
    purchased_credits = PurchasedCredit.query.filter_by(user_id=user.id).all()
    credits = []
    for pc in purchased_credits:
        credit = Credit.query.get(pc.credit_id)
        credits.append({
            "id": credit.id,
            "name": credit.name,
            "amount": pc.amount,
            "price": credit.price
        })
        db.session.delete(credit)
    return jsonify(credits)

@buyer_bp.route('/api/buyer/generate-certificate/<int:purchase_id>', methods=['GET'])
@jwt_required()
def generate_certificate(purchase_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()
    
    purchased_credit = PurchasedCredit.query.filter_by(id=purchase_id, user_id=user.id).first()
    if not purchased_credit:
        return jsonify({"message": "Purchase not found"}), 404
    
    credit = Credit.query.get(purchased_credit.credit_id)
    certificate_data = generate_certificate_data(purchase_id, user, purchased_credit, credit)
    
    return jsonify(certificate_data), 200
