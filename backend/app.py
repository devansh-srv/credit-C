from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

app = Flask(__name__)
CORS(app)


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///carbon_credits.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)


db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)

class Credit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

class PurchasedCredit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    credit_id = db.Column(db.Integer, db.ForeignKey('credit.id'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)

    purchase_date = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())

class Transactions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    credit_id = db.Column(db.Integer, db.ForeignKey('credit.id'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())

    buyer = db.relationship('User', backref='transactions')
    credit = db.relationship('Credit', backref='transactions')


@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], email=data['email'], password=hashed_password, role=data['role'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity={"username": user.username, "role": user.role})
        return jsonify(access_token=access_token), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/api/admin/credits', methods=['GET', 'POST'])
@jwt_required()
def admin_credits():
    current_user = get_jwt_identity()
    if current_user['role'] != 'admin':
        return jsonify({"message": "Unauthorized"}), 403

    if request.method == 'GET':
        credits = Credit.query.all()
        return jsonify([{"id": c.id, "name": c.name, "amount": c.amount, "price": c.price} for c in credits])
    
    if request.method == 'POST':
        data = request.json
        new_credit = Credit(name=data['name'], amount=data['amount'], price=data['price'])
        db.session.add(new_credit)
        db.session.commit()
        return jsonify({"message": "Credit created successfully"}), 201

@app.route('/api/buyer/credits', methods=['GET'])
@jwt_required()
def buyer_credits():
    credits = Credit.query.all()
    return jsonify([{"id": c.id, "name": c.name, "amount": c.amount, "price": c.price} for c in credits])

@app.route('/api/buyer/purchase', methods=['POST'])
@jwt_required()
def purchase_credit():
    current_user = get_jwt_identity()
    data = request.json
    credit = Credit.query.get(data['credit_id'])
    if credit and credit.amount >= data['amount']:
        user = User.query.filter_by(username=current_user['username']).first()
        purchased_credit = PurchasedCredit(
            user_id=user.id, 
            credit_id=credit.id, 
            amount=data['amount']
        )
        credit.amount -= data['amount']
        
        transaction = Transactions(
            buyer_id=user.id,
            credit_id=credit.id,
            amount=data['amount'],
            total_price=credit.price * data['amount']
        )
        
        db.session.add(purchased_credit)
        db.session.add(transaction)
        db.session.commit()
        return jsonify({"message": "Credit purchased successfully"}), 200
    return jsonify({"message": "Invalid purchase"}), 400

@app.route('/api/buyer/purchased', methods=['GET'])
@jwt_required()
def get_purchased_credits():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()
    purchased_credits = PurchasedCredit.query.filter_by(user_id=user.id).all()
    purchase_date = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    credits = []
    for pc in purchased_credits:
        credit = Credit.query.get(pc.credit_id)
        credits.append({
            "id": credit.id,
            "name": credit.name,
            "amount": pc.amount,
            "price": credit.price
        })
    return jsonify(credits)

@app.route('/api/admin/transactions', methods=['GET'])
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
            "buyer": t.buyer.username,
            "credit": t.credit.name,
            "amount": t.amount,
            "total_price": t.total_price,
            "timestamp": t.timestamp.isoformat()
        })
    return jsonify(transaction_list)

@app.route('/api/buyer/generate-certificate/<int:purchase_id>', methods=['GET'])
@jwt_required()
def generate_certificate(purchase_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user['username']).first()
    
    purchased_credit = PurchasedCredit.query.filter_by(id=purchase_id, user_id=user.id).first()
    if not purchased_credit:
        return jsonify({"message": "Purchase not found"}), 404
    
    credit = Credit.query.get(purchased_credit.credit_id)
    
    certificate_data = {
        "certificate_id": f"CC-{purchase_id}-{user.id}",
        "buyer_name": user.username,
        "credit_name": credit.name,
        "amount": purchased_credit.amount,
        "purchase_date": purchased_credit.purchase_date.strftime("%Y-%m-%d"),
        "certificate_html": f"""
            <div style="border: 2px solid #2c3e50; padding: 20px; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <h1 style="text-align: center; color: #2c3e50;">Carbon Credit Certificate</h1>
                <div style="text-align: center; margin-bottom: 20px;">
                    <p>This certifies that</p>
                    <h2>{user.username}</h2>
                    <p>has purchased</p>
                    <h3>{purchased_credit.amount} {credit.name}</h3>
                    <p>on {purchased_credit.purchase_date.strftime("%B %d, %Y")}</p>
                </div>
                <div style="margin-top: 40px; text-align: center;">
                    <p>Certificate ID: CC-{purchase_id}-{user.id}</p>
                </div>
            </div>
        """
    }
    
    return jsonify(certificate_data), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
