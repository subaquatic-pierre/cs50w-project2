from chatio import app, socketio
from dotenv import load_dotenv
import os

load_dotenv()


if __name__ == "__main__":
    socketio.run(app, host=os.getenv("FLASK_HOST"), port=int(os.getenv("FLASK_PORT")))
