from app import db

class CarbonCredit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    credit_id = db.Column(db.String(100), unique=True, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    def serialize(self):
        return {
            'id': self.id,
            'credit_id': self.credit_id,
            'quantity': self.quantity,
            'created_at': self.created_at,
        }
