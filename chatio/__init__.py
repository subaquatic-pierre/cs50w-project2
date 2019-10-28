from flask import Flask
from chatio.config import Config
from flask_socketio import SocketIO 

all_rooms = []
active_users = set()

app = Flask(__name__)

# Get config seetings from config.json
config = Config()
# Config app from /home/etc/cs50w/project2/config.json file loaded into config.py class of Config
app.config["SECRET_KEY"] = config.SECRET_KEY

# Unit socketIO
socketio = SocketIO(app)

#Create db model

import chatio.routes