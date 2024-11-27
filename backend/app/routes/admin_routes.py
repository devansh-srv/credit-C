from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.credit import Credit
from app.models.transaction import PurchasedCredit, Transactions
from app.models.user import User
import json
admin_bp = Blueprint('admin', __name__)
def get_current_user():
    try:
        return json.loads(get_jwt_identity())
    except json.JSONDecodeError:
        return None
@admin_bp.route('/api/admin/credits', methods=['GET', 'POST'])
@jwt_required()
def manage_credits():
    current_user = get_current_user()
    if current_user.get('role') != 'admin':
        return jsonify({"message": "Unauthorized"}), 403

    user = User.query.filter_by(username=current_user.get('username')).first()

    # Ensure only credits created by this admin are visible
    if request.method == 'GET':
        credits = Credit.query.filter_by(creator_id=user.id).all()
        return jsonify([{
            "id": c.id,
            "name": c.name,
            "amount": c.amount,
            "price": c.price,
            "is_active": c.is_active,
            "is_expired": c.is_expired,
            "creator_id": c.creator_id
        } for c in credits]), 200

    # Allow the admin to create new credits
    if request.method == 'POST':
        data = request.json
        new_credit = Credit(
            name=data['name'], 
            amount=data['amount'], 
            price=data['price'], 
            creator_id=user.id
        )
        db.session.add(new_credit)
        db.session.commit()
        return jsonify({"message": "Credit created successfully"}), 201

@admin_bp.route('/api/admin/credits/expire/<int:credit_id>', methods=['PATCH'])
@jwt_required()
def expire_credit(credit_id):
    current_user = get_current_user()
    if current_user.get('role') != 'admin':
        return jsonify({"message": "Unauthorized"}), 403

    user = User.query.filter_by(username=current_user.get('username')).first()
    credit = Credit.query.get(credit_id)
    pc = PurchasedCredit.query.get(credit_id)
    if not credit:
        return jsonify({"message": "Credit not found"}), 404

    # Ensure only the creator admin can expire the credit
    if credit.creator_id != user.id:
        return jsonify({"message": "You do not have permission to expire this credit"}), 403

    # Expire the credit
    credit.is_active = False
    credit.is_expired = True
    pc.is_expired = True
    db.session.commit()
    return jsonify({"message": "Credit expired successfully"}), 200

@admin_bp.route('/api/admin/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    current_user = get_current_user()
    if current_user.get('role') != 'admin':
        return jsonify({"message": "Unauthorized"}), 403

    transactions = Transactions.query.order_by(Transactions.timestamp.desc()).all()
    transaction_list = []
    for t in transactions:
        transaction_list.append({
            "id": t.id,
            "buyer": t.buyer_id,
            "credit": t.credit_id,
            "amount": t.amount,
            "total_price": t.total_price,
            "timestamp": t.timestamp.isoformat()
        })
    return jsonify(transaction_list)


