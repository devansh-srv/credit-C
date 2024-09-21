from app import db

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    carbon_credit_id = db.Column(db.Integer, db.ForeignKey('carbon_credit.id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    def serialize(self):
        return {
            'transaction_id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'carbon_credit_id': self.carbon_credit_id,
            'quantity': self.quantity,
            'created_at':self.created_at,
        }
