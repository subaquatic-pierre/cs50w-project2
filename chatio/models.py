from chatio.routes import all_rooms
from flask_login import UserMixin, login_user, logout_user, current_user
from chatio import login_manager, all_rooms, active_users

##### MODELS #####

class User(UserMixin):
    pass

class Room:

    def __init__(self, name):
        self.name = name
        self.users = []
        all_rooms.append(self)

    def del_room(self):
        if self in all_rooms:
            all_rooms.remove(self)

    def del_user(self, user):
        if user in self.users:
            self.users.remove(user)

    def add_user(self, user):
        self.users.append(user)

    def __repr__(self):
        return f"Room:( name: {self.name}, users:{self.users} )"

##### UTILS #####

def find_room(room):
    for i in all_rooms:
        if i.name == room:
            return i

# Create rooms on startup
scuba_r = Room('scuba')
fishes_r = Room('fishes')
sharks_r = Room('sharks')
dolphins_r = Room('dolphins')
turtles_r = Room('turtles')

# Login manager decorator paths
@login_manager.user_loader
def user_loader(username):
    user = User()
    user.id = username
    return user


@login_manager.request_loader
def request_loader(request):
    user = User()
    user.id = request.form.get('username')
    return user