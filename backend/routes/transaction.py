from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.transaction import Transaction
from app import db

transaction_bp = Blueprint('transaction', __name__)

@transaction_bp.route('/', methods = ['POST'])
def create_transaction():
    data = request.get_json()
    new_transcation = Transaction(
        sender_id=data.get('sender_id'),
        receiver_id=data.get('receiver_id'),
        carbon_credit_id=data.get('carbon_credit_id'),
        quantity=data.get('quantity')
    )
    db.session.add(new_transcation)
    db.session.commit()
    return jsonify({"message":"New Transaction Created"}),201

@transaction_bp.route('/', methods = ['GET'])
def get_transaction():
    transactions = Transaction.query.all()
    return jsonify([transaction.serialize() for transaction in transactions]),200
