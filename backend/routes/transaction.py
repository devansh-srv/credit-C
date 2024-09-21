from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.transaction import Transaction
from models.credit import CarbonCredit
from models.user import User
from app import db

transaction_bp = Blueprint('transaction', __name__)


def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(user_id)

@transaction_bp.route('/', methods = ['POST'])
# @jwt_required()
def create_transaction():
    current_user = get_current_user()
    if current_user.role != 'buyer':
        return jsonify({"error":"Unauthorized access"}),403
    data = request.get_json()
    carbon_credit = CarbonCredit.query.get(data.get('credit_id'))

    if not carbon_credit:
        return jsonify({"error": "Carbon credit not found"}), 404

    if carbon_credit.owner_id == current_user.id:
        return jsonify({"error": "You cannot buy your own carbon credits"}), 400
    new_transaction = Transaction(
        sender_id=carbon_credit.owner_id,
        receiver_id=current_user.id,
        carbon_credit_id=carbon_credit.id,
        quantity=data.get('quantity')
    )
    #take ownership
    carbon_credit.owner_id = current_user.id
    db.session.add(new_transcation)
    db.session.commit()
    return jsonify({"message":"New Transaction Created"}),201

@transaction_bp.route('/', methods = ['GET'])
# @jwt_required()
def get_transaction():
    transactions = Transaction.query.all()
    return jsonify([transaction.serialize() for transaction in transactions]),200
