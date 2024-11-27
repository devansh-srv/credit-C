from app import db
from datetime import datetime

class PurchasedCredit(db.Model):
    __tablename__ = 'purchased_credits'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    credit_id = db.Column(db.Integer, db.ForeignKey('credits.id'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    purchase_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    is_expired = db.Column(db.Boolean,default = False)
    creator_id = db.Column(db.Integer,db.ForeignKey('credits.creator_id'),nullable= True)
    creator = db.relationship('User', backref='purchased_credits')

class Transactions(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    credit_id = db.Column(db.Integer, db.ForeignKey('credits.id'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
