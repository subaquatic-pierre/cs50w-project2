from chatio.routes import all_rooms
from chatio import all_rooms, active_users

##### MODELS #####

class User:
    pass

class Room:

    def __init__(self, name):
        self.name = name
        self.users = []
        self.all_msgs = []
        all_rooms.append(self)

    def add_msg(self, msg, user, time):
        if len(self.all_msgs) == 100:
            self.all_msgs.remove(self.all_msgs[0])
        self.all_msgs.append({'msg':msg, 'username':user, 'time':time})
            

    def del_room(self):
        if self in all_rooms:
            all_rooms.remove(self)

    def del_user(self, user):
        if user in self.users:
            self.users.remove(user)

    def add_user(self, user):
        self.users.append(user)

    def __repr__(self):
        return f"Room:( name: {self.name}, users:{self.users})"

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

# Create dummy messages

for i in range(1, 4):    
    scuba_r.add_msg(f'This is a message {i}', f'the user {i}',f'the time {i}')
    fishes_r.add_msg(f'This is a message {i}', f'the user {i}',f'the time {i}')
    sharks_r.add_msg(f'This is a message {i}', f'the user {i}',f'the time {i}')
    dolphins_r.add_msg(f'This is a message {i}', f'the user {i}',f'the time {i}')
    turtles_r.add_msg(f'This is a message {i}', f'the user {i}',f'the time {i}')


