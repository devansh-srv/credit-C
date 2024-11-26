from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.credit import Credit
from app.models.transaction import Transactions
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
    current_user  = get_current_user()
    if current_user.get('role') != 'admin':
        return jsonify({"message": "Unauthorized"}), 403

    if request.method == 'GET':
        credits = Credit.query.filter_by(is_active = True).all()
        return jsonify([{"id": c.id, "name": c.name, "amount": c.amount, "price": c.price,"creator":c.creator_id} for c in credits])

    if request.method == 'POST':
        user_id = User.query.filter_by(username = current_user.get('username')).first()
        user_id = str(user_id)
        data = request.json
        # print(type(user_id))
        new_credit = Credit(name=data['name'], amount=data['amount'], price=data['price'],creator_id = user_id)
        db.session.add(new_credit)
        db.session.commit()
        return jsonify({"message": "Credit created successfully"}), 201

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


