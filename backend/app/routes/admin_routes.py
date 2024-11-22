from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.credit import Credit
from app.models.transaction import Transactions

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/api/admin/credits', methods=['GET', 'POST'])
@jwt_required()
def manage_credits():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({"message": "Unauthorized"}), 403

    if request.method == 'GET':
        credits = Credit.query.filter_by(is_active = True).all()
        return jsonify([{"id": c.id, "name": c.name, "amount": c.amount, "price": c.price} for c in credits])

    if request.method == 'POST':
        data = request.json
        new_credit = Credit(name=data['name'], amount=data['amount'], price=data['price'])
        db.session.add(new_credit)
        db.session.commit()
        return jsonify({"message": "Credit created successfully"}), 201
@admin_bp.route('/api/admin/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
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
