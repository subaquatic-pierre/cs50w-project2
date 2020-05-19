from flask import Flask
from flask_socketio import SocketIO 

all_rooms = []
active_users = set()

app = Flask(__name__)

# Config app from /home/etc/cs50w/project2/config.json file loaded into config.py class of Config
app.config["SECRET_KEY"] = 'supersecterkey'

# Unit socketIO
socketio = SocketIO(app)

#Create db model

import chatio.routes