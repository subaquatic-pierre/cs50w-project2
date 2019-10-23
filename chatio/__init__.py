import os, json
from flask import Flask, url_for
from chatio.config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_socketio import SocketIO 

all_rooms = []
active_users = []

app = Flask(__name__)

# Get config seetings from config.json
config = Config()
# Config app from /home/etc/cs50w/project2/config.json file loaded into config.py class of Config
app.config["SECRET_KEY"] = config.SECRET_KEY

# Unit socketIO
socketio = SocketIO(app)

#Create db model
db = SQLAlchemy()

# Handle user sessions with flask_login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'index'
login_manager.login_message_category = 'info'




import chatio.routes