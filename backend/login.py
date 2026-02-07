from database import users

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/login', methods=['POST'])
def login():
    data_from_fe = request.json 
    
    username_to_check = data_from_fe.get('username')
    pass_to_check = data_from_fe.get('password')

    for user in users:
        if user['username'] == username_to_check and user['password'] == pass_to_check:
            return jsonify({"status": 200, "message": "Logging you in"}), 200

    return jsonify({"status": 401, "message": "Wrong password"}), 401
