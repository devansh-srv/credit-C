from app import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(200),unique = True,nullable = False)
    email = db.Column(db.String(200), unique = True, nullable = False)
    password_hash = db.Column(db.String(200), nullable = False)
    role = db.Column(db.String(50), nullable = False)

    def set_password(self,password):
        self.password_hash = generate_password_hash(password)
    

    def check_password(self,password):
        return check_password_hash(self.password_hash,password)

