from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
from email_validator import validate_email, EmailNotValidError
import os
from dotenv import load_dotenv

# Load env kalo ada
load_dotenv()

app = Flask(__name__)
CORS(app)  # agar tidak kena cors

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///registrations.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# create Database Model
class Registration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    identity_number = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        # di convert ke object
        return {
            'name': self.name,
            'identity_number': self.identity_number,
            'email': self.email,
            'date_of_birth': self.date_of_birth.strftime('%Y-%m-%d')
        }

def validate_registration_data(data):
    errors = {}
    
    # Validate name
    if not data.get('name'):
        errors['name'] = 'Name is required'
    elif len(data['name']) > 100:
        errors['name'] = 'Name must be less than 100 characters'
    
    # Validate identity number
    if not data.get('identityNumber'):
        errors['identityNumber'] = 'Identity number is required'
    elif len(data['identityNumber']) > 20:
        errors['identityNumber'] = 'Identity number must be less than 20 characters'
    
    # Validate email
    try:
        if data.get('email'):
            validate_email(data['email'])
        else:
            errors['email'] = 'Email is required'
    except EmailNotValidError:
        errors['email'] = 'Invalid email format'
    
    # Validate date of birth
    try:
        if not data.get('dateOfBirth'):
            errors['date_of_birth'] = 'Date of birth is required'
        else:
            datetime.strptime(data['dateOfBirth'], '%Y-%m-%d')
    except ValueError:
        errors['date_of_birth'] = 'Invalid date format. Use YYYY-MM-DD'
    
    return errors

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # validasi data input
        validation_errors = validate_registration_data(data)
        if validation_errors:
            return jsonify({
                'status': 'error',
                'message': 'Validation failed',
                'errors': validation_errors
            }), 400
        
        # cek email atau identity number sama dari database
        existing_email = Registration.query.filter_by(email=data['email']).first()
        if existing_email:
            return jsonify({
                'status': 'error',
                'message': 'Email already registered'
            }), 409
        
        existing_identity = Registration.query.filter_by(identity_number=data['identityNumber']).first()
        if existing_identity:
            return jsonify({
                'status': 'error',
                'message': 'Identity number already registered'
            }), 409
        
        # buat data registrasi
        new_registration = Registration(
            name=data['name'],
            identity_number=data['identityNumber'],
            email=data['email'],
            date_of_birth=datetime.strptime(data['dateOfBirth'], '%Y-%m-%d').date()
        )
        
        # Simpan ke database
        db.session.add(new_registration)
        db.session.commit()
        
        # return response dari database tadi
        return jsonify(new_registration.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while processing your request',
            'error': str(e)
        }), 500

# Create database tables
def init_db():
    with app.app_context():
        db.create_all()

if __name__ == '__main__':
    # di panggil dulu buat database
    init_db()
    app.run(debug=True)