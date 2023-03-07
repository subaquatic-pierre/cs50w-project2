from flask import Flask
import os
from flask_socketio import SocketIO
from dotenv import load_dotenv

load_dotenv()

all_rooms = []
active_users = set()

app = Flask(__name__)

# Config app from /home/etc/cs50w/project2/config.json file loaded into config.py class of Config
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY")
# app.config["DEBUG"] = os.getenv("FLASK_DEBUG")


# Unit socketIO
socketio = SocketIO(app)

# Create db model

import chatio.routes
